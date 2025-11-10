const express = require('express');
const router = express.Router();
const inscripcionController = require('../controllers/inscripcion.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Verificar duplicados antes de crear inscripción
router.get('/verificar-duplicado', inscripcionController.verificarDuplicado);

// Crear nueva inscripción
router.post('/', inscripcionController.crearInscripcion);

// Obtener inscripciones por email
router.get('/usuario', inscripcionController.obtenerInscripcionesUsuario);

// Obtener inscripción por ID
router.get('/:id', inscripcionController.obtenerInscripcionPorId);

router.get('/por-actividad/:actividadId', inscripcionController.obtenerInscripcionesPorActividad);


// Cancelar inscripción
router.put('/:id/cancelar', inscripcionController.cancelarInscripcion);

module.exports = router;