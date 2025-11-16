const { Sequelize } = require('sequelize');
const { faker } = require('@faker-js/faker');
const cliProgress = require('cli-progress');
const bcrypt = require('bcrypt');

// Configuración de la base de datos
const sequelize = new Sequelize(
  process.env.DB_NAME || 'apunju_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || 'root',
  {
    host: process.env.DB_HOST || 'haproxy',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false,
    pool: {
      max: 20,
      min: 5,
      acquire: 60000,
      idle: 10000
    }
  }
);

// Configuración de cantidades: 500K registros totales distribuidos de forma realista
// Recursos REALES: 5 camionetas + 3 cabañas = 8 recursos
const CONFIG = {
  TOTAL_REGISTROS: parseInt(process.env.TOTAL_REGISTROS || 500000),
  
  // Cantidades fijas reales
  RECURSOS: 8, // 5 camionetas + 3 cabañas (NO MODIFICABLE)
  
  // Distribución del medio millón de registros
  USUARIOS: parseInt(process.env.USUARIOS || 50000),      // 10%
  RESERVAS: parseInt(process.env.RESERVAS || 200000),     // 40% - Muchas reservas históricas
  FECHAS: parseInt(process.env.FECHAS || 200000),         // 40% - Fechas por día completo
  PAGOS: parseInt(process.env.PAGOS || 30000),            // 6%  - No todas las reservas tienen pago online
  ACTIVIDADES: parseInt(process.env.ACTIVIDADES || 10000), // 2%
  INSCRIPCIONES: parseInt(process.env.INSCRIPCIONES || 8000), // 1.6%
  NOTICIAS: parseInt(process.env.NOTICIAS || 2000),       // 0.4%
  
  BATCH_SIZE: parseInt(process.env.BATCH_SIZE || 5000)
};

console.log('🚀 Configuración de generación de datos:');
console.log(JSON.stringify(CONFIG, null, 2));

// Utilidades para generación de datos
const randomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomDate = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

// Generadores de datos por tabla
const generarUsuarios = (cantidad) => {
  const usuarios = [];
  const dependencias = ['dependencia1', 'dependencia2', 'dependencia3', '-'];
  
  console.log('Generando usuarios únicos...');
  console.log('⏳ Este proceso puede tardar 8-12 minutos (hasheando 50,000 passwords con bcrypt)...');
  
  // Arrays para datos rápidos (sin faker)
  const nombres = ['Juan', 'María', 'Carlos', 'Ana', 'Luis', 'Laura', 'Pedro', 'Sofia', 'Jorge', 'Elena', 'Diego', 'Carmen', 'Miguel', 'Isabel', 'Fernando', 'Patricia', 'Ricardo', 'Marta', 'Alberto', 'Rosa'];
  const apellidos = ['García', 'Rodríguez', 'Martínez', 'López', 'González', 'Pérez', 'Sánchez', 'Ramírez', 'Torres', 'Flores', 'Rivera', 'Gómez', 'Díaz', 'Cruz', 'Morales', 'Reyes', 'Jiménez', 'Hernández', 'Ruiz', 'Mendoza'];
  
  for (let i = 0; i < cantidad; i++) {
    // DNI secuencial de 8 dígitos (10000000 a 10050000) - garantiza unicidad
    const dni = String(10000000 + i);
    
    // Email único simple
    const email = `usuario${i}@apunju.com.ar`;
    
    // Hashear CADA DNI individualmente (contraseña = DNI)
    const passwordHash = bcrypt.hashSync(dni, 4); // 4 rondas para balance velocidad/seguridad
    
    usuarios.push({
      legajo: `LEG${String(i).padStart(8, '0')}`,
      apellido: apellidos[i % apellidos.length],
      nombre: nombres[i % nombres.length],
      fNacimiento: `19${60 + (i % 40)}-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
      dni: dni,
      email: email,
      domicilio: `Calle ${i % 100} N° ${i % 1000}`,
      telefono: `26${String(10000000 + i).toString().slice(-8)}`,
      foto: `https://i.pravatar.cc/150?img=${i % 70}`,
      dependencia: dependencias[i % dependencias.length],
      esAfiliado: i % 2 === 0,
      rol: i < 10 ? 'Administrador' : (i < 5000 ? 'Afiliado' : 'Invitado'),
      password: passwordHash,
      activo: i % 20 !== 0, // 95% activos
      createdAt: new Date(2020 + (i % 5), (i % 12), Math.min((i % 28) + 1, 28)),
      updatedAt: new Date()
    });
    
    // Log de progreso cada 5000 usuarios
    if ((i + 1) % 5000 === 0) {
      console.log(`  Generados ${(i + 1).toLocaleString()}/${cantidad.toLocaleString()} usuarios...`);
    }
  }
  
  return usuarios;
};

