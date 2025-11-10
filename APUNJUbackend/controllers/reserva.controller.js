const { Reserva, Fecha, Recurso, Usuario, sequelize } = require('../models');
const reservaController = {};
const userService = require('../services/usuario.service');
const reservaService = require('../services/reserva.service');
const { enviarCorreo } = require("../services/email/emailService");
// Crear nueva reserva
reservaController.crearReserva = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { resourceId, userId, pagoId, fechas, metodoDePago } = req.body;

    // 1. Crear la reserva
    const reserva = await Reserva.create({
      resourceId,
      userId,
      pagoId,
      metodoDePago
    }, { transaction: t });

    // 2. Crear las fechas de reserva
    const fechasGuardadas = await Promise.all(
      fechas.map(async (fechaObj) => {
        const fecha = fechaObj.fecha ? new Date(fechaObj.fecha) : new Date(fechaObj);

        return await Fecha.create({
          recursoId: resourceId,
          reservaId: reserva.id,
          fecha: fecha,
        }, { transaction: t });
      })
    );

    // Confirmar transacción
    await t.commit();

    // 3. Obtener la reserva con las relaciones
    const reservaCompleta = await Reserva.findByPk(reserva.id, {
      include: [
        {
          model: Fecha,
          as: 'fechas'
        },
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['nombre', 'apellido', 'email']
        },
        {
          model: Recurso,
          as: 'recurso',
          attributes: ['nombre', 'descripcion']
        }
      ]
    });

    res.status(201).json({
      success: true,
      mensaje: 'Reserva creada exitosamente',
      data: reservaCompleta
    });

  } catch (error) {
    await t.rollback();
    console.error('Error al crear reserva:', error);
    res.status(500).json({
      success: false,
      error: 'Error al procesar la reserva',
      detalle: error.message
    });
  }
};
// Obtener todas las reservas
reservaController.getReservas = async (req, res) => {
  try {
    const reservas = await Reserva.findAll({
      include: [
        {
          model: Recurso,
          as: 'recurso',
          attributes: ['nombre', 'descripcion']
        },
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['nombre', 'apellido', 'email']
        },
        {
          model: Fecha,
          as: 'fechas',
          attributes: ['fecha', 'estado']
        }
      ]
    });

    res.status(200).json({
      success: true,
      total: reservas.length,
      data: reservas
    });
  } catch (error) {
    console.error('Error al obtener reservas:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener las reservas',
      detalle: error.message
    });
  }
};
// Obtener reservas por Recurso
reservaController.getReservasPorRecurso = async (req, res) => {
  try {
    const { resourceId } = req.params;
    if (!resourceId) {
      return res.status(400).json({
        success: false,
        error: 'El ID del recurso es requerido',
        detalle: 'El parametro resourceId es Obligatorio en la consulta'
      })
    }

    const reservas = await Reserva.findAll({
      where: { resourceId },
      include: [
        {
          model: Recurso,
          as: 'recurso',
          attributes: ['nombre', 'descripcion']
        },
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['nombre', 'apellido', 'email', 'dni', 'telefono', 'domicilio', 'esAfiliado']
        },
        {
          model: Fecha,
          as: 'fechas',
          attributes: ['fecha', 'estado']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      total: reservas.length,
      data: reservas
    });
  } catch (error) {
    console.error('Error al obtener reservas:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener las reservas',
      detalle: error.message
    });
  }
};

//editar reserva
reservaController.editarReserva = async (req, res) => {
  try {
    const { reservaId } = req.params;
    const { estadoReserva, estadoFecha, usuario } = req.body;

    // 1. Verificar si la reserva existe
    const reserva = await Reserva.findByPk(reservaId);
    if (!reserva) {
      return res.status(404).json({
        success: false,
        error: 'Reserva no encontrada'
      });
    }

    // 2. ⭐ Actualizar la reserva
    if (estadoReserva) {
      await Reserva.update(
        { estado: estadoReserva },
        { where: { id: reservaId } }
      );
    }

    // 3. ⭐ Actualizar TODAS las fechas asociadas
    if (estadoFecha) {
      await Fecha.update(
        { estado: estadoFecha },
        { where: { reservaId: reservaId } }
      );
    }

    // 4. Obtener la reserva actualizada
    const reservaCompleta = await Reserva.findByPk(reservaId, {
      include: [
        {
          model: Recurso,
          as: 'recurso',
          attributes: ['nombre', 'descripcion']
        },
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['nombre', 'apellido', 'email']
        },
        {
          model: Fecha,
          as: 'fechas',
          attributes: ['fecha', 'estado']
        }
      ]
    });

    res.status(200).json({
      success: true,
      mensaje: 'Reserva actualizada exitosamente',
      data: reservaCompleta
    });

  } catch (error) {
    console.error('Error al actualizar reserva:', error);
    res.status(500).json({
      success: false,
      error: 'Error al actualizar la reserva',
      detalle: error.message
    });
  }
};

