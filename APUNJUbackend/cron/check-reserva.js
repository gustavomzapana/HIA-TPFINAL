const cron = require('node-cron');
const mongoose = require('mongoose');
const Fecha = require('../models/fecha');
const Reserva = require('../models/reserva');
require('dotenv').config();

// Conectar a la base de datos
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tu_base_de_datos', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Conectado a MongoDB para el trabajo programado');
}).catch(err => {
  console.error('Error conectando a MongoDB:', err);
});

async function actualizarFechasYReservas() {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0); // Establecer a inicio del día actual

  try {
    // 1. Encontrar fechas que terminan hoy y no están ya finalizadas
    const fechasParaFinalizar = await Fecha.find({
      fecha: { $lt: new Date(hoy.getTime() + (24 * 60 * 60 * 1000)) }, // Antes de que termine hoy
      estado: { $ne: 'finalizada' }
    });

    console.log(`[${new Date().toISOString()}] Encontradas ${fechasParaFinalizar.length} fechas para finalizar`);

    // 2. Actualizar cada fecha a estado 'finalizada'
    for (const fecha of fechasParaFinalizar) {
      // Actualizar la fecha a estado 'finalizada'
      await Fecha.findByIdAndUpdate(fecha._id, { estado: 'finalizada' });
      console.log(`Fecha ${fecha._id} actualizada a estado 'finalizada'`);

      // 3. Verificar si todas las fechas de la reserva están finalizadas
      const reservaId = fecha.reserva;
      const fechasDeReserva = await Fecha.find({ reserva: reservaId });
      
      const todasFinalizadas = fechasDeReserva.every(f => 
        f.estado === 'finalizada' || f._id.toString() === fecha._id.toString()
      );

      // 4. Si todas las fechas están finalizadas, actualizar la reserva
      if (todasFinalizadas) {
        await Reserva.findByIdAndUpdate(reservaId, { estado: 'finalizada' });
        console.log(`Reserva ${reservaId} actualizada a estado 'finalizada'`);
      }
    }

    console.log(`[${new Date().toISOString()}] Proceso de actualización completado`);
  } catch (error) {
    console.error('Error en el trabajo programado:', error);
  } finally {
    // No cerrar la conexión si el script debe seguir corriendo
    // mongoose.connection.close();
  }
}

// Programar la tarea para ejecutarse todos los días a las 23:59
cron.schedule('59 23 * * *', () => {
  console.log(`[${new Date().toISOString()}] Ejecutando tarea programada para finalizar fechas`);
  actualizarFechasYReservas();
}, {
  scheduled: true,
  timezone: 'America/Argentina/Buenos_Aires'
});

console.log('Trabajo programado iniciado. Se ejecutará diariamente a las 23:59.');
const Reserva = require('../models/reserva');