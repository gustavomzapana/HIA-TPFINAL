require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');
const path = require('path');
const facebookRoutes = require('./routes/facebook.route.js');
const noticiaRoutes = require('./routes/noticia.route');
const corsOptions = require('./config/cors'); // ruta ajusta si es otra

var app = express();
//middlewares

//app.use(cors(corsOptions));
//app.options('*', cors(corsOptions)); // responde OPTIONS globalmente
app.use(cors({
    origin: ['http://localhost', 'http://localhost:4200', 'http://localhost:80'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

//Conexión a la base de datos MariaDB
sequelize.authenticate()
    .then(() => {
        console.log("🟢 Conectado a MariaDB");
        console.log("🟢 Conexión a MariaDB establecida");

        // Sincronizar modelos para crear tablas si no existen
        return sequelize.sync({ force: false, alter: false });
    })
    .then(() => {
        console.log("✅ Tablas verificadas y sincronizadas");

        //Cargamos el modulo de direccionamiento de rutas
        app.use('/api/usuarios', require('./routes/usuario.routes.js'));
        app.use('/api/recursos', require('./routes/recurso.routes.js'));
        app.use('/api/reservas', require('./routes/reserva.routes.js'));
        app.use('/api/actividades', require('./routes/actividad.routes.js'));
        app.use('/api/inscripciones', require('./routes/inscripcion.routes.js'));
        // app.use('/api/pagos', require('./routes/mp.routes.js'));
        app.use('/api/fechas', require('./routes/fecha.routes.js'));
        app.use('/api/facebook', require('./routes/facebook.route.js'));
        app.use('/api/noticias', require('./routes/noticia.route.js'));

        //ruta  que usa el autenticador de google
        app.use('/api/autenticacion', require('./routes/autenticacion.route.js'));

        //setting
        app.set("port", process.env.PORT || 3000);

        //starting the server
        app.listen(app.get("port"), () => {
            console.log("🚀 Servidor levantado en el puerto", app.get("port"));
            require('./cron/enviarMensajeCumpleanos'); // Iniciar el cron al arrancar el servidor
            console.log("✅ Cron de cumpleaños configurado - Se ejecuta diariamente a las 9:00 AM");
            console.log("⏰ Cron de cumpleaños iniciado");
        });
    })
    .catch(err => {
        console.error("❌ Error al conectar a MariaDB:", err);
        console.error("Detalles del error:", err.message);
        process.exit(1); // Salir del proceso si no se puede conectar a la base de datos
    });