const generarRecursos = () => {
  // RECURSOS REALES: 5 camionetas + 3 cabañas
  const recursos = [
    // Camionetas (5)
    {
      nombre: 'Camioneta Toyota Hilux 2023',
      ubicacion: 'Estacionamiento APUNJU - Sector A1',
      caracteristicas: JSON.stringify(['4x4', 'Aire Acondicionado', 'Capacidad 5 personas', 'GPS', 'Bluetooth']),
      descripcion: 'Camioneta 4x4 ideal para viajes y excursiones, combustible incluido para 200km por día.',
      imagen: faker.image.urlLoremFlickr({ category: 'car' }),
      capacidad: 5,
      precios: JSON.stringify({ afiliado: 2500, noAfiliado: 5000 }),
      estado: 'disponible',
      createdAt: new Date('2023-01-15'),
      updatedAt: new Date()
    },
    {
      nombre: 'Camioneta Ford Ranger XLT',
      ubicacion: 'Estacionamiento APUNJU - Sector A2',
      caracteristicas: JSON.stringify(['4x4', 'Doble Cabina', 'Aire Acondicionado', 'Radio', 'Portaequipajes']),
      descripcion: 'Vehículo robusto para terrenos difíciles, ideal para acampar. Combustible incluido.',
      imagen: faker.image.urlLoremFlickr({ category: 'car' }),
      capacidad: 5,
      precios: JSON.stringify({ afiliado: 2300, noAfiliado: 4800 }),
      estado: 'disponible',
      createdAt: new Date('2023-03-20'),
      updatedAt: new Date()
    },
    {
      nombre: 'Camioneta Chevrolet S10 High Country',
      ubicacion: 'Estacionamiento APUNJU - Sector A3',
      caracteristicas: JSON.stringify(['4x4', 'Automatica', 'Cuero', 'Camara Retroceso', 'Control Crucero']),
      descripcion: 'Camioneta de alta gama con todas las comodidades. Perfecta para viajes largos.',
      imagen: faker.image.urlLoremFlickr({ category: 'car' }),
      capacidad: 5,
      precios: JSON.stringify({ afiliado: 2800, noAfiliado: 5500 }),
      estado: 'disponible',
      createdAt: new Date('2023-05-10'),
      updatedAt: new Date()
    },
    {
      nombre: 'Camioneta Nissan Frontier LE',
      ubicacion: 'Estacionamiento APUNJU - Sector A4',
      caracteristicas: JSON.stringify(['4x2', 'Aire Acondicionado', 'Direccion Asistida', 'Radio MP3']),
      descripcion: 'Camioneta económica y confiable para uso urbano y rutas.',
      imagen: faker.image.urlLoremFlickr({ category: 'car' }),
      capacidad: 5,
      precios: JSON.stringify({ afiliado: 2000, noAfiliado: 4200 }),
      estado: 'disponible',
      createdAt: new Date('2022-11-05'),
      updatedAt: new Date()
    },
    {
      nombre: 'Camioneta Volkswagen Amarok V6',
      ubicacion: 'Estacionamiento APUNJU - Sector A5',
      caracteristicas: JSON.stringify(['4x4', 'V6 Turbo', 'Cuero', 'Pantalla Tactil', 'Control Estabilidad']),
      descripcion: 'La más potente de la flota. Excelente para montaña y aventuras extremas.',
      imagen: faker.image.urlLoremFlickr({ category: 'car' }),
      capacidad: 5,
      precios: JSON.stringify({ afiliado: 3000, noAfiliado: 6000 }),
      estado: 'disponible',
      createdAt: new Date('2024-01-12'),
      updatedAt: new Date()
    },
    // Cabañas (3)
    {
      nombre: 'Cabaña "El Refugio" - Capacidad 4 personas',
      ubicacion: 'Complejo APUNJU - Valle de Punilla, Córdoba',
      caracteristicas: JSON.stringify(['2 Dormitorios', 'Cocina Equipada', 'Parrilla', 'WiFi', 'TV', 'Aire Acondicionado', 'Ropa de cama']),
      descripcion: 'Cabaña acogedora con vista a las sierras. Ideal para familias pequeñas.',
      imagen: faker.image.urlLoremFlickr({ category: 'house' }),
      capacidad: 4,
      precios: JSON.stringify({ afiliado: 5000, noAfiliado: 10000 }),
      estado: 'disponible',
      createdAt: new Date('2020-06-01'),
      updatedAt: new Date()
    },
    {
      nombre: 'Cabaña "Rincón Serrano" - Capacidad 6 personas',
      ubicacion: 'Complejo APUNJU - Valle de Punilla, Córdoba',
      caracteristicas: JSON.stringify(['3 Dormitorios', '2 Baños', 'Cocina Completa', 'Parrilla', 'Piscina Compartida', 'WiFi', 'Estacionamiento']),
      descripcion: 'Cabaña espaciosa con todas las comodidades. Acceso a piscina del complejo.',
      imagen: faker.image.urlLoremFlickr({ category: 'house' }),
      capacidad: 6,
      precios: JSON.stringify({ afiliado: 7000, noAfiliado: 14000 }),
      estado: 'disponible',
      createdAt: new Date('2020-06-01'),
      updatedAt: new Date()
    },
    {
      nombre: 'Cabaña "Vista Panorámica" - Capacidad 8 personas',
      ubicacion: 'Complejo APUNJU - Valle de Punilla, Córdoba',
      caracteristicas: JSON.stringify(['4 Dormitorios', '3 Baños', 'Cocina Industrial', 'Quincho Cerrado', 'Jacuzzi', 'WiFi', 'Smart TV', 'Vista 360°']),
      descripcion: 'La cabaña más grande y lujosa. Perfecta para grupos grandes o reuniones familiares.',
      imagen: faker.image.urlLoremFlickr({ category: 'house' }),
      capacidad: 8,
      precios: JSON.stringify({ afiliado: 10000, noAfiliado: 20000 }),
      estado: 'disponible',
      createdAt: new Date('2020-06-01'),
      updatedAt: new Date()
    }
  ];
  
  return recursos;
};

