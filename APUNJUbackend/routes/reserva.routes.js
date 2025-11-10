const express = require('express');
const router = express.Router();
const reservaController = require('../controllers/reserva.controller.js');

// Crear nueva reserva
router.post('/', reservaController.crearReserva);
router.get('/', reservaController.getReservas);
router.put('/editar/:reservaId', reservaController.editarReserva);
router.delete('/:reservaId', reservaController.eliminarReserva);
router.get('/recurso/:resourceId', reservaController.getReservasPorRecurso);
router.get('/metodoDePago', reservaController.getReservaByMetodoDePago);
router.get('/dni', reservaController.getReservasByUserDNI);
router.post('/enviar', reservaController.enviarComprobante);
// Obtener todas las fechas reservadas 
//reservas por mes en un año determinado
router.get('/cantidad/:anio', reservaController.getReservasPorMesEnAnio);
module.exports = router;