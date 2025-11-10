const { Pago, Reserva } = require('../models');
const axios = require('axios');
const { mercadopago, Preference } = require('../config/mercadopago');
const userService = require('../services/usuario.service.js');
const pagoController = {};


// Crear un nuevo pago (POST)

pagoController.crearPago = async (req, res, next) => {
  try {
    const pagoGuardado = await Pago.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Pago creado exitosamente',
      data: pagoGuardado
    });
  } catch (error) {
    next(error);
  }
};


// Obtener todos los pagos (GET)
pagoController.getPagos = async (req, res, next) => {
  try {
    const pagos = await Pago.findAll();
    res.status(200).json({
      success: true,
      message: 'Pagos recuperados exitosamente',
      count: pagos.length,
      data: pagos
    });
  } catch (error) {
    next(error);
  }
};

// Obtener un pago por ID (GET)
pagoController.obtenerPagoPorId = async (req, res, next) => {
  try {
    const pago = await Pago.findByPk(req.query.id);
    if (!pago) {
      return res.status(404).json({
        success: false,
        message: 'Pago no encontrado' + req.params.id
      });
    }
    res.status(200).json({
      success: true,
      message: 'Pago encontrado',
      data: pago
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar un pago (PUT)
pagoController.actualizarPago = async (req, res, next) => {

  try {
    const pago = await Pago.findByPk(req.query.id);
    if (!pago) {
      return res.status(404).json({
        success: false,
        message: 'Pago no encontrado'
      });
    }
    await pago.update(req.body);
    res.status(200).json({
      success: true,
      message: 'Pago actualizado exitosamente',
      data: pago
    });
  } catch (error) {
    next(error);
  }
};

// Eliminar un pago (DELETE)
pagoController.eliminarPago = async (req, res, next) => {

  try {
    const pago = await Pago.findByPk(req.params.id);
    if (!pago) {
      return res.status(404).json({
        success: false,
        message: 'Pago no encontrado'
      });
    }
    await pago.destroy();
    res.status(200).json({
      success: true,
      message: 'Pago eliminado exitosamente',
      data: pago
    });
  } catch (error) {
    next(error);
  }
};

// Crear pago en Mercado Pago (POST)
pagoController.crearPagoMercadoPago = async (req, res, next) => {

  try {
    const { importeTotal, descripcion, userId } = req.body;
    // Crear preferencia de pago en Mercado Pago
    if (!importeTotal || isNaN(importeTotal) || importeTotal <= 0) {
      return res.status(400).json({
        success: false,
        message: 'El importe total es requerido y debe ser un número positivo'
      });
    }

    const preference = {
      items: [
        {
          title: descripcion || 'Reserva',
          quantity: 1,
          currency_id: 'ARS',
          unit_price: Number(importeTotal)
        }
      ],
      notification_url: process.env.API_URL + '/api/pagos/webhook',
      external_reference: '' // Se completará después de crear el pago

    };
    console.log('Access Token:', process.env.MP_ACCESS_TOKEN);
    console.log('Preference:', preference);

    // Primero crear el pago en la base de datos sin mp_preference_id
    const nuevoPago = await Pago.create({
      userId,
      importeTotal,
      descripcion,
      external_reference: '', // Se completará después
    });

    // Ahora actualizar la referencia externa con el ID generado
    preference.external_reference = nuevoPago.id.toString();
    await nuevoPago.update({ external_reference: nuevoPago.id.toString() });

    let mpResponse;
    try {
      mpResponse = await new Preference(mercadopago).create({ body: preference });
      console.log('mpResponse:', mpResponse);
    } catch (err) {
      console.error('Error al crear preferencia:', err);
      return res.status(500).json({
        success: false,
        message: 'Error al crear preferencia de Mercado Pago',
        error: err.message
      });
    }


    // Usa la propiedad correcta según lo que imprima el log:
    const preferenceId = mpResponse.id || (mpResponse.body && mpResponse.body.id);
    const initPoint = mpResponse.init_point || (mpResponse.body && mpResponse.body.init_point);

    if (!preferenceId || !initPoint) {
      return res.status(500).json({
        success: false,
        message: 'No se pudo obtener el link de pago de Mercado Pago',
        data: mpResponse
      });
    }

    // Actualizar con el preference_id de Mercado Pago
    await nuevoPago.update({ mp_preference_id: preferenceId });

    res.status(201).json({
      success: true,
      message: 'Pago y preferencia creados',
      data: {
        pago: nuevoPago,
        mp_init_point: initPoint
      }
    });
  } catch (error) {
    next(error);
  }
};

pagoController.webhookMercadoPago = async (req, res) => {
  try {
    console.log('Webhook recibido', req.body);

    const { type, data } = req.body;

    if (type === 'payment') {
      const paymentId = data.id;
      if (!paymentId) {
        console.error('No se recibió paymentId');
        return res.status(400).send('No paymentId');
      }
      try {
        const response = await axios.get(
          `https://api.mercadopago.com/v1/payments/${paymentId}`,
          {
            headers: {
              Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`
            }
          }
        );
        const payment = response.data;
        console.log('Payment consultado:', payment);

        // Busca el pago en tu base por preference_id
        const pago = await Pago.findOne({ where: { external_reference: payment.external_reference } });
        if (pago) {
          if (payment.status === 'approved') {
            await pago.update({ estado: 'aprobado' });

          } else {
            await pago.update({ estado: payment.status });
          }
          console.log('Pago actualizado:', pago);
        } else {
          console.log('No se encontró el pago con ese preference_id');
        }
      } catch (err) {
        console.error('Error consultando pago en Mercado Pago:', err.response?.data || err.message);
        return res.status(500).send('Error consultando pago');
      }
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Error en webhook:', error);
    res.status(500).send('Error en webhook', error.message);
  }
};

pagoController.getPagosByUserDNI = async (req, res) => {
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

    const pagos = await Pago.findAll({ where: { userId: user.id } });
    if (!pagos || pagos.length === 0) {
      return res.status(404).json({
        error: 'No se encontraron pagos para el DNI',
        detalle: `No se encontraron pagos para el DNI: ${dni}`
      });
    }
    res.status(200).json(pagos);
  } catch (error) {
    console.error('Error al obtener pagos por DNI:', error);
    res.status(500).json({
      error: 'Error al obtener los pagos',
      detalle: error.message
    });
  }
};

pagoController.crearPagoPorPlanilla = async (req, res) => {
  try {
    const { importeTotal, descripcion, userId, cuotas, valorCuota } = req.body;
    const pago = await Pago.create({
      importeTotal,
      descripcion,
      userId,
      cuotas,
    });
    res.status(201).json(pago);
  } catch (error) {
    console.error('Error al crear pago por planilla:', error);
    res.status(500).json({
      error: 'Error al crear pago por planilla',
      detalle: error.message
    });
  }
};

module.exports = pagoController;