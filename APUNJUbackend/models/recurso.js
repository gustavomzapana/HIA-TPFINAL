const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Recurso = sequelize.define('Recurso', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  ubicacion: {
    type: DataTypes.STRING(200),
    defaultValue: ''
  },
  caracteristicas: {
    type: DataTypes.JSON, // Array de strings
    allowNull: false,
    defaultValue: []
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  imagen: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  capacidad: {
    type: DataTypes.INTEGER,
    defaultValue: 2
  },
  precios: {
    type: DataTypes.JSON, // { afiliado: Number, noAfiliado: Number }
    allowNull: false
  },
  estado: {
    type: DataTypes.ENUM('disponible', 'no-disponible'),
    defaultValue: 'disponible'
  }
}, {
  tableName: 'recursos',
  timestamps: true
});

module.exports = Recurso;
