#!/bin/bash
# Script para esperar a que la base de datos esté lista

set -e

host="${DB_HOST:-haproxy}"
port="${DB_PORT:-3306}"
database="${DB_NAME:-apunju_db}"

echo "⏳ Esperando a que el backend y la base de datos estén listos..."
echo "   Esto puede tardar 2-3 minutos mientras se crean las tablas..."

# Espera inicial MÁS LARGA para que el backend cree las tablas completamente
echo "⏳ Esperando 180 segundos (3 minutos) para que el backend termine de inicializar..."
sleep 180

# Ahora verifica que la base de datos esté lista y que las tablas estén creadas
max_attempts=60
attempt=0

until mysql -h"$host" -P"$port" -uroot -proot --skip-ssl -e "USE $database; SHOW TABLES;" &> /dev/null
do
  attempt=$((attempt + 1))
  if [ $attempt -ge $max_attempts ]; then
    echo "❌ Error: No se pudo conectar a la base de datos después de $max_attempts intentos"
    exit 1
  fi
  echo "⏳ Base de datos no disponible, intento $attempt/$max_attempts (esperando 5 segundos)..."
  sleep 5
done

# Verificar que las tablas críticas existan
echo "🔍 Verificando que las tablas estén creadas..."
for table in usuarios recursos pagos reservas fechas
do
  until mysql -h"$host" -P"$port" -uroot -proot --skip-ssl -e "USE $database; DESCRIBE $table;" &> /dev/null
  do
    echo "⏳ Esperando que la tabla '$table' sea creada por el backend..."
    sleep 5
  done
  echo "  ✓ Tabla '$table' verificada"
done

echo "✅ Base de datos lista y tablas creadas!"
echo "🚀 Iniciando generación de datos masivos..."
echo ""

exec "$@"
