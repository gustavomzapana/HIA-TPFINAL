#!/bin/sh
# wait-for-db.sh - Espera a que la base de datos esté lista

echo "Esperando a que la base de datos esté lista..."

# Instalar netcat si no está disponible
apk add --no-cache netcat-openbsd 2>/dev/null || true

# Esperar hasta que el puerto esté abierto
until nc -z ${DB_HOST:-haproxy} ${DB_PORT:-3306}; do
  echo "Base de datos no está lista - esperando..."
  sleep 2
done

echo "✅ Base de datos está lista - iniciando aplicación"
exec npm start
