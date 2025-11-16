const { Actividad, sequelize } = require('../models');
const { Op } = require('sequelize');
const Curso = require('../models/curso');
const Taller = require('../models/taller');
const Capacitacion = require('../models/capacitacion');

const multer = require('multer');
const streamifier = require('streamifier');
const cloudinary = require('../config/cloudinary');
const upload = multer({ storage: multer.memoryStorage() });

const actividadController = {};

// Función mejorada de validación
const validarCamposObligatorios = (actividadData) => {
    console.log('=== VALIDANDO CAMPOS ===');
    console.log('Datos recibidos:', actividadData);
    
    const requiredFields = [
        'nombreCurso', 'descripcion', 'fechaInicio', 'fechaFin',
        'precioNoAfiliado', 'cuposAfiliados', 'cuposNoAfiliados'
    ];

    for (const field of requiredFields) {
        if (!actividadData[field] && actividadData[field] !== 0) {
            console.log(`Campo ${field} falta o es inválido`);
            return `El campo ${field} es obligatorio`;
        }
    }

    // Convertir strings a números
    const precioNoAfiliado = Number(actividadData.precioNoAfiliado);
    const cuposAfiliados = Number(actividadData.cuposAfiliados);
    const cuposNoAfiliados = Number(actividadData.cuposNoAfiliados);
    
    console.log('Valores numéricos:', { precioNoAfiliado, cuposAfiliados, cuposNoAfiliados });
    
    // Validación de números
    if (isNaN(precioNoAfiliado) || precioNoAfiliado < 0) {
        return 'El precio no afiliado debe ser un número mayor o igual a 0';
    }
    if (isNaN(cuposAfiliados) || cuposAfiliados < 0) {
        return 'Los cupos afiliados deben ser un número mayor o igual a 0';
    }
    if (isNaN(cuposNoAfiliados) || cuposNoAfiliados < 0) {
        return 'Los cupos no afiliados deben ser un número mayor o igual a 0';
    }

    // Asignar valores convertidos
    actividadData.precioNoAfiliado = precioNoAfiliado;
    actividadData.cuposAfiliados = cuposAfiliados;
    actividadData.cuposNoAfiliados = cuposNoAfiliados;

    // Validación de fechas
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    const fechaInicio = new Date(actividadData.fechaInicio);
    const fechaFin = new Date(actividadData.fechaFin);
    
    console.log('Fechas:', { fechaInicio, fechaFin });
    
    if (isNaN(fechaInicio.getTime())) {
        return 'La fecha de inicio no es válida';
    }
    if (isNaN(fechaFin.getTime())) {
        return 'La fecha de fin no es válida';
    }
    if (fechaFin <= fechaInicio) {
        return 'La fecha de fin debe ser posterior a la fecha de inicio';
    }

    console.log('Todas las validaciones pasaron');
    return null;
};

// Función mejorada para subir imagen a Cloudinary
const subirImagenACloudinary = (buffer, nombreArchivo) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: 'actividades',
                resource_type: 'auto',
                public_id: `actividad_${Date.now()}_${nombreArchivo.replace(/[^a-zA-Z0-9]/g, '_')}`,
                transformation: [
                    { width: 800, height: 600, crop: 'limit' },
                    { quality: 'auto' }
                ]
            },
            (error, result) => {
                if (error) {
                    console.error('Error de Cloudinary:', error);
                    reject(error);
                } else {
                    console.log('Imagen subida exitosamente a Cloudinary:', result.secure_url);
                    resolve(result.secure_url);
                }
            }
        );
        streamifier.createReadStream(buffer).pipe(stream);
    });
};

// =============== ACTIVIDADES GENERALES ===============

actividadController.getAllActividades = async (req, res) => {
    try {
        const actividades = await Actividad.findAll();
        res.status(200).json(actividades);
    } catch (error) {
        console.error('Error en getAllActividades:', error);
        res.status(500).json({ message: 'Error al obtener las actividades' });
    }
};

actividadController.getActividadesActivas = async (req, res) => {
    try {
        const actividades = await Actividad.findAll({ where: { activo: true } });
        res.status(200).json(actividades);
    } catch (error) {
        console.error('Error en getActividadesActivas:', error);
        res.status(500).json({ message: 'Error al obtener las actividades activas' });
    }
};

