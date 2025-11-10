const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Actividad = sequelize.define('Actividad', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  imagen: {
    type: DataTypes.STRING(500),
    defaultValue: 'https://via.placeholder.com/400x300?text=Sin+Imagen'
  },
  nombreCurso: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  fechaInicio: {
    type: DataTypes.DATE,
    allowNull: false
  },
  fechaFin: {
    type: DataTypes.DATE,
    allowNull: false
  },
  precioNoAfiliado: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  cuposAfiliados: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  cuposNoAfiliados: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  pagoId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'pagos',
      key: 'id'
    }
  },
  tipoActividad: {
    type: DataTypes.ENUM('Taller', 'Curso', 'Capacitacion'),
    allowNull: false
  },
  // Campos específicos de Curso
  duracion: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  // Campos específicos de Taller
  materiales: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  // Campos específicos de Capacitación
  modalidad: {
    type: DataTypes.ENUM('Presencial', 'Virtual', 'Hibrida'),
    defaultValue: 'Presencial',
    allowNull: true
  }
}, {
  tableName: 'actividades',
  timestamps: true
});

module.exports = Actividad;