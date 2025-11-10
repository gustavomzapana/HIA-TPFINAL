const express = require('express');
const router = express.Router();
const noticiaController = require('../controllers/noticia.controller');

router.get('/', noticiaController.obtenerNoticias);
router.get('/:id', noticiaController.obtenerNoticiaPorId);
router.post('/', noticiaController.crearNoticia);
router.put('/:id', noticiaController.actualizarNoticia);
router.delete('/:id', noticiaController.eliminarNoticia);
router.post('/subir-imagen', noticiaController.subirImagen);

module.exports = router;