actividadController.getActividadById = async (req, res) => {
    try {
        const actividad = await Actividad.findByPk(req.params.id);
        if (!actividad) {
            return res.status(404).json({ message: 'Actividad no encontrada' });
        }
        res.status(200).json(actividad);
    } catch (error) {
        console.error('Error en getActividadById:', error);
        res.status(500).json({ message: 'Error al obtener la actividad' });
    }
};

// Subir imagen independiente
actividadController.subirImagen = [
    upload.single('imagen'),
    async (req, res) => {
        try {
            console.log('=== SUBIR IMAGEN INDEPENDIENTE ===');
            console.log('Archivo recibido:', req.file ? 'SÍ' : 'NO');
            
            if (!req.file) {
                return res.status(400).json({ message: 'No se subió ninguna imagen' });
            }

            const imageUrl = await subirImagenACloudinary(req.file.buffer, req.file.originalname);
            return res.json({ url: imageUrl });
        } catch (err) {
            console.error('Error al subir imagen:', err);
            res.status(500).json({ message: 'Error al subir imagen', error: err.message });
        }
    }
];

// =============== CURSOS ===============

actividadController.getAllCursos = async (req, res) => {
    try {
        // Si no hay parámetros de paginación, devolver todos
        if (!req.query.page && !req.query.limit) {
            const cursos = await Actividad.findAll({
                where: { tipoActividad: 'Curso' },
                order: [['createdAt', 'DESC']]
            });
            return res.status(200).json(cursos);
        }

        // Con paginación
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 4;
        const offset = (page - 1) * limit;

        const { count, rows: cursos } = await Actividad.findAndCountAll({
            where: { tipoActividad: 'Curso' },
            limit: limit,
            offset: offset,
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({
            cursos: cursos,
            pagination: {
                total: count,
                page: page,
                limit: limit,
                totalPages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error('Error en getAllCursos:', error);
        res.status(500).json({ message: 'Error al obtener los cursos' });
    }
};

actividadController.getCursosActivos = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 4;
        const offset = (page - 1) * limit;

        const { count, rows: cursos } = await Actividad.findAndCountAll({
            where: { tipoActividad: 'Curso', activo: true },
            limit: limit,
            offset: offset,
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({
            cursos: cursos,
            pagination: {
                total: count,
                page: page,
                limit: limit,
                totalPages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error('Error en getCursosActivos:', error);
        res.status(500).json({ message: 'Error al obtener los cursos activos' });
    }
};

actividadController.getCursoById = async (req, res) => {
    try {
        const curso = await Curso.obtenerPorId(req.params.id);
        if (!curso) {
            return res.status(404).json({ message: 'Curso no encontrado' });
        }
        res.status(200).json(curso);
    } catch (error) {
        console.error('Error en getCursoById:', error);
        res.status(500).json({ message: 'Error al obtener el curso' });
    }
};

actividadController.createCurso = [
    upload.single('imagen'),
    async (req, res) => {
        try {
            console.log('=== CREAR CURSO ===');
            console.log('Body recibido:', req.body);
            console.log('Archivo recibido:', req.file ? 'SÍ' : 'NO');
            
            const cursoData = { ...req.body };
            
            // Convertir strings booleanos
            if (cursoData.activo === 'true') cursoData.activo = true;
            if (cursoData.activo === 'false') cursoData.activo = false;
            
            // Si hay imagen, subirla a Cloudinary
            if (req.file) {
                console.log('Subiendo imagen a Cloudinary...');
                try {
                    const imageUrl = await subirImagenACloudinary(req.file.buffer, req.file.originalname);
                    cursoData.imagen = imageUrl;
                } catch (cloudinaryError) {
                    console.error('Error al subir imagen a Cloudinary:', cloudinaryError);
                    return res.status(500).json({ 
                        message: 'Error al subir imagen a Cloudinary', 
                        error: cloudinaryError.message 
                    });
                }
            } else {
                console.log('No hay imagen, usando valor por defecto');
                cursoData.imagen = 'https://via.placeholder.com/400x300?text=Sin+Imagen';
            }

            // Validar campos obligatorios
            const error = validarCamposObligatorios(cursoData);
            if (error) {
                console.log('Error de validación:', error);
                return res.status(400).json({ message: error });
            }

            const curso = await Curso.crear(cursoData);
            
            res.status(201).json({ 
                message: 'Curso creado exitosamente', 
                curso 
            });
        } catch (error) {
            console.error('Error en createCurso:', error);
            res.status(500).json({ 
                message: 'Error al crear el curso', 
                error: error.message 
            });
        }
    }
];

actividadController.updateCurso = async (req, res) => {
    try {
        const curso = await Actividad.findOne({ where: { id: req.params.id, tipoActividad: 'Curso' } });
        if (!curso) {
            return res.status(404).json({ message: 'Curso no encontrado' });
        }
        await curso.update(req.body);
        res.status(200).json({ message: 'Curso actualizado exitosamente', curso });
    } catch (error) {
        console.error('Error en updateCurso:', error);
        res.status(500).json({ message: 'Error al actualizar el curso' });
    }
};

actividadController.deleteCurso = async (req, res) => {
    try {
        const curso = await Actividad.findOne({ where: { id: req.params.id, tipoActividad: 'Curso' } });
        if (!curso) {
            return res.status(404).json({ message: 'Curso no encontrado' });
        }
        await curso.update({ activo: false });
        res.json({ message: 'Curso desactivado correctamente', curso });
    } catch (error) {
        console.error('Error en deleteCurso:', error);
        res.status(500).json({ message: 'Error al eliminar el curso' });
    }
};

// =============== TALLERES ===============

actividadController.getAllTalleres = async (req, res) => {
    try {
        // Si no hay parámetros de paginación, devolver todos
        if (!req.query.page && !req.query.limit) {
            const talleres = await Actividad.findAll({
                where: { tipoActividad: 'Taller' },
                order: [['createdAt', 'DESC']]
            });
            return res.status(200).json(talleres);
        }

        // Con paginación
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 4;
        const offset = (page - 1) * limit;

        const { count, rows: talleres } = await Actividad.findAndCountAll({
            where: { tipoActividad: 'Taller' },
            limit: limit,
            offset: offset,
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({
            talleres: talleres,
            pagination: {
                total: count,
                page: page,
                limit: limit,
                totalPages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error('Error en getAllTalleres:', error);
        res.status(500).json({ message: 'Error al obtener los talleres' });
    }
};

actividadController.getTalleresActivos = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 4;
        const offset = (page - 1) * limit;

        const { count, rows: talleres } = await Actividad.findAndCountAll({
            where: { tipoActividad: 'Taller', activo: true },
            limit: limit,
            offset: offset,
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({
            talleres: talleres,
            pagination: {
                total: count,
                page: page,
                limit: limit,
                totalPages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error('Error en getTalleresActivos:', error);
        res.status(500).json({ message: 'Error al obtener los talleres activos' });
    }
};

actividadController.getTallerById = async (req, res) => {
    try {
        const taller = await Actividad.findOne({ where: { id: req.params.id, tipoActividad: 'Taller' } });
        if (!taller) {
            return res.status(404).json({ message: 'Taller no encontrado' });
        }
        res.status(200).json(taller);
    } catch (error) {
        console.error('Error en getTallerById:', error);
        res.status(500).json({ message: 'Error al obtener el taller' });
    }
};

actividadController.createTaller = [
    upload.single('imagen'),
    async (req, res) => {
        try {
            console.log('=== CREAR TALLER ===');
            console.log('Body recibido:', req.body);
            console.log('Archivo recibido:', req.file ? 'SÍ' : 'NO');
            
            const tallerData = { ...req.body };
            
            // Convertir strings booleanos
            if (tallerData.activo === 'true') tallerData.activo = true;
            if (tallerData.activo === 'false') tallerData.activo = false;
            
            // Si hay imagen, subirla a Cloudinary
            if (req.file) {
                console.log('Subiendo imagen a Cloudinary...');
                try {
                    const imageUrl = await subirImagenACloudinary(req.file.buffer, req.file.originalname);
                    tallerData.imagen = imageUrl;
                } catch (cloudinaryError) {
                    console.error('Error al subir imagen a Cloudinary:', cloudinaryError);
                    return res.status(500).json({ 
                        message: 'Error al subir imagen a Cloudinary', 
                        error: cloudinaryError.message 
                    });
                }
            } else {
                console.log('No hay imagen, usando valor por defecto');
                tallerData.imagen = 'https://via.placeholder.com/400x300?text=Sin+Imagen';
            }

            // Validar campos obligatorios
            const error = validarCamposObligatorios(tallerData);
            if (error) {
                console.log('Error de validación:', error);
                return res.status(400).json({ message: error });
            }

            tallerData.tipoActividad = 'Taller';
            const taller = await Actividad.create(tallerData);
            
            res.status(201).json({ 
                message: 'Taller creado exitosamente', 
                taller 
            });
        } catch (error) {
            console.error('Error en createTaller:', error);
            res.status(500).json({ 
                message: 'Error al crear el taller', 
                error: error.message 
            });
        }
    }
];

actividadController.updateTaller = async (req, res) => {
    try {
        const taller = await Actividad.findOne({ where: { id: req.params.id, tipoActividad: 'Taller' } });
        if (!taller) {
            return res.status(404).json({ message: 'Taller no encontrado' });
        }
        await taller.update(req.body);
        res.status(200).json({ message: 'Taller actualizado exitosamente', taller });
    } catch (error) {
        console.error('Error en updateTaller:', error);
        res.status(500).json({ message: 'Error al actualizar el taller' });
    }
};

actividadController.deleteTaller = async (req, res) => {
    try {
        const taller = await Actividad.findOne({ where: { id: req.params.id, tipoActividad: 'Taller' } });
        if (!taller) {
            return res.status(404).json({ message: 'Taller no encontrado' });
        }
        await taller.update({ activo: false });
        res.json({ message: 'Taller desactivado correctamente', taller });
    } catch (error) {
        console.error('Error en deleteTaller:', error);
        res.status(500).json({ message: 'Error al eliminar el taller' });
    }
};

// =============== CAPACITACIONES ===============

actividadController.getAllCapacitaciones = async (req, res) => {
    try {
        // Si no hay parámetros de paginación, devolver todos
        if (!req.query.page && !req.query.limit) {
            const capacitaciones = await Actividad.findAll({
                where: { tipoActividad: 'Capacitacion' },
                order: [['createdAt', 'DESC']]
            });
            return res.status(200).json(capacitaciones);
        }

        // Con paginación
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 4;
        const offset = (page - 1) * limit;

        const { count, rows: capacitaciones } = await Actividad.findAndCountAll({
            where: { tipoActividad: 'Capacitacion' },
            limit: limit,
            offset: offset,
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({
            capacitaciones: capacitaciones,
            pagination: {
                total: count,
                page: page,
                limit: limit,
                totalPages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error('Error en getAllCapacitaciones:', error);
        res.status(500).json({ message: 'Error al obtener las capacitaciones' });
    }
};

actividadController.getCapacitacionesActivas = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 4;
        const offset = (page - 1) * limit;

        const { count, rows: capacitaciones } = await Actividad.findAndCountAll({
            where: { tipoActividad: 'Capacitacion', activo: true },
            limit: limit,
            offset: offset,
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({
            capacitaciones: capacitaciones,
            pagination: {
                total: count,
                page: page,
                limit: limit,
                totalPages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error('Error en getCapacitacionesActivas:', error);
        res.status(500).json({ message: 'Error al obtener las capacitaciones activas' });
    }
};

actividadController.getCapacitacionById = async (req, res) => {
    try {
        const capacitacion = await Actividad.findOne({ where: { id: req.params.id, tipoActividad: 'Capacitacion' } });
        if (!capacitacion) {
            return res.status(404).json({ message: 'Capacitación no encontrada' });
        }
        res.status(200).json(capacitacion);
    } catch (error) {
        console.error('Error en getCapacitacionById:', error);
        res.status(500).json({ message: 'Error al obtener la capacitación' });
    }
};

// En el método createCapacitacion, AGREGAR esta conversión después de validar campos:
actividadController.createCapacitacion = [
    upload.single('imagen'),
    async (req, res) => {
        try {
            console.log('=== CREAR CAPACITACIÓN ===');
            console.log('Body recibido:', req.body);
            console.log('Archivo recibido:', req.file ? 'SÍ' : 'NO');
            
            const capacitacionData = { ...req.body };
            
            // Convertir strings booleanos
            if (capacitacionData.activo === 'true') capacitacionData.activo = true;
            if (capacitacionData.activo === 'false') capacitacionData.activo = false;
            
            // AGREGAR CONVERSIÓN DE MODALIDAD
            if (capacitacionData.modalidad) {
                // Convertir primera letra a mayúscula
                capacitacionData.modalidad = capacitacionData.modalidad.charAt(0).toUpperCase() + 
                                           capacitacionData.modalidad.slice(1).toLowerCase();
            }
            console.log('Modalidad convertida:', capacitacionData.modalidad);
            
            // Si hay imagen, subirla a Cloudinary
            if (req.file) {
                console.log('Subiendo imagen a Cloudinary...');
                try {
                    const imageUrl = await subirImagenACloudinary(req.file.buffer, req.file.originalname);
                    capacitacionData.imagen = imageUrl;
                } catch (cloudinaryError) {
                    console.error('Error al subir imagen a Cloudinary:', cloudinaryError);
                    return res.status(500).json({ 
                        message: 'Error al subir imagen a Cloudinary', 
                        error: cloudinaryError.message 
                    });
                }
            } else {
                console.log('No hay imagen, usando valor por defecto');
                capacitacionData.imagen = 'https://via.placeholder.com/400x300?text=Sin+Imagen';
            }

            // Validar campos obligatorios
            const error = validarCamposObligatorios(capacitacionData);
            if (error) {
                console.log('Error de validación:', error);
                return res.status(400).json({ message: error });
            }

            // VALIDAR MODALIDAD ESPECÍFICA
            const modalidadesValidas = ['Presencial', 'Virtual', 'Hibrida'];
            if (capacitacionData.modalidad && !modalidadesValidas.includes(capacitacionData.modalidad)) {
                return res.status(400).json({ 
                    message: 'Modalidad inválida. Debe ser: Presencial, Virtual o Hibrida' 
                });
            }

            console.log('Datos finales de la capacitación:', capacitacionData);

            capacitacionData.tipoActividad = 'Capacitacion';
            const capacitacion = await Actividad.create(capacitacionData);
            
            console.log('Capacitación guardada exitosamente:', capacitacion);
            
            res.status(201).json({ 
                message: 'Capacitación creada exitosamente', 
                capacitacion 
            });
        } catch (error) {
            console.error('Error completo en createCapacitacion:', error);
            res.status(500).json({ 
                message: 'Error al crear la capacitación', 
                error: error.message 
            });
        }
    }
];

actividadController.updateCapacitacion = async (req, res) => {
    try {
        const capacitacion = await Actividad.findOne({ where: { id: req.params.id, tipoActividad: 'Capacitacion' } });
        if (!capacitacion) {
            return res.status(404).json({ message: 'Capacitación no encontrada' });
        }
        await capacitacion.update(req.body);
        res.status(200).json({ message: 'Capacitación actualizada exitosamente', capacitacion });
    } catch (error) {
        console.error('Error en updateCapacitacion:', error);
        res.status(500).json({ message: 'Error al actualizar la capacitación' });
    }
};

actividadController.deleteCapacitacion = async (req, res) => {
    try {
        const capacitacion = await Actividad.findOne({ where: { id: req.params.id, tipoActividad: 'Capacitacion' } });
        if (!capacitacion) {
            return res.status(404).json({ message: 'Capacitación no encontrada' });
        }
        await capacitacion.update({ activo: false });
        res.json({ message: 'Capacitación desactivada correctamente', capacitacion });
    } catch (error) {
        console.error('Error en deleteCapacitacion:', error);
        res.status(500).json({ message: 'Error al eliminar la capacitación' });
    }
};

actividadController.createActividad = async (req, res) => {
    try {
        console.log('=== CREAR ACTIVIDAD GENÉRICA ===');
        console.log('Body recibido:', req.body);
        
        const actividadData = { ...req.body };
        
        // Convertir strings booleanos
        if (actividadData.activo === 'true') actividadData.activo = true;
        if (actividadData.activo === 'false') actividadData.activo = false;
        
        // Si no hay imagen, usar valor por defecto
        if (!actividadData.imagen) {
            actividadData.imagen = 'https://via.placeholder.com/400x300?text=Sin+Imagen';
        }

        // Validar campos obligatorios
        const error = validarCamposObligatorios(actividadData);
        if (error) {
            console.log('Error de validación:', error);
            return res.status(400).json({ message: error });
        }

        const actividad = await Actividad.create(actividadData);
        
        res.status(201).json({ 
            message: 'Actividad creada exitosamente', 
            actividad 
        });
    } catch (error) {
        console.error('Error en createActividad:', error);
        res.status(500).json({ 
            message: 'Error al crear la actividad', 
            error: error.message 
        });
    }
};

actividadController.deleteActividad = async (req, res) => {
    try {
        const actividad = await Actividad.findByPk(req.params.id);
        if (!actividad) {
            return res.status(404).json({ message: 'Actividad no encontrada' });
        }
        await actividad.update({ activo: false });
        res.json({ message: 'Actividad desactivada correctamente', actividad });
    } catch (error) {
        console.error('Error en deleteActividad:', error);
        res.status(500).json({ message: 'Error al eliminar la actividad' });
    }
};

module.exports = actividadController;