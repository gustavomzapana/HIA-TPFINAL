const { Reserva, Fecha, Recurso } = require('../models');
const { Op } = require('sequelize');
const fechaController = {};

fechaController.crearFecha = async (req, res) => {
  try {
    console.log(req.body);
    const { fecha, estado, recursoId } = req.body;

    if (!fecha || !estado || !recursoId) {
      return res.status(400).json({
        success: false,
        error: 'Faltan campos requeridos',
        bodyRecibido: req.body
      });
    }

    const fechaNueva = await Fecha.create({
      fecha,
      estado,
      recursoId
    });
    
    res.status(201).json({
      success: true,
      data: fechaNueva
    });
  } catch (error) {
    console.error('Error al crear fecha:', error);
    res.status(500).json({
      success: false,
      error: 'Error al crear la fecha',
      detalle: error.message
    });
  }
}

fechaController.getFechasNoDisponiblesPorRecurso = async (req, res) => {
  try {
    const { resourceId } = req.query;

    if (!resourceId) {
      return res.status(400).json({
        success: false,
        error: 'Se requiere el ID del recurso',
        detalle: 'El parámetro resourceId es obligatorio en la consulta'
      });
    }

    // 1. Verificar si el recurso existe
    const recurso = await Recurso.findByPk(resourceId);
    if (!recurso) {
      return res.status(404).json({
        success: false,
        error: 'Recurso no encontrado',
        detalle: `No existe un recurso con ID: ${resourceId}`
      });
    }

    // 2. Buscar todas las fechas no disponibles para el recurso
    const fechasNoDisponibles = await Fecha.findAll({
      where: {
        recursoId: resourceId,
        estado: { [Op.ne]: 'disponible' }
      },
      attributes: ['fecha']
    });

    // 3. Formatear la respuesta
    const fechasFormateadas = fechasNoDisponibles.map(fecha => ({
      fecha: fecha.fecha,
    }));

    // Ordenar por fecha
    fechasFormateadas.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

    res.status(200).json({
      fechas: fechasFormateadas
    });

  } catch (error) {
    console.error('Error al obtener fechas no disponibles:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener las fechas no disponibles',
      detalle: error.message
    });
  }
};

// Bloquear una fecha específica para un recurso
fechaController.bloquearFecha = async (req, res) => {
  try {
    const { resourceId, fechas } = req.body;
    if (!resourceId || !fechas || !Array.isArray(fechas) || fechas.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Faltan campos requeridos',
        bodyRecibido: req.body // Para ver qué está llegando
      });
    }
    const recurso = await Recurso.findByPk(resourceId);
    if (!recurso) {
      return res.status(404).json({
        success: false,
        error: 'Recurso no encontrado'
      });
    }

    const fechasBloqueadas = [];

    // 1. Crear las fechas bloqueadas
    for (const fechaString of fechas) {
      const fechaNueva = await Fecha.create({
        fecha: fechaString,
        estado: 'bloqueado',
        recursoId: resourceId
      });

      fechasBloqueadas.push(fechaNueva);
    }

    // 2. Crear también una "reserva" de bloqueo
    const adminUserId = 1; // Usuario administrador
    const adminPagoId = 1; // Pago administrativo

    const reservaBloqueo = await Reserva.create({
      resourceId: resourceId,
      estado: 'finalizada',
      userId: adminUserId,
      pagoId: adminPagoId,
      metodoDePago: 'administrativo',
    });

    await Fecha.update(
      { reservaId: reservaBloqueo.id },
      { where: { id: fechasBloqueadas.map(f => f.id) } }
    );
    
    res.status(201).json({
      success: true,
      mensaje: `${fechasBloqueadas.length} fechas bloqueadas exitosamente`,
      data: fechasBloqueadas
    });
  } catch (error) {
    console.error('Error al bloquear fechas:', error);
    res.status(500).json({
      success: false,
      error: 'Error al bloquear las fechas',
      detalle: error.message
    });
  }
}


// No olvides exportar el controlador
module.exports = fechaController;