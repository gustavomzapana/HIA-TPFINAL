const Actividad = require('./actividad');

// Helper para trabajar con Talleres
const Taller = {
  async crear(data) {
    return await Actividad.create({
      ...data,
      tipoActividad: 'Taller'
    });
  },
  
  async obtenerTodos() {
    return await Actividad.findAll({
      where: { 
        tipoActividad: 'Taller',
        activo: true 
      }
    });
  },
  
  async obtenerPorId(id) {
    return await Actividad.findOne({
      where: { 
        id,
        tipoActividad: 'Taller' 
      }
    });
  }
};

module.exports = Taller;
