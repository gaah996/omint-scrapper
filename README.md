# omint-scrapper

Um scrapper implementado em Javascript utilizando algumas bibliotecas como Puppeteer, Cheerio, Request, etc...

O scrapper acessa o website via Puppeteer utilizando o Browser, pois a página de resultados do site em questão dificulta o acesso direto. 

Após isso utiliza cheerio para fazer o scrapping dos dados e salvá-los tanto em um arquivo TXT como em um banco de dados MySQL utilizando Sequelize como ORM.

# Giving it a try

Para executar o projeto é necesário ter o NPM ou YARN configurados e instalar todas as dependencias do projeto.

Ainda, é preciso ter um banco de dados MySQL configurado localmente chamado **omint (default)**. O usuário para acesso ao banco de dados é **root** e a senha **teste**.

*Essas configurações podem ser alteradas no arquivo **./database/config.js**.*

Por fim será necessário gerar uma chave do Geocode API do Google, e informá-la no arquivo **get-latlng.js**, uma vez que a chave informada lá é inválida.

A ordem para executar os arquivos é: **get-requests.js** -> **get-doctors.js** -> **get-latlng.js**. Os arquivos podem ser executados via node.
