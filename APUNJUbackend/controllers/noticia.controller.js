const { Noticia } = require('../models');
const multer = require('multer');
const streamifier = require('streamifier');
const cloudinary = require('../config/cloudinary');
const CloudinaryOptimizer = require('../utils/cloudinary-optimizer');
const upload = multer({ storage: multer.memoryStorage() })

// Obtener todas las noticias con paginación opcional
exports.obtenerNoticias = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 4; // Límite de 4 por defecto
    const offset = (page - 1) * limit;

    const { count, rows: noticias } = await Noticia.findAndCountAll({
      order: [['createdAt', 'DESC']],
      limit: limit,
      offset: offset
    });

    // Optimizar URLs de imágenes de Cloudinary
    const noticiasOptimizadas = noticias.map(noticia => {
      const noticiaData = noticia.toJSON();
      if (noticiaData.imagenUrl) {
        noticiaData.imagenUrl = CloudinaryOptimizer.thumbnail(noticiaData.imagenUrl);
      }
      return noticiaData;
    });

    res.status(200).json({
      noticias: noticiasOptimizadas,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error al obtener noticias:', error);
    res.status(500).json({ message: 'Error al obtener noticias', error: error.message });
  }
};

// Obtener una noticia por ID
exports.obtenerNoticiaPorId = async (req, res) => {
  try {
    const noticia = await Noticia.findByPk(req.params.id);
    if (!noticia) {
      return res.status(404).json({ message: 'Noticia no encontrada' });
    }
    
    const noticiaData = noticia.toJSON();
    if (noticiaData.imagenUrl) {
      noticiaData.imagenUrl = CloudinaryOptimizer.large(noticiaData.imagenUrl);
    }
    
    res.status(200).json(noticiaData);
  } catch (error) {
    console.error('Error al obtener la noticia:', error);
    res.status(500).json({ message: 'Error al obtener la noticia', error: error.message });
  }
};

// Crear una nueva noticia
exports.crearNoticia = async (req, res) => {
  try {
    const nuevaNoticia = await Noticia.create(req.body);
    res.status(201).json(nuevaNoticia);
  } catch (error) {
    console.error('Error al crear la noticia:', error);
    res.status(500).json({ message: 'Error al crear la noticia', error: error.message });
  }
};

// Actualizar una noticia existente
exports.actualizarNoticia = async (req, res) => {
  try {
    const noticia = await Noticia.findByPk(req.params.id);

    if (!noticia) {
      return res.status(404).json({ message: 'Noticia no encontrada' });
    }

    await noticia.update(req.body);
    res.status(200).json(noticia);
  } catch (error) {
    console.error('Error al actualizar la noticia:', error);
    res.status(500).json({ message: 'Error al actualizar la noticia', error: error.message });
  }
};

// Eliminar una noticia por ID
exports.eliminarNoticia = async (req, res) => {
  try {
    const noticia = await Noticia.findByPk(req.params.id);

    if (!noticia) {
      return res.status(404).json({ message: 'Noticia no encontrada' });
    }

    await noticia.destroy();
    res.status(200).json({ message: 'Noticia eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar la noticia:', error);
    res.status(500).json({ message: 'Error al eliminar la noticia', error: error.message });
  }
};
// Función para subir imagen a Cloudinary
const subirImagenACloudinary = (buffer, nombreArchivo) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: 'noticias',
                resource_type: 'auto',
                publicid: `noticia${Date.now()}${nombreArchivo.replace(/[^a-zA-Z0-9]/g, '')}`,
                transformation: [
                    { width: 800, height: 600, crop: 'limit' },
                    { quality: 'auto' }
                ]
            },
            (error, result) => {
                if (error) reject(error);
                else resolve(result.secure_url);
            }
        );
        streamifier.createReadStream(buffer).pipe(stream);
    });
};

exports.subirImagen = [
    upload.single('imagen'),
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ message: 'No se subió ninguna imagen' });
            }
            const imageUrl = await subirImagenACloudinary(req.file.buffer, req.file.originalname);
            return res.json({ url: imageUrl });
        } catch (err) {
            res.status(500).json({ message: 'Error al subir imagen', error: err.message });
        }
    }
];

