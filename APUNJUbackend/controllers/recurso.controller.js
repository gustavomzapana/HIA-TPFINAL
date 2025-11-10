const { Recurso } = require('../models');
const { Op } = require('sequelize');
const multer = require('multer');
const streamifier = require('streamifier');
const cloudinary = require('../config/cloudinary');
const upload = multer({ storage: multer.memoryStorage() })


const recursoController = {};

/** 
 * @desc    Crear un nuevo recurso
 * @route   POST /api/recursos
 * @access  Private/Admin
 */
recursoController.crearRecurso = async (req, res) => {
    try {
        const { nombre,ubicacion,caracteristicas,descripcion,imagen,capacidad,precios } = req.body;

        // Validar campos requeridos
        if (!nombre || !caracteristicas || !descripcion || !imagen || !capacidad || !precios) {
            return res.status(400).json({
                error: 'Todos los campos son obligatorios'
            });
        }

        // Crear el nuevo recurso
        const nuevoRecurso = await Recurso.create({
            nombre,
            ubicacion,
            caracteristicas,
            descripcion,
            imagen,
            capacidad,
            precios
        });

        res.status(201).json({
            mensaje: 'Recurso creado exitosamente',
            recurso: nuevoRecurso
        });

    } catch (error) {
        console.error('Error al crear recurso:', error);
        res.status(500).json({
            error: 'Error al crear el recurso',
            detalle: error.message
        });
    }
};

recursoController.getRecursos = async (req, res) => {
    try {
        const recursos = await Recurso.findAll();
        res.status(200).json(recursos);
    } catch (error) {
        console.error('Error al obtener recursos:', error);
        res.status(500).json({
            error: 'Error al obtener los recursos',
            detalle: error.message
        });
    }
};


recursoController.getRecursoById = async (req, res) => {
    try {
        const recursoId = req.params.id || req.query.id;
        
        if (!recursoId) {
            return res.status(400).json({
                error: 'ID no proporcionado',
                detalle: 'Se requiere un ID de recurso'
            });
        }

        const recurso = await Recurso.findByPk(recursoId);
        if (!recurso) {
            return res.status(404).json({
                error: 'Recurso no encontrado',
                detalle: `No existe un recurso con ID: ${req.params.id}`
            });
        }
        res.status(200).json(recurso);
    } catch (error) {
        console.error('Error al obtener recurso:', error);
        res.status(500).json({
            error: 'Error al obtener el recurso',
            detalle: error.message
        });
    }
};

recursoController.updateRecurso = async (req, res) => {
    try {
        const recursoId = req.query.id;
        const { nombre, descripcion, tipo, disponible, ubicacion, precios, capacidad, estado, caracteristicas, imagen } = req.body;

        if (!recursoId) {
            return res.status(400).json({
                error: 'ID no proporcionado',
                detalle: 'Se requiere un ID de recurso para actualizar'
            });
        }

        const updateData = {
            nombre,
            descripcion,
            tipo,
            disponible,
            ubicacion,
            precios,
            capacidad,
            estado,
            caracteristicas,
            imagen
        };

        // Remove undefined fields
        Object.keys(updateData).forEach(key => 
            updateData[key] === undefined && delete updateData[key]
        );

        const [updated] = await Recurso.update(updateData, {
            where: { id: recursoId }
        });

        if (!updated) {
            return res.status(404).json({
                error: 'Recurso no encontrado',
                detalle: `No se encontró un recurso con ID: ${recursoId}`
            });
        }

        const recursoActualizado = await Recurso.findByPk(recursoId);

        res.status(200).json({
            mensaje: 'Recurso actualizado exitosamente',
            recurso: recursoActualizado
        });
    } catch (error) {
        console.error('Error al actualizar el recurso:', error);
        res.status(500).json({
            error: 'Error al actualizar el recurso',
            detalle: error.message
        });
    }
};

recursoController.deleteRecurso = async (req, res) => {
    try {
        const recursoId = req.query.id;

        if (!recursoId) {
            return res.status(400).json({
                error: 'ID no proporcionado',
                detalle: 'Se requiere un ID de recurso para eliminar'
            });
        }

        const deleted = await Recurso.destroy({
            where: { id: recursoId }
        });

        if (!deleted) {
            return res.status(404).json({
                error: 'Recurso no encontrado',
                detalle: `No se encontró un recurso con ID: ${recursoId}`
            });
        }

        res.status(200).json({
            mensaje: 'Recurso eliminado exitosamente'
        });
    } catch (error) {
        console.error('Error al eliminar el recurso:', error);
        res.status(500).json({
            error: 'Error al eliminar el recurso',
            detalle: error.message
        });
    }
};

recursoController.subirImagen = [
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


const subirImagenACloudinary = (buffer, nombreArchivo) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: 'recursos',
                resource_type: 'auto',
                public_id: `recurso_${Date.now()}_${nombreArchivo.replace(/[^a-zA-Z0-9]/g, '_')}`,
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

module.exports = recursoController;