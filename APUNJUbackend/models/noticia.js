const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Noticia = sequelize.define('Noticia', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  titulo: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  link: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  imagenUrl: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  origen: {
    type: DataTypes.ENUM('manual', 'facebook'),
    defaultValue: 'manual'
  }
}, {
  tableName: 'noticias',
  timestamps: true
});

module.exports = Noticia;



