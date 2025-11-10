const express = require('express');
const router = express.Router();
const recursoController = require('../controllers/recurso.controller.js');

router.post('/', recursoController.crearRecurso);
router.get('/', recursoController.getRecursos);
router.get('/recurso', recursoController.getRecursoById); // Para query params: /api/recursos?id=123
router.put('/', recursoController.updateRecurso);
router.delete('/', recursoController.deleteRecurso);
router.post('/subir-imagen', recursoController.subirImagen);

module.exports = router;