const generarPagos = (cantidad, totalUsuarios) => {
  const pagos = [];
  const estados = ['pendiente', 'aprobado', 'rechazado'];

  for (let i = 0; i < cantidad; i++) {
    pagos.push({
      userId: randomNumber(0, totalUsuarios - 1), // Usar índice, se resolverá con subquery
      importeTotal: (randomNumber(500, 50000) / 100).toFixed(2),
      descripcion: faker.commerce.productDescription(),
      mp_preference_id: faker.string.alphanumeric(30),
      external_reference: faker.string.uuid(),
      estado: randomElement(estados),
      createdAt: randomDate(new Date(2020, 0, 1), new Date()),
      updatedAt: new Date()
    });
  }
  return pagos;
};

const generarReservas = (cantidad, totalUsuarios, totalPagos) => {
  const reservas = [];
  const estados = ['confirmada', 'finalizada']; // Solo estados válidos según el modelo
  const metodosPago = ['planilla', 'mercadoPago', 'efectivo', 'administrativo'];

  for (let i = 0; i < cantidad; i++) {
    reservas.push({
      resourceId: randomNumber(0, 7), // 8 recursos (5 camionetas + 3 cabañas)
      userId: randomNumber(0, totalUsuarios - 1),
      pagoId: randomNumber(0, totalPagos - 1), // Siempre asignar un pagoId (se resolverá con sample)
      estado: randomElement(estados),
      metodoDePago: randomElement(metodosPago),
      createdAt: randomDate(new Date(2020, 0, 1), new Date()),
      updatedAt: new Date()
    });
  }
  return reservas;
};

