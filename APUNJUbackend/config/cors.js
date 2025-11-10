
const corsOptions = {
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://tu-dominio-prod.com']  // URLs permitidas en producción
        : ['http://localhost:3000'],       // URL del frontend en desarrollo
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};

module.exports = corsOptions;