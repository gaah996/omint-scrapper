const Sequelize = require('sequelize');
const Model = Sequelize.Model;
const sequelize = require('./config');

class Request extends Model {};

Request.init({
  Estado: {
    type: Sequelize.STRING
  },
  Cidade: {
    type: Sequelize.STRING
  },
  Bairro: {
    type: Sequelize.STRING
  },
  Vinculo: {
    type: Sequelize.STRING
  },
  Rede: {
    type: Sequelize.STRING
  },
  CodigoEspecialidade: {
    type: Sequelize.STRING
  },
  Atendimento: {
    type: Sequelize.STRING
  },
  TipoAtendimento: {
    type: Sequelize.STRING
  },
  Especialidade: {
    type: Sequelize.STRING
  },
  latitude: {
    type: Sequelize.INTEGER
  },
  longitude: {
    type: Sequelize.INTEGER
  },
  buscaProximidadeTipo: {
    type: Sequelize.STRING
  },
  CodigoEstado: {
    type: Sequelize.STRING
  },
  checked: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  }
}, {
  sequelize,
  modelName: 'request',
  timestamps: true
});

Request.sync();

module.exports = Request;