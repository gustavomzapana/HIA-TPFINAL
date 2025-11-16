/**
 * Utilidades para optimizar imágenes de Cloudinary
 */

/**
 * Optimiza una URL de Cloudinary agregando transformaciones para mejorar el rendimiento
 * @param {string} imageUrl - URL original de Cloudinary
 * @param {object} options - Opciones de transformación
 * @returns {string} - URL optimizada
 */
function optimizeCloudinaryUrl(imageUrl, options = {}) {
  if (!imageUrl || !imageUrl.includes('cloudinary.com')) {
    return imageUrl;
  }

  const {
    width = 'auto',
    quality = 'auto:good',
    format = 'auto',
    fetchFormat = 'auto',
    crop = 'fill',
    gravity = 'auto'
  } = options;

  // Construir la cadena de transformaciones
  const transformations = [
    `w_${width}`,
    `q_${quality}`,
    `f_${format}`,
    `c_${crop}`,
    `g_${gravity}`,
    'dpr_auto', // Adaptive DPR (Device Pixel Ratio)
    'fl_progressive', // Progressive JPEG
    'fl_lossy' // Lossy compression para mejor rendimiento
  ].join(',');

  // Insertar transformaciones en la URL
  // Ejemplo: https://res.cloudinary.com/demo/image/upload/v1234/sample.jpg
  // Resultado: https://res.cloudinary.com/demo/image/upload/w_800,q_auto:good,f_auto,.../v1234/sample.jpg
  
  const uploadIndex = imageUrl.indexOf('/upload/');
  if (uploadIndex === -1) {
    return imageUrl;
  }

  const beforeUpload = imageUrl.substring(0, uploadIndex + 8);
  const afterUpload = imageUrl.substring(uploadIndex + 8);

  return `${beforeUpload}${transformations}/${afterUpload}`;
}

/**
 * Optimiza URLs de Cloudinary para diferentes contextos
 */
const CloudinaryOptimizer = {
  // Para thumbnails pequeños (cards, listados)
  thumbnail: (url) => optimizeCloudinaryUrl(url, {
    width: 400,
    quality: 'auto:low',
    crop: 'fill',
    gravity: 'auto'
  }),

  // Para imágenes medianas (carrusel, detalles)
  medium: (url) => optimizeCloudinaryUrl(url, {
    width: 800,
    quality: 'auto:good',
    crop: 'fill',
    gravity: 'auto'
  }),

  // Para imágenes grandes (vista completa)
  large: (url) => optimizeCloudinaryUrl(url, {
    width: 1200,
    quality: 'auto:good',
    crop: 'limit',
    gravity: 'auto'
  }),

  // Para carrusel específicamente
  carousel: (url) => optimizeCloudinaryUrl(url, {
    width: 1920,
    quality: 'auto:eco', // Menor calidad para carga rápida
    crop: 'fill',
    gravity: 'auto'
  }),

  // Optimización genérica
  auto: optimizeCloudinaryUrl
};

module.exports = CloudinaryOptimizer;
