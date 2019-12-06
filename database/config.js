const Sequelize = require('sequelize');

const sequelize = new Sequelize('omint', 'root', 'teste', {
  host: 'localhost',
  dialect: 'mysql'
});

module.exports = sequelize;