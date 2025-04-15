const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('postgres', 'postgres', 'Abhi@2001', {
  host: 'localhost',
  dialect: 'postgres',
  logging: false,
});

module.exports = sequelize;
