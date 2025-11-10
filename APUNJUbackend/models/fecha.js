const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Fecha = sequelize.define('Fecha', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  recursoId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'recursos',
      key: 'id'
    }
  },
  reservaId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'reservas',
      key: 'id'
    }
  },
  fecha: {
    type: DataTypes.DATE,
    allowNull: false
  },
  estado: {
    type: DataTypes.ENUM('disponible', 'reservado', 'bloqueado', 'finalizada'),
    defaultValue: 'reservado'
  }
}, {
  tableName: 'fechas',
  timestamps: true
});

module.exports = Fecha;