const generarFechas = (cantidad, totalReservas) => {
  const fechas = [];
  const estados = ['disponible', 'reservado', 'bloqueado', 'finalizada'];
  
  // Fechas por DÍA COMPLETO (no por hora) para los 8 recursos
  // Distribuimos fechas desde 2020 hasta 2026
  const fechaInicio = new Date('2020-01-01');
  const fechaFin = new Date('2026-12-31');
  
  for (let i = 0; i < cantidad; i++) {
    const fecha = randomDate(fechaInicio, fechaFin);
    // Normalizar a medianoche (día completo)
    fecha.setHours(0, 0, 0, 0);
    
    fechas.push({
      recursoId: randomNumber(0, 7), // 8 recursos (0-7)
      reservaId: Math.random() > 0.3 ? randomNumber(0, totalReservas - 1) : null,
      fecha: fecha,
      estado: randomElement(estados),
      createdAt: randomDate(new Date(2020, 0, 1), new Date()),
      updatedAt: new Date()
    });
  }
  return fechas;
};

const generarActividades = (cantidad) => {
  const actividades = [];
  const tiposActividad = ['Taller', 'Curso', 'Capacitacion'];
  const modalidades = ['Presencial', 'Virtual', 'Hibrida'];
  const nombresBase = ['Introducción', 'Avanzado', 'Profesional', 'Taller de', 'Curso de', 'Capacitación en'];
  const temas = ['Excel', 'Programación', 'Diseño', 'Marketing', 'Ventas', 'Liderazgo', 'Finanzas', 'Comunicación'];
  const materialesOpciones = [
    ['Cuaderno', 'Lápices', 'Cartulinas'],
    ['Computadora', 'Software', 'Manual'],
    ['Herramientas', 'Material de lectura']
  ];

  for (let i = 0; i < cantidad; i++) {
    const tipo = randomElement(tiposActividad);
    const fechaInicio = randomDate(new Date(2020, 0, 1), new Date(2025, 6, 1));
    const fechaFin = new Date(fechaInicio);
    fechaFin.setDate(fechaFin.getDate() + randomNumber(7, 90));

    actividades.push({
      imagen: `https://picsum.photos/seed/act${i}/800/600`,
      nombreCurso: `${nombresBase[i % nombresBase.length]} ${temas[i % temas.length]} - ${tipo} ${i + 1}`,
      descripcion: `Descripción de ${tipo} sobre ${temas[i % temas.length]}. Modalidad ${modalidades[i % modalidades.length]}.`,
      fechaInicio: fechaInicio,
      fechaFin: fechaFin,
      precioNoAfiliado: (randomNumber(5000, 50000) / 100).toFixed(2),
      activo: i % 5 !== 0, // 80% activos
      cuposAfiliados: randomNumber(10, 100),
      cuposNoAfiliados: randomNumber(5, 50),
      pagoId: null,
      tipoActividad: tipo,
      duracion: tipo === 'Curso' ? randomNumber(20, 200) : null,
      materiales: tipo === 'Taller' ? JSON.stringify(materialesOpciones[i % materialesOpciones.length]) : null,
      modalidad: tipo === 'Capacitacion' ? randomElement(modalidades) : null,
      createdAt: randomDate(new Date(2020, 0, 1), new Date()),
      updatedAt: new Date()
    });
  }
  return actividades;
};

const generarInscripciones = (cantidad, totalActividades) => {
  const inscripciones = [];
  const tiposActividad = ['Taller', 'Curso', 'Capacitacion'];
  const estados = ['pendiente', 'confirmada', 'cancelada'];
  const metodosPago = ['planilla', 'mercadoPago', 'efectivo'];
  const nombresBase = ['Introducción', 'Avanzado', 'Profesional', 'Taller de', 'Curso de', 'Capacitación en'];
  const temas = ['Excel', 'Programación', 'Diseño', 'Marketing', 'Ventas', 'Liderazgo', 'Finanzas', 'Comunicación'];

  for (let i = 0; i < cantidad; i++) {
    const tipo = randomElement(tiposActividad);
    const esAfiliado = i % 3 === 0; // 33% afiliados
    
    inscripciones.push({
      nombre: faker.person.firstName(),
      apellido: faker.person.lastName(),
      email: `inscripcion${i}@email.com`, // Email único
      telefono: faker.phone.number('##########'),
      dni: String(20000000 + i), // DNI único secuencial
      fechaNacimiento: faker.date.birthdate({ min: 18, max: 80, mode: 'age' }),
      actividadId: randomNumber(0, totalActividades - 1),
      tipoActividad: tipo,
      nombreActividad: `${nombresBase[i % nombresBase.length]} ${temas[i % temas.length]}`,
      esAfiliado: esAfiliado,
      numeroAfiliado: esAfiliado ? `AFF${String(i).padStart(6, '0')}` : null, // Solo si es afiliado
      estado: randomElement(estados),
      pagoId: Math.random() > 0.3 ? randomNumber(0, 1000) : null, // 70% tienen pago
      metodoDePago: Math.random() > 0.3 ? randomElement(metodosPago) : null,
      fechaInscripcion: randomDate(new Date(2020, 0, 1), new Date()),
      createdAt: randomDate(new Date(2020, 0, 1), new Date()),
      updatedAt: new Date()
    });
  }
  return inscripciones;
};

