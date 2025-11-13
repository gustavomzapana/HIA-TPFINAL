#!/bin/sh

echo "[BACKUP] Esperando a que la base de datos esté disponible..."
until mariadb-admin ping -h haproxy -P 3306 -uroot -proot --skip-ssl --silent; do
    echo "[BACKUP] Reintentando conexión a haproxy:3306..."
    sleep 5
done

echo "[BACKUP] ✅ Base de datos lista. Iniciando backups automáticos cada hora..."

while true; do
    TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
    FILE="/tmp/db-backup-$TIMESTAMP.sql"
    FILE_GZ="/tmp/db-backup-$TIMESTAMP.sql.gz"
    echo "[BACKUP] 📦 Generando dump: $FILE"
    mysqldump -h haproxy -P 3306 -uroot -proot --skip-ssl --all-databases > "$FILE"
    if [ $? -eq 0 ]; then
        echo "[BACKUP] �️  Comprimiendo backup..."
        gzip "$FILE"
        
        echo "[BACKUP] �📤 Subiendo backup a Nextcloud..."
        echo "[BACKUP] URL: $NEXTCLOUD_URL/db-backup-$TIMESTAMP.sql.gz"
        
        # Subir a NextCloud usando WebDAV
        RESPONSE=$(curl -w "%{http_code}" -T "$FILE_GZ" \
            -u "$NEXTCLOUD_USER:$NEXTCLOUD_PASS" \
            "$NEXTCLOUD_URL/db-backup-$TIMESTAMP.sql.gz" 2>&1)
        
        HTTP_CODE="${RESPONSE: -3}"
        
        if [ "$HTTP_CODE" = "201" ] || [ "$HTTP_CODE" = "204" ]; then
            echo "[BACKUP] ✅ Backup subido exitosamente a Nextcloud (HTTP $HTTP_CODE)"
            rm "$FILE_GZ"
            echo "[BACKUP] 🗑️  Archivo local eliminado"
        else
            echo "[BACKUP] ⚠️ Error al subir el backup a Nextcloud (HTTP $HTTP_CODE)"
            echo "[BACKUP] Respuesta completa: $RESPONSE"
        fi
    else
        echo "[BACKUP] ❌ Error al generar el dump"
    fi
    echo "[BACKUP] ⏳ Esperando 1 hora para el próximo backup..."
    sleep 3600
done
