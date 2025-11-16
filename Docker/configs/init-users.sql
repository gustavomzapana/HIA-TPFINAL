-- ./init/init-users.sql

-- Usuario para HAProxy
CREATE USER IF NOT EXISTS 'haproxy_check'@'%' IDENTIFIED BY '';
GRANT USAGE ON *.* TO 'haproxy_check'@'%';
FLUSH PRIVILEGES;

-- Usuario para Adminer
CREATE USER IF NOT EXISTS 'admin'@'%' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON *.* TO 'admin'@'%';
FLUSH PRIVILEGES;

-- Usuario para Prometheus
CREATE USER IF NOT EXISTS 'exporter'@'%' IDENTIFIED BY 'exporter_password';
GRANT PROCESS, REPLICATION CLIENT, SELECT, SUPER ON *.* TO 'exporter'@'%';
FLUSH PRIVILEGES;

-- Base de datos y usuario para la aplicación APUNJU
-- Se crea con host '%' para permitir conexiones desde HAProxy u otros contenedores
CREATE DATABASE IF NOT EXISTS `apunju_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'apunju_user'@'%' IDENTIFIED BY 'apunju_password';
GRANT ALL PRIVILEGES ON `apunju_db`.* TO 'apunju_user'@'%';

REATE USER IF NOT EXISTS 'mantisbt'@'%' IDENTIFIED BY 'mantisbt_password';
CREATE DATABASE IF NOT EXISTS bugtracker CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
GRANT ALL PRIVILEGES ON bugtracker.* TO 'mantisbt'@'%';

-- Usuario para Prometheus Exporters
CREATE USER IF NOT EXISTS 'exporter'@'%' IDENTIFIED BY 'exporter_password' WITH MAX_USER_CONNECTIONS 3;
GRANT PROCESS, REPLICATION CLIENT, SELECT ON *.* TO 'exporter'@'%';

FLUSH PRIVILEGES;