const generarNoticias = (cantidad) => {
  const noticias = [];
  const origenes = ['manual', 'facebook'];

  for (let i = 0; i < cantidad; i++) {
    noticias.push({
      titulo: faker.lorem.sentence(),
      message: faker.lorem.paragraphs(3),
      link: faker.internet.url(),
      imagenUrl: faker.image.url(),
      origen: randomElement(origenes),
      createdAt: randomDate(new Date(2020, 0, 1), new Date()),
      updatedAt: new Date()
    });
  }
  return noticias;
};

// Función para insertar datos con resolución de IDs mediante sample aleatorio
const insertarConSample = async (tabla, datos, batchSize, nombreTabla, idsDisponibles) => {
  const total = datos.length;
  const lotes = Math.ceil(total / batchSize);
  
  const progressBar = new cliProgress.SingleBar({
    format: `${nombreTabla} |{bar}| {percentage}% | {value}/{total} | ETA: {eta}s`,
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true
  });

  progressBar.start(total, 0);

  for (let i = 0; i < lotes; i++) {
    const inicio = i * batchSize;
    const fin = Math.min(inicio + batchSize, total);
    const lote = datos.slice(inicio, fin);

    // Resolver IDs usando el sample
    const loteResuelto = lote.map(item => {
      const resolved = { ...item };
      for (const [campo, ids] of Object.entries(idsDisponibles)) {
        if (item[campo] !== null && item[campo] !== undefined && ids && ids.length > 0) {
          // Usar el índice como posición en el array de IDs
          const index = item[campo] % ids.length;
          resolved[campo] = ids[index];
        }
      }
      return resolved;
    });

    try {
      // Insertar en lote
      await sequelize.query(
        `INSERT INTO ${tabla} (${Object.keys(loteResuelto[0]).join(', ')}) VALUES ${loteResuelto.map(() => '(?)').join(', ')}`,
        {
          replacements: loteResuelto.map(item => Object.values(item)),
          type: Sequelize.QueryTypes.INSERT
        }
      ).catch(async (error) => {
        // Si falla el bulk insert, intentar uno por uno
        for (const item of loteResuelto) {
          try {
            await sequelize.query(
              `INSERT INTO ${tabla} (${Object.keys(item).join(', ')}) VALUES (${Object.keys(item).map(() => '?').join(', ')})`,
              {
                replacements: Object.values(item),
                type: Sequelize.QueryTypes.INSERT
              }
            );
          } catch (err) {
            if (!err.message.includes('Duplicate entry') && !err.message.includes('foreign key constraint')) {
              console.error(`Error insertando en ${tabla}:`, err.message);
            }
          }
        }
      });
    } catch (error) {
      console.error(`Error en lote ${i + 1}/${lotes}:`, error.message);
    }

    progressBar.update(fin);
  }

  progressBar.stop();
};

