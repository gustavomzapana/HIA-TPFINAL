const { Sequelize } = require('sequelize');

// Configuración de conexión a MariaDB
const sequelize = new Sequelize(
  process.env.DB_NAME || 'apunju_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mariadb',
    dialectOptions: {
      timezone: 'Etc/GMT-3', // Argentina timezone
    },
    logging: false, // Cambia a console.log para ver las queries SQL
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Probar la conexión
sequelize.authenticate()
  .then(() => console.log('🟢 Conectado a MariaDB'))
  .catch((err) => console.error('🔴 Error de conexión a MariaDB:', err));

module.exports = sequelize;