const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Cuota = sequelize.define('Cuota', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  numero: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  fechaVencimiento: {
    type: DataTypes.DATE,
    allowNull: false
  },
  estado: {
    type: DataTypes.ENUM('pendiente', 'pagada'),
    defaultValue: 'pendiente'
  },
  monto: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  pagoId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'pagos',
      key: 'id'
    }
  }
}, {
  tableName: 'cuotas',
  timestamps: true
});

module.exports = Cuota;
