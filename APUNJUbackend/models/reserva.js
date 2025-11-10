const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Reserva = sequelize.define('Reserva', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  resourceId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'recursos',
      key: 'id'
    }
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  pagoId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'pagos',
      key: 'id'
    }
  },
  estado: {
    type: DataTypes.ENUM('confirmada', 'finalizada'),
    defaultValue: 'confirmada'
  },
  metodoDePago: {
    type: DataTypes.ENUM('planilla', 'mercadoPago', 'efectivo', 'administrativo'),
    allowNull: false
  }
}, {
  tableName: 'reservas',
  timestamps: true
});

module.exports = Reserva;