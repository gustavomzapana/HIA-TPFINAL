require('dotenv').config();
const { sequelize } = require('../models');

async function initDatabase() {
  try {
    console.log('🔄 Iniciando conexión a MariaDB...');
    
    // Probar conexión
    await sequelize.authenticate();
    console.log('✅ Conexión a MariaDB exitosa');
    
    // Sincronizar modelos (crear tablas)
    // force: false - no elimina datos existentes
    // alter: true - modifica las tablas existentes para que coincidan con los modelos
    await sequelize.sync({ force: false, alter: true });
    console.log('✅ Tablas sincronizadas correctamente');
    
    console.log('\n📋 Tablas creadas:');
    console.log('  - usuarios');
    console.log('  - recursos');
    console.log('  - reservas');
    console.log('  - fechas');
    console.log('  - actividades');
    console.log('  - inscripciones');
    console.log('  - pagos');
    console.log('  - cuotas');
    console.log('  - noticias');
    
    console.log('\n✅ Base de datos lista para usar');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al inicializar base de datos:', error);
    process.exit(1);
  }
}

initDatabase();
