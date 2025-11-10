const Actividad = require('./actividad');

// Helper para trabajar con Cursos
const Curso = {
  async crear(data) {
    return await Actividad.create({
      ...data,
      tipoActividad: 'Curso'
    });
  },
  
  async obtenerTodos() {
    return await Actividad.findAll({
      where: { 
        tipoActividad: 'Curso',
        activo: true 
      }
    });
  },
  
  async obtenerPorId(id) {
    return await Actividad.findOne({
      where: { 
        id,
        tipoActividad: 'Curso' 
      }
    });
  }
};

module.exports = Curso;
