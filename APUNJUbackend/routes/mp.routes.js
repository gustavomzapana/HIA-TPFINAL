//creamos el manejador de rutas
const express = require('express');
const pagoController = require('../controllers/pago.controller');
const router = express.Router();

router.post('/mercadopago', pagoController.crearPagoMercadoPago);
router.post('/webhook', pagoController.webhookMercadoPago);
router.get('/pago', pagoController.obtenerPagoPorId);
router.put('/update', pagoController.actualizarPago);
router.get('/dni', pagoController.getPagosByUserDNI);
router.get('/', pagoController.getPagos);
router.post('/planilla', pagoController.crearPagoPorPlanilla);
router.post('/', pagoController.crearPago);
/*
router.get('/', pagoController.obtenerPagos);


router.delete('/:id', pagoController.eliminarPago);*/


//exportamos el modulo de rutas
module.exports = router;