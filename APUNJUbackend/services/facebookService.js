const axios = require('axios');
const Noticia = require('../models/noticia'); // Modelo de Noticia

const facebookService = {
  // Función para obtener las últimas publicaciones de Facebook
  async obtenerUltimasPublicaciones() {
    try {
      const PAGE_ACCESS_TOKEN = 'EAAKg29ZAm1YcBPIyiH9ZAZBtZBHkbwNkjLpUqZBD59FWK17n1NuwvMayhO0DZCDxlr4FCdrtQ6qspinYOtiogYCLZB1v2Dt5zJD7a5PAgKWUyD7pDrijefCuAEBgkgv0ilftgNdZBVAXwR68H5GSCGFQ8ps8aBNwnQt7kupN50wfop2J0tFeaIvaxC9Jf2YoZCLLkjwADqyzKCDFZCVlmKyZCAfqAwclSANTjJ0'; // El token de acceso
      const PAGE_ID = '678362008700536'; // ID de tu página de Facebook

      // Hacemos una solicitud para obtener las últimas publicaciones
      const response = await axios.get(`https://graph.facebook.com/${PAGE_ID}/posts`, {
        params: {
          access_token: PAGE_ACCESS_TOKEN,
          limit: 5, // Limitar a 5 publicaciones
          fields: 'id,message,created_time', // Los campos que queremos obtener
        },
      });

      const publicaciones = response.data.data;

      // Procesamos las publicaciones y las guardamos como noticias en la base de datos
      const noticias = publicaciones.map(post => ({
        id: post.id,
        message: post.message || 'Sin mensaje',
        created_time: post.created_time,
        link: `https://www.facebook.com/${post.id}`, // Link directo a la publicación
      }));

      // Insertamos las noticias en la base de datos
      await Noticia.insertMany(noticias);

      return noticias; // Retornamos las noticias obtenidas
    } catch (error) {
      console.error('Error al obtener publicaciones de Facebook:', error.message);
      throw error;
    }
  },
};

module.exports = facebookService;