//eliminar reserva
reservaController.eliminarReserva = async (req, res) => {
  try {
    const { reservaId } = req.params;
    const reserva = await Reserva.findByPk(reservaId, {
      include: [{ model: Fecha, as: 'fechas' }]
    });
    
    if (!reserva) {
      return res.status(404).json({
        success: false,
        error: 'Reserva no encontrada',
        detalle: `No existe una reserva con ID: ${reservaId}`
      });
    }

    // 2. ⭐ ELIMINAR las fechas asociadas
    if (reserva.fechas && reserva.fechas.length > 0) {
      const fechaIds = reserva.fechas.map(fecha => fecha.id);
      const resultadoFechas = await Fecha.destroy({
        where: { id: fechaIds }
      });
      console.log(`✅ Fechas eliminadas: ${resultadoFechas}`);
    }

    await Reserva.update(
      { estado: 'cancelada' },
      { where: { id: reservaId } }
    );
    console.log(`✅ Reserva eliminada: ${reservaId}`);

    res.status(200).json({
      success: true,
      mensaje: 'Reserva eliminada exitosamente'
    });

  } catch (error) {
    console.error('Error al eliminar la reserva:', error);
    res.status(500).json({
      success: false,
      error: 'Error al eliminar la reserva',
      detalle: error.message
    });
  }
};
// Controlador para obtener reservas por mes en un año
reservaController.getReservasPorMesEnAnio = async (req, res) => {
  try {
    const { anio } = req.params;
    // Llamar al servicio
    const reservasPorMes = await reservaService.getReservasPorMesEnAnio(parseInt(anio));

    res.status(200).json({
      success: true,
      total: reservasPorMes.length,
      data: reservasPorMes
    });

  } catch (error) {
    console.error('Error al obtener reservas por mes en año:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener las reservas por mes en año',
      detalle: error.message
    });
  }
};

// Controlador para obtener reservas por método de pago
reservaController.getReservaByMetodoDePago = async (req, res) => {
  try {
    const metodoDePago = req.params.metodoDePago || req.query.metodoDePago;
    if (!metodoDePago) {
      return res.status(400).json({
        error: 'Método de pago no proporcionado',
        detalle: 'Se requiere un método de pago'
      });
    }
    const reservas = await Reserva.findAll({ 
      where: { metodoDePago } 
    });
    
    if (!reservas || reservas.length === 0) {
      return res.status(404).json({
        error: 'No se encontraron reservas para el método de pago',
        detalle: `No se encontraron reservas para el método de pago: ${metodoDePago}`
      });
    }

    res.status(200).json(reservas);

  } catch (error) {
    console.error('Error al obtener reservas por método de pago:', error);
    res.status(500).json({
      error: 'Error al obtener las reservas',
      detalle: error.message
    });
  }
};

// Controlador para obtener reservas por DNI de usuario
reservaController.getReservasByUserDNI = async (req, res) => {
  try {
    const dni = req.params.dni || req.query.dni;

    if (!dni) {
      return res.status(400).json({
        error: 'DNI no proporcionado',
        detalle: 'Se requiere un DNI'
      });
    }

    const user = await userService.getUserByDni(dni);
    if (!user) {
      return res.status(404).json({
        error: 'Usuario no encontrado',
        detalle: `No se encontró un usuario con DNI: ${dni}`
      });
    }

    const reservas = await Reserva.findAll({ 
      where: { userId: user.id },
      include: [
        { model: Recurso, as: 'recurso' },
        { model: Usuario, as: 'usuario' },
        { model: Fecha, as: 'fechas' }
      ]
    });
    
    if (!reservas || reservas.length === 0) {
      return res.status(404).json({
        error: 'No se encontraron reservas para el DNI',
        detalle: `No se encontraron reservas para el DNI: ${dni}`
      });
    }
    res.status(200).json(reservas);
  } catch (error) {
    console.error('Error al obtener reservas por DNI:', error);
    res.status(500).json({
      error: 'Error al obtener las reservas',
      detalle: error.message
    });
  }
};

reservaController.enviarComprobante = async (req, res) => {
  try {
    const { userId, pdfBuffer } = req.body;
    const usuario = await userService.getUserById(userId);
    const emailData = {
      email: usuario.email,
      nombreCliente: `${usuario.nombre} ${usuario.apellido}`,
      pdfBuffer: pdfBuffer ? Buffer.from(pdfBuffer, 'base64') : null,
    };

    await enviarCorreo('reservaConfirmada', emailData);

    res.status(200).json({
      success: true,
      mensaje: 'Comprobante enviado exitosamente',
    });
  } catch (error) {
    console.error('Error al enviar comprobante:', error);
    res.status(500).json({
      success: false,
      error: 'Error al enviar el comprobante',
      detalle: error.message
    });
  }
};

module.exports = reservaController;

