const express = require('express');
const router = express.Router();
const fechaController = require('../controllers/fecha.controller.js');

router.get('/no-disponibles', fechaController.getFechasNoDisponiblesPorRecurso);
router.post('/', fechaController.crearFecha);
router.post('/bloquear', fechaController.bloquearFecha);
module.exports = router;
