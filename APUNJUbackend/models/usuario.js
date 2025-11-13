const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Usuario = sequelize.define('Usuario', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  legajo: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  apellido: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  fNacimiento: {
    type: DataTypes.STRING(10),
    allowNull: false
  },
  dni: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  domicilio: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  telefono: {
    type: DataTypes.STRING(15),
    allowNull: false
  },
  foto: {
    type: DataTypes.STRING(500),
    defaultValue: ''
  },
  dependencia: {
    type: DataTypes.ENUM('dependencia1', 'dependencia2', 'dependencia3', '-'),
    allowNull: true
  },
  esAfiliado: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  rol: {
    type: DataTypes.ENUM('Administrador', 'Afiliado', 'Invitado'),
    defaultValue: 'Afiliado'
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'usuarios',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['dni'],
      name: 'unique_dni'
    },
    {
      unique: true,
      fields: ['email'],
      name: 'unique_email'
    }
  ]
});

module.exports = Usuario;