// Función para insertar datos en lotes (tablas sin FK)
const insertarEnLotes = async (tabla, datos, batchSize, nombreTabla) => {
  const total = datos.length;
  const lotes = Math.ceil(total / batchSize);
  
  const progressBar = new cliProgress.SingleBar({
    format: `${nombreTabla} |{bar}| {percentage}% | {value}/{total} | ETA: {eta}s`,
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true
  });

  progressBar.start(total, 0);

  for (let i = 0; i < lotes; i++) {
    const inicio = i * batchSize;
    const fin = Math.min(inicio + batchSize, total);
    const lote = datos.slice(inicio, fin);

    try {
      await sequelize.query(
        `INSERT INTO ${tabla} (${Object.keys(lote[0]).join(', ')}) VALUES ${lote.map(() => '(?)').join(', ')}`,
        {
          replacements: lote.map(item => Object.values(item)),
          type: Sequelize.QueryTypes.INSERT
        }
      ).catch(async (error) => {
        // Si falla el bulk insert, intentar uno por uno
        for (const item of lote) {
          try {
            await sequelize.query(
              `INSERT INTO ${tabla} (${Object.keys(item).join(', ')}) VALUES (${Object.keys(item).map(() => '?').join(', ')})`,
              {
                replacements: Object.values(item),
                type: Sequelize.QueryTypes.INSERT
              }
            );
          } catch (err) {
            // Ignorar duplicados
            if (!err.message.includes('Duplicate entry')) {
              console.error(`Error insertando en ${tabla}:`, err.message);
              if (err.errors) {
                console.error('Detalles de validación:', JSON.stringify(err.errors, null, 2));
              }
              console.error('Datos que causaron el error:', JSON.stringify(item, null, 2));
            }
          }
        }
      });

      progressBar.update(fin);
    } catch (error) {
      console.error(`Error en lote ${i + 1}/${lotes} de ${tabla}:`, error.message);
    }
  }

  progressBar.stop();
};

