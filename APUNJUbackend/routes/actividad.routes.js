const express = require('express');
const router = express.Router();
const actividadCtrl = require('../controllers/actividad.controller');

// =============== RUTAS ESPECÍFICAS PRIMERO (ANTES DE /:id) ===============
router.post('/subir-imagen', actividadCtrl.subirImagen);

// =============== RUTAS ESPECÍFICAS DE CURSOS ===============
router.get('/cursos/todos', actividadCtrl.getAllCursos);
router.get('/cursos/activos', actividadCtrl.getCursosActivos);
router.post('/cursos', actividadCtrl.createCurso);
router.get('/cursos/:id', actividadCtrl.getCursoById);
router.put('/cursos/:id', actividadCtrl.updateCurso);
router.delete('/cursos/:id', actividadCtrl.deleteCurso);

// =============== RUTAS ESPECÍFICAS DE TALLERES ===============
router.get('/talleres/todos', actividadCtrl.getAllTalleres);
router.get('/talleres/activos', actividadCtrl.getTalleresActivos);
router.post('/talleres', actividadCtrl.createTaller);
router.get('/talleres/:id', actividadCtrl.getTallerById);
router.put('/talleres/:id', actividadCtrl.updateTaller);
router.delete('/talleres/:id', actividadCtrl.deleteTaller);

// =============== RUTAS ESPECÍFICAS DE CAPACITACIONES ===============
router.get('/capacitaciones/todos', actividadCtrl.getAllCapacitaciones);
router.get('/capacitaciones/activos', actividadCtrl.getCapacitacionesActivas);
router.post('/capacitaciones', actividadCtrl.createCapacitacion);
router.get('/capacitaciones/:id', actividadCtrl.getCapacitacionById);
router.put('/capacitaciones/:id', actividadCtrl.updateCapacitacion);
router.delete('/capacitaciones/:id', actividadCtrl.deleteCapacitacion);

// =============== RUTAS GENERALES AL FINAL ===============
router.get('/', actividadCtrl.getAllActividades);
router.get('/activas', actividadCtrl.getActividadesActivas);
router.post('/', actividadCtrl.createActividad);
router.get('/:id', actividadCtrl.getActividadById); // ESTA RUTA AL FINAL
router.delete('/:id', actividadCtrl.deleteActividad);

module.exports = router;