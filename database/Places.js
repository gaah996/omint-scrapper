const Sequelize = require('sequelize');
const Model = Sequelize.Model;
const sequelize = require('./config');

class Places extends Model {};

Places.init({
  name: {
    type: Sequelize.STRING
  },
  address: {
    type: Sequelize.STRING
  },
  street: {
    type: Sequelize.STRING
  },
  number: {
    type: Sequelize.STRING
  },
  neighborhood: {
    type: Sequelize.STRING
  },
  state: {
    type: Sequelize.STRING
  },
  city: {
    type: Sequelize.STRING
  },
  zip: {
    type: Sequelize.STRING
  },
  specialty_code: {
    type: Sequelize.STRING
  },
  specialty: {
    type: Sequelize.STRING
  },
  category: {
    type: Sequelize.STRING
  },
  latitude: {
    type: Sequelize.FLOAT(8, 5)
  },
  longitude: {
    type: Sequelize.FLOAT(8, 5)
  },
}, {
  sequelize,
  modelName: 'place',
  timestamps: true
});

Places.sync();

module.exports = Places;