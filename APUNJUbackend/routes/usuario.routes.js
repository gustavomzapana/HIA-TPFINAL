const express = require('express');
const router = express.Router();
const reservaController = require('../controllers/reserva.controller.js');
const usuarioController = require('../controllers/usuario.controller.js');
const usuario = require('../models/usuario.js');
const authMiddleware = require('../middleware/auth.middleware');

// Crear nueva reserva
//router.post('/', reservaController.crearReserva);

// Obtener todas las fechas reservadas 
//router.get('/fechas-reservadas', reservaController.getFechasReservadasPorRecurso);

router.post('/',authMiddleware, usuarioController.createAfiliado)
router.post('/invitado', usuarioController.createInvitado)
router.post('/login',usuarioController.loginUser)
router.get('/',usuarioController.getUsers)
router.get('/dni/:dni',authMiddleware, usuarioController.getUserByDni);
router.get('/legajo/:legajo',authMiddleware, usuarioController.getUserByLegajo);
router.get('/dependencia/:dependencia',authMiddleware, usuarioController.byDependency);
router.get('/invitados',authMiddleware, usuarioController.getInvitados);
router.get('/desafiliados',authMiddleware, usuarioController.getDesafiliados);
router.put('/:_id',authMiddleware, usuarioController.updateUser )
router.delete('/:_id',authMiddleware, usuarioController.deleteUser)
router.put('/password',authMiddleware, usuarioController.newPassword)
router.get('/restauracion/:dni', usuarioController.resetPassword);
module.exports = router;