// Función principal
const main = async () => {
  try {
    console.log('\n🔌 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa\n');

    // VERIFICAR SI YA EXISTEN DATOS
    const [usuariosExistentes] = await sequelize.query('SELECT COUNT(*) as count FROM usuarios');
    const cantidadUsuarios = usuariosExistentes[0].count;
    
    if (cantidadUsuarios > 0) {
      console.log('ℹ️  Se detectaron datos existentes en la base de datos');
      console.log(`   - Usuarios existentes: ${cantidadUsuarios.toLocaleString()}`);
      console.log('');
      console.log('⚠️  El generador está configurado para NO eliminar datos existentes.');
      console.log('   Si deseas regenerar los datos, ejecuta:');
      console.log('   docker-compose down -v  # Esto eliminará los volúmenes');
      console.log('   docker-compose up -d');
      console.log('');
      console.log('✅ Manteniendo datos existentes. Generador finalizado.');
      process.exit(0);
    }

    // LIMPIAR TABLAS EXISTENTES solo si NO hay datos (primera ejecución)
    console.log('🧹 Primera ejecución detectada. Preparando tablas...');
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    
    // Solo tablas que realmente existen en el modelo
    const tablasALimpiar = ['inscripciones', 'fechas', 'reservas', 'pagos', 'recursos', 'usuarios', 'actividades', 'noticias'];
    
    for (const tabla of tablasALimpiar) {
      try {
        await sequelize.query(`TRUNCATE TABLE ${tabla}`);
        await sequelize.query(`ALTER TABLE ${tabla} AUTO_INCREMENT = 1`);
        console.log(`  ✓ Tabla ${tabla} preparada`);
      } catch (error) {
        // Ignorar si la tabla no existe
        if (error.parent && error.parent.code !== 'ER_NO_SUCH_TABLE') {
          console.log(`  ⚠ Error preparando ${tabla}: ${error.message}`);
        }
      }
    }
    
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('✅ Tablas preparadas para la generación inicial\n');

    const startTime = Date.now();

    // 1. USUARIOS
    console.log(`\n📊 Generando ${CONFIG.USUARIOS.toLocaleString()} usuarios...`);
    const usuarios = generarUsuarios(CONFIG.USUARIOS);
    await insertarEnLotes('usuarios', usuarios, CONFIG.BATCH_SIZE, 'Usuarios');
    
    // Verificar MAX ID real (no COUNT, porque puede haber gaps en AUTO_INCREMENT)
    const [usuariosResult] = await sequelize.query('SELECT MAX(id) as maxId, COUNT(*) as count FROM usuarios');
    const maxUsuarioId = usuariosResult[0].maxId;
    const totalUsuarios = usuariosResult[0].count;
    console.log(`✅ ${totalUsuarios.toLocaleString()} usuarios insertados (ID máximo: ${maxUsuarioId})\n`);

    // Obtener sample de IDs de usuarios (10% o máximo 50k)
    console.log('🔍 Obteniendo sample de IDs de usuarios...');
    const sampleSize = Math.min(50000, Math.ceil(totalUsuarios * 0.1));
    const [usuarioIdsResult] = await sequelize.query(`SELECT id FROM usuarios ORDER BY RAND() LIMIT ${sampleSize}`);
    const usuarioIds = usuarioIdsResult.map(row => row.id);
    console.log(`✅ ${usuarioIds.length.toLocaleString()} IDs de usuarios en sample\n`);

    // 2. RECURSOS (8 fijos: 5 camionetas + 3 cabañas)
    console.log(`\n📊 Generando 8 recursos (5 camionetas + 3 cabañas)...`);
    const recursos = generarRecursos(); // Sin parámetro, retorna array fijo de 8
    await insertarEnLotes('recursos', recursos, CONFIG.BATCH_SIZE, 'Recursos');
    
    // Verificar MAX ID real
    const [recursosResult] = await sequelize.query('SELECT MAX(id) as maxId, COUNT(*) as count FROM recursos');
    const maxRecursoId = recursosResult[0].maxId;
    const totalRecursos = recursosResult[0].count;
    console.log(`✅ ${totalRecursos.toLocaleString()} recursos insertados (ID máximo: ${maxRecursoId})\n`);

    // Obtener TODOS los IDs de recursos (solo 8)
    console.log('🔍 Obteniendo IDs de los 8 recursos...');
    const [recursoIdsResult] = await sequelize.query(`SELECT id FROM recursos ORDER BY id`);
    const recursoIds = recursoIdsResult.map(row => row.id);
    console.log(`✅ ${recursoIds.length} IDs de recursos obtenidos: [${recursoIds.join(', ')}]\n`);

    // 3. PAGOS (usar sample de IDs)
    console.log(`\n📊 Generando ${CONFIG.PAGOS.toLocaleString()} pagos...`);
    const pagos = generarPagos(CONFIG.PAGOS, totalUsuarios);
    await insertarConSample('pagos', pagos, CONFIG.BATCH_SIZE, 'Pagos', {
      userId: usuarioIds
    });
    
    // Verificar total insertado
    const [pagosResult] = await sequelize.query('SELECT MAX(id) as maxId, COUNT(*) as count FROM pagos');
    const maxPagoId = pagosResult[0].maxId;
    const totalPagos = pagosResult[0].count;
    console.log(`✅ ${totalPagos.toLocaleString()} pagos insertados (ID máximo: ${maxPagoId})\n`);
    
    // Obtener sample de IDs de pagos
    console.log('🔍 Obteniendo sample de IDs de pagos...');
    const [pagoIdsResult] = await sequelize.query(`SELECT id FROM pagos ORDER BY RAND() LIMIT ${Math.min(50000, totalPagos)}`);
    const pagoIds = pagoIdsResult.map(row => row.id);
    console.log(`✅ ${pagoIds.length.toLocaleString()} IDs de pagos en sample\n`);
    
    // 4. RESERVAS (usar sample de IDs, solo resourceId usa los 8 recursos reales)
    console.log(`\n📊 Generando ${CONFIG.RESERVAS.toLocaleString()} reservas...`);
    const reservas = generarReservas(CONFIG.RESERVAS, totalUsuarios, totalPagos);
    await insertarConSample('reservas', reservas, CONFIG.BATCH_SIZE, 'Reservas', {
      resourceId: recursoIds, // Los 8 recursos reales
      userId: usuarioIds,
      pagoId: pagoIds
    });
    
    // Verificar total insertado
    const [reservasResult] = await sequelize.query('SELECT MAX(id) as maxId, COUNT(*) as count FROM reservas');
    const maxReservaId = reservasResult[0].maxId;
    const totalReservas = reservasResult[0].count;
    console.log(`✅ ${totalReservas.toLocaleString()} reservas insertadas (ID máximo: ${maxReservaId})\n`);

    // Obtener sample de IDs de reservas
    console.log('🔍 Obteniendo sample de IDs de reservas...');
    const [reservaIdsResult] = await sequelize.query(`SELECT id FROM reservas ORDER BY RAND() LIMIT ${Math.min(50000, totalReservas)}`);
    const reservaIds = reservaIdsResult.map(row => row.id);
    console.log(`✅ ${reservaIds.length.toLocaleString()} IDs de reservas en sample\n`);

    // 5. FECHAS (usar los 8 recursos reales, fechas por DÍA completo)
    console.log(`\n📊 Generando ${CONFIG.FECHAS.toLocaleString()} fechas (por día completo)...`);
    const fechas = generarFechas(CONFIG.FECHAS, totalReservas);
    await insertarConSample('fechas', fechas, CONFIG.BATCH_SIZE, 'Fechas', {
      recursoId: recursoIds, // Los 8 recursos reales
      reservaId: reservaIds
    });
    
    // Verificar total insertado
    const [fechasResult] = await sequelize.query('SELECT MAX(id) as maxId, COUNT(*) as count FROM fechas');
    const maxFechaId = fechasResult[0].maxId;
    const totalFechas = fechasResult[0].count;
    console.log(`✅ ${totalFechas.toLocaleString()} fechas insertadas (ID máximo: ${maxFechaId})\n`);

    // 6. ACTIVIDADES
    console.log(`\n📊 Generando ${CONFIG.ACTIVIDADES.toLocaleString()} actividades...`);
    const actividades = generarActividades(CONFIG.ACTIVIDADES);
    await insertarEnLotes('actividades', actividades, CONFIG.BATCH_SIZE, 'Actividades');
    
    // Verificar total insertado
    const [actividadesResult] = await sequelize.query('SELECT MAX(id) as maxId, COUNT(*) as count FROM actividades');
    const maxActividadId = actividadesResult[0].maxId;
    const totalActividades = actividadesResult[0].count;
    console.log(`✅ ${totalActividades.toLocaleString()} actividades insertadas (ID máximo: ${maxActividadId})\n`);

    // Obtener sample de IDs de actividades
    console.log('🔍 Obteniendo sample de IDs de actividades...');
    const [actividadIdsResult] = await sequelize.query(`SELECT id FROM actividades ORDER BY RAND() LIMIT ${Math.min(10000, totalActividades)}`);
    const actividadIds = actividadIdsResult.map(row => row.id);
    console.log(`✅ ${actividadIds.length.toLocaleString()} IDs de actividades en sample\n`);

    // 7. INSCRIPCIONES (usar sample de IDs)
    console.log(`\n📊 Generando ${CONFIG.INSCRIPCIONES.toLocaleString()} inscripciones...`);
    const inscripciones = generarInscripciones(CONFIG.INSCRIPCIONES, totalActividades);
    await insertarConSample('inscripciones', inscripciones, CONFIG.BATCH_SIZE, 'Inscripciones', {
      actividadId: actividadIds
    });
    
    // Verificar total insertado
    const [inscripcionesResult] = await sequelize.query('SELECT MAX(id) as maxId, COUNT(*) as count FROM inscripciones');
    const maxInscripcionId = inscripcionesResult[0].maxId;
    const totalInscripciones = inscripcionesResult[0].count;
    console.log(`✅ ${totalInscripciones.toLocaleString()} inscripciones insertadas (ID máximo: ${maxInscripcionId})\n`);

    // 8. NOTICIAS
    console.log(`\n📊 Generando ${CONFIG.NOTICIAS.toLocaleString()} noticias...`);
    const noticias = generarNoticias(CONFIG.NOTICIAS);
    await insertarEnLotes('noticias', noticias, CONFIG.BATCH_SIZE, 'Noticias');
    
    // Verificar MAX ID real
    const [noticiasResult] = await sequelize.query('SELECT MAX(id) as maxId, COUNT(*) as count FROM noticias');
    const maxNoticiaId = noticiasResult[0].maxId;
    const totalNoticias = noticiasResult[0].count;
    console.log(`✅ ${totalNoticias.toLocaleString()} noticias insertadas (ID máximo: ${maxNoticiaId})\n`);

    const endTime = Date.now();
    const duracion = ((endTime - startTime) / 1000 / 60).toFixed(2);

    console.log('\n' + '='.repeat(60));
    console.log('🎉 CARGA DE DATOS COMPLETADA');
    console.log('='.repeat(60));
    console.log(`⏱️  Tiempo total: ${duracion} minutos`);
    console.log(`📊 Total de registros insertados: ${(
      CONFIG.USUARIOS + CONFIG.RECURSOS + CONFIG.PAGOS + 
      CONFIG.RESERVAS + CONFIG.FECHAS + CONFIG.ACTIVIDADES + 
      CONFIG.INSCRIPCIONES + CONFIG.NOTICIAS
    ).toLocaleString()}`);
    console.log('='.repeat(60) + '\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error en la carga de datos:', error);
    process.exit(1);
  }
};

main();
