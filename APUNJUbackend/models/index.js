const sequelize = require('../config/database');

// Importar todos los modelos
const Usuario = require('./usuario');
const Recurso = require('./recurso');
const Reserva = require('./reserva');
const Fecha = require('./fecha');
const Actividad = require('./actividad');
const Inscripcion = require('./inscripcion');
const Pago = require('./pago');
const Cuota = require('./cuota');
const Noticia = require('./noticia');

// ========== DEFINIR RELACIONES ==========

// Usuario - Reserva (1:N)
Usuario.hasMany(Reserva, { 
  foreignKey: 'userId',
  as: 'reservas',
  onDelete: 'CASCADE'
});
Reserva.belongsTo(Usuario, { 
  foreignKey: 'userId',
  as: 'usuario'
});

// Recurso - Reserva (1:N)
Recurso.hasMany(Reserva, { 
  foreignKey: 'resourceId',
  as: 'reservas',
  onDelete: 'CASCADE'
});
Reserva.belongsTo(Recurso, { 
  foreignKey: 'resourceId',
  as: 'recurso'
});

// Pago - Reserva (1:1)
Pago.hasOne(Reserva, { 
  foreignKey: 'pagoId',
  as: 'reserva'
});
Reserva.belongsTo(Pago, { 
  foreignKey: 'pagoId',
  as: 'pago'
});

// Recurso - Fecha (1:N)
Recurso.hasMany(Fecha, { 
  foreignKey: 'recursoId',
  as: 'fechas',
  onDelete: 'CASCADE'
});
Fecha.belongsTo(Recurso, { 
  foreignKey: 'recursoId',
  as: 'recurso'
});

// Reserva - Fecha (1:N)
Reserva.hasMany(Fecha, { 
  foreignKey: 'reservaId',
  as: 'fechas'
});
Fecha.belongsTo(Reserva, { 
  foreignKey: 'reservaId',
  as: 'reserva'
});

// Actividad - Inscripcion (1:N)
Actividad.hasMany(Inscripcion, { 
  foreignKey: 'actividadId',
  as: 'inscripciones',
  onDelete: 'CASCADE'
});
Inscripcion.belongsTo(Actividad, { 
  foreignKey: 'actividadId',
  as: 'actividad'
});

// Pago - Inscripcion (1:1)
Pago.hasOne(Inscripcion, { 
  foreignKey: 'pagoId',
  as: 'inscripcion'
});
Inscripcion.belongsTo(Pago, { 
  foreignKey: 'pagoId',
  as: 'pago'
});

// Usuario - Pago (1:N)
Usuario.hasMany(Pago, { 
  foreignKey: 'userId',
  as: 'pagos',
  onDelete: 'CASCADE'
});
Pago.belongsTo(Usuario, { 
  foreignKey: 'userId',
  as: 'usuario'
});

// Pago - Cuota (1:N)
Pago.hasMany(Cuota, { 
  foreignKey: 'pagoId',
  as: 'cuotas',
  onDelete: 'CASCADE'
});
Cuota.belongsTo(Pago, { 
  foreignKey: 'pagoId',
  as: 'pago'
});

// Actividad - Pago (1:1)
Pago.belongsTo(Actividad, {
  foreignKey: 'actividadId',
  as: 'actividad'
});
Actividad.hasOne(Pago, {
  foreignKey: 'actividadId',
  as: 'pago'
});

// ========== EXPORTAR MODELOS ==========

module.exports = {
  sequelize,
  Usuario,
  Recurso,
  Reserva,
  Fecha,
  Actividad,
  Inscripcion,
  Pago,
  Cuota,
  Noticia
};
