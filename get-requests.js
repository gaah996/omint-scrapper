const request = require('request');
const cheerio = require('cheerio');
const axios = require('axios');
const fs = require('fs');
const Request = require('./database/Request');
const requests = [];
const baseURL = 'https://app360.omint.com.br';
const categoriesUrl = baseURL + '/OmintRedev2018/Redecredenciada/BuscaPrestadores/BuscaAvancada';

let errorHandler = error => {
  console.log('Ocorreu um erro!');
  console.error(error)
}

request(categoriesUrl, (error, response, body) => {
  if(error) return errorHandler(error);

  //Uses cheerio to extract categories
  let categories = [];
  var $ = cheerio.load(body);
  $('.box-busca-avancada a').each((i, el) => {
    categories.push(baseURL + el.attribs.href);
  });

  // console.log(categories)
  //Loops through categories
  categories.forEach(category => {
    request(category, (error, response, body) => {
      if(error) return errorHandler(error);

      let specialties = [];
      $ = cheerio.load(body);
      //Uses cheerio to extract specialties
      $('.table-result td a').each((i, el) => {
        specialties.push({
          id: el.attribs['data-codigo-especialidade'],
          name: el.children.filter(item => {
            return item.type == 'text';
          })[0].data.replace(/\s/g, "+")
        });
      });

      // console.log(specialties);
      //Gets the states/cities combination for each specialty
      specialties.forEach(specialty => {
        let url = `${baseURL}/OmintRedev2018/Redecredenciada/Localizacao/BuscaLocalizacao?especialidade=${specialty.name}&codigoEspecialidade=${specialty.id}&tipoAtendimento=${category.replace('https://app360.omint.com.br/OmintRedev2018/Redecredenciada/BuscaPrestadores/BuscaEspecialidade?tipoAtendimento=', '')}`;

        request(url, (error, response, body) => {
          if(error) return errorHandler(error);
    
          let states = [];
          let locales = [];
          const $ = cheerio.load(body);
          $("select#ddlEstado option:not([value=''])").each((i, el) => {
            states.push(el.attribs.value);
          });
    
          asyncForEach(states, state => {
            axios({
              method: 'POST',
              url: 'https://app360.omint.com.br/OmintRedev2018/Redecredenciada/Localizacao/ObterCidades',
              headers: {
                referer: url
              },
              data: {
                codigoUf: state
              }
            }).then(response => {
              asyncForEach(response.data, async city => {
                let data = {
                  Estado: state,
                  Cidade: city.Valor,
                  Bairro: null,
                  Vinculo: null,
                  Rede: null,
                  CodigoEspecialidade: specialty.id,
                  Atendimento: null,
                  TipoAtendimento: category.replace('https://app360.omint.com.br/OmintRedev2018/Redecredenciada/BuscaPrestadores/BuscaEspecialidade?tipoAtendimento=', ''),
                  Especialidade: specialty.name,
                  latitude: 0,
                  lomngitude: 0,
                  buscaProximidadeTipo: null,
                  Cidade: city.Valor,
                  CodigoEstado: state,
                  Bairro: null
                }
                await Request.create(data);
                requests.push(data);
              });
            }, error => null);
          });
        });
      });
    });
  });
});

setTimeout(() => {
  let data = JSON.stringify(requests);
  fs.writeFile("files/Request.txt", data, error => {
    if(error) throw error;
  });
}, 120000);

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}