const Reserva = require('../models/reserva.js')  ;
const reservaService = {

  getReservasPorMesEnAnio: async (anio) => {
  const resultado = await Reserva.aggregate([
    // Filtrar reservas con estado 'finalizada' o 'confirmada'
    {
      $match: {
        estado: { $in: ['finalizada', 'confirmada'] }
      }
    },

    // Traer las fechas referenciadas desde la colección 'fechas'
    {
      $lookup: {
        from: 'fechas', // nombre de la tabla como está en la base de datos
        localField: 'fechas',
        foreignField: '_id',
        as: 'fechasInfo'
      }
    },

    // Desenrollar el array de fechas obtenidas
    { $unwind: '$fechasInfo' },

    // Filtrar solo las fechas en estado 'reservado'
    {
      $match: {
        'fechasInfo.estado': 'reservado'
      }
    },

    // Filtrar fechas dentro del año específico
    {
      $match: {
        'fechasInfo.fecha': {
          $gte: new Date(`${anio}-01-01`),
          $lt: new Date(`${+anio + 1}-01-01`)
        }
      }
    },
    // Agrupar por mes
    {
      $group: {
        _id: { $month: '$fechasInfo.fecha' },
        cantidad: { $sum: 1 }
      }
    },
    // Proyección final
    {
      $project: {
        mes: '$_id',
        cantidad: 1,
        _id: 0
      }
    },
    // Ordenar por mes ascendente
    { $sort: { mes: 1 } }
  ]);
  // Asegurarse de devolver todos los meses del año, aunque no tengan reservas
  const mesesCompletos = Array.from({ length: 12 }, (_, i) => {
    const mesExistente = resultado.find(m => m.mes === i + 1);
    return {
      mes: i + 1,
      cantidad: mesExistente ? mesExistente.cantidad : 0
    };
  });

  return mesesCompletos;
}

};

module.exports = reservaService;

