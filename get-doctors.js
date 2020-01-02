const fs = require('fs');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const Places = require('./database/Places');
const Request = require('./database/Request');
const results = [];

(async () => {
  let data = await Request.findAll({
    where: {
      checked: false,
      Estado: 'MS'
    },
  });
  
  asyncForEach(data, async item => {
    const browser = await puppeteer.launch({headless: true});
    let page = null;
  
    //Set plan
    var keepGoing = false;
    while(!keepGoing) {
      try {
        page = await browser.newPage();
  
        await page.setContent(getRequestForm(item.dataValues));
        await page.click('input[type=submit]');
        await page.waitForSelector('a[data-descricao-filtro="Medicina Completo"]', {
          timeout: 10000
        });
        keepGoing = true;
      } catch(error) {
        try {
          await page.waitForSelector('.cabecalho-filtro', {
            timeout: 1000
          });
          await item.update({
            checked: true
          });
          await browser.close();
          return;
        } catch(error) {
          console.log('Error: ', error);
        }
        await page.close();
        console.log('Error: ', error);
      }
    }
    await page.click('a[data-descricao-filtro="Medicina Completo"]');
    await page.waitFor(1000);
  
    //Set order
    await page.waitForSelector('.combobox-ordenar-por');
    const orderFilter = await page.$('.combobox-ordenar-por');
    await orderFilter.type("nome");
    await page.waitFor(1000);
  
    const response = [];
    let haveNextPage = true;
    while(haveNextPage) {
      response.push(await page.evaluate(() => document.documentElement.outerHTML));
  
      try {
        await page.waitForSelector(".pagination .PagedList-skipToNext a[href]", {
          timeout: 1000
        });
      } catch(error) {
        haveNextPage = false;
        break;
      }
  
      await page.click('.pagination .PagedList-skipToNext a');
      await page.waitFor(1000);
    }
  
    await browser.close();
    
    extractDoctors(response, item.dataValues);

    await item.update({
      checked: true
    });

  });
  
  function getRequestForm(data) {
    let form = '';
    for(key in data) {
      form += `<input type="hidden" name="${key}" value="${data[key] || ""}" />`;
    }
    form = `
      <form action="https://app360.omint.com.br/OmintRedev2018/Redecredenciada/Localizacao/BuscaRegiao" method="post">
        ${form}
        <input type="submit" />
      </form>
    `;
  
    return form;
  }
  
  function extractDoctors(htmlArray, info) {
    htmlArray.forEach(html => {
      const $ = cheerio.load(html);
  
      $('.table-result td').each(async (i, el) => {
        let data = {
          name: $('.span-texto-conteudo-prestador', el).text().trim(),
          address: $('.endereco-completo', el).text().trim().replace(/\s{2,}|\\n/g, ''),
          state: info.Estado,
          city: info.Cidade,
          specialty_code: info.CodigoEspecialidade,
          specialty: info.Especialidade,
          category: info.TipoAtendimento,
          latidude: null,
          longitude: null
        };
  
        await Places.create(data);
        results.push(data);
      });
    });
    
    fs.writeFile('files/Places.txt', JSON.stringify(results), error => {
      if(error) throw error;
    });
  }

  async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  }
})();