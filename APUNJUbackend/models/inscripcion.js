const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Inscripcion = sequelize.define('Inscripcion', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  apellido: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  telefono: {
    type: DataTypes.STRING(15),
    allowNull: false
  },
  dni: {
    type: DataTypes.STRING(8),
    allowNull: false
  },
  fechaNacimiento: {
    type: DataTypes.DATE,
    allowNull: false
  },
  actividadId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'actividades',
      key: 'id'
    }
  },
  tipoActividad: {
    type: DataTypes.ENUM('Taller', 'Curso', 'Capacitacion'),
    allowNull: false
  },
  nombreActividad: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  esAfiliado: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  numeroAfiliado: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  estado: {
    type: DataTypes.ENUM('pendiente', 'confirmada', 'cancelada'),
    defaultValue: 'pendiente'
  },
  pagoId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'pagos',
      key: 'id'
    }
  },
  metodoDePago: {
    type: DataTypes.ENUM('planilla', 'mercadoPago', 'efectivo'),
    allowNull: true
  },
  fechaInscripcion: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  ipAddress: {
    type: DataTypes.STRING(45),
    allowNull: true
  },
  userAgent: {
    type: DataTypes.STRING(500),
    allowNull: true
  }
}, {
  tableName: 'inscripciones',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['email', 'actividadId']
    },
    {
      unique: true,
      fields: ['dni', 'actividadId']
    }
  ]
});

module.exports = Inscripcion;