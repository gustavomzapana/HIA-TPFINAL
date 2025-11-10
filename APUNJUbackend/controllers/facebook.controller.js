const axios = require('axios');
const { Noticia } = require('../models');

exports.syncFacebookPosts = async (req, res) => {
  try {
    const PAGE_ID = process.env.FB_PAGE_ID; // ID de tu página
    const PAGE_TOKEN = process.env.FB_PAGE_TOKEN; // Token de tu .env

    const fbResponse = await axios.get(`https://graph.facebook.com/v20.0/${PAGE_ID}/posts`, {
      params: {
        fields: 'message,created_time,full_picture,permalink_url',
        limit: 5,
        access_token: PAGE_TOKEN
      }
    });

    const posts = fbResponse.data.data;
    const nuevasNoticias = [];

    for (const post of posts) {
      // Evita duplicados por enlace
      const yaExiste = await Noticia.findOne({ where: { link: post.permalink_url } });
      if (yaExiste) continue;

      const nueva = await Noticia.create({
        titulo: post.message?.substring(0, 60) || 'Publicación de Facebook',
        message: post.message || 'Sin mensaje',
        link: post.permalink_url,
        imagenUrl: post.full_picture,
        origen: 'facebook'
      });

      nuevasNoticias.push(nueva);
    }

    res.json({
      status: 'ok',
      nuevas: nuevasNoticias.length,
      publicaciones: nuevasNoticias
    });
  } catch (error) {
    console.error('Error al sincronizar publicaciones de Facebook:', error);
    res.status(500).json({ message: 'Error al sincronizar publicaciones', error: error.message });
  }
};



