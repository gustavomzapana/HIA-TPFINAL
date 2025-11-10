const Actividad = require('./actividad');

// Helper para trabajar con Capacitaciones
const Capacitacion = {
  async crear(data) {
    return await Actividad.create({
      ...data,
      tipoActividad: 'Capacitacion'
    });
  },
  
  async obtenerTodos() {
    return await Actividad.findAll({
      where: { 
        tipoActividad: 'Capacitacion',
        activo: true 
      }
    });
  },
  
  async obtenerPorId(id) {
    return await Actividad.findOne({
      where: { 
        id,
        tipoActividad: 'Capacitacion' 
      }
    });
  }
};

module.exports = Capacitacion;
