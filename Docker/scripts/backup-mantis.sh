#!/bin/sh
set -e

echo "[MANTIS-BACKUP] 🐛 Iniciando backup de MantisBT..."

# Verificar si está habilitado
if [ "$BACKUP_ENABLED" != "true" ]; then
    echo "[MANTIS-BACKUP] ⚠️  Backups deshabilitados (BACKUP_ENABLED=$BACKUP_ENABLED)"
    echo "[MANTIS-BACKUP] 💤 El contenedor se mantendrá en espera"
    while true; do sleep 3600; done
fi

echo "[MANTIS-BACKUP] Esperando a que HAProxy esté disponible..."

until mysqladmin ping -h haproxy -P 3306 -uroot -proot --skip-ssl --silent; do
    echo "[MANTIS-BACKUP] ⏳ Reintentando conexión a haproxy:3306..."
    sleep 5
done

echo "[MANTIS-BACKUP] ✅ Base de datos lista. Iniciando backups cada 12 horas..."

while true; do
    TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
    
    # ===== 1. BACKUP DE BASE DE DATOS DE MANTISBT =====
    DB_FILE="/tmp/mantis-db-$TIMESTAMP.sql"
    DB_FILE_GZ="/tmp/mantis-db-$TIMESTAMP.sql.gz"
    
    echo "[MANTIS-BACKUP] 📦 Generando dump de bugtracker..."
    
    mysqldump \
        -h haproxy \
        -P 3306 \
        -uroot \
        -proot \
        --skip-ssl \
        --single-transaction \
        --quick \
        --databases bugtracker \
        > "$DB_FILE"
    
    if [ $? -eq 0 ]; then
        echo "[MANTIS-BACKUP] ✅ Dump generado"
        gzip "$DB_FILE"
        
        FILE_SIZE=$(du -h "$DB_FILE_GZ" | cut -f1)
        echo "[MANTIS-BACKUP] ✅ Archivo comprimido ($FILE_SIZE)"
        
        # Subir a NextCloud
        for i in $(seq 1 3); do
            echo "[MANTIS-BACKUP] ☁️  Intento $i/3: Subiendo DB a NextCloud..."
            
            RESPONSE=$(curl -s -w "\n%{http_code}" \
                --connect-timeout 30 \
                --max-time 300 \
                -u "$NEXTCLOUD_USER:$NEXTCLOUD_PASS" \
                -T "$DB_FILE_GZ" \
                "$NEXTCLOUD_URL/../mantis-backups/mantis-db-$TIMESTAMP.sql.gz")
            
            HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
            
            if [ "$HTTP_CODE" -eq 201 ] || [ "$HTTP_CODE" -eq 204 ]; then
                echo "[MANTIS-BACKUP] ✅ DB subida exitosamente (HTTP $HTTP_CODE)"
                break
            else
                echo "[MANTIS-BACKUP] ⚠️  Error HTTP $HTTP_CODE"
                [ $i -lt 3 ] && sleep 30
            fi
        done
        
        rm -f "$DB_FILE_GZ"
    fi
    
    # ===== 2. BACKUP DE ARCHIVOS ADJUNTOS =====
    UPLOADS_FILE="/tmp/mantis-uploads-$TIMESTAMP.tar.gz"
    
    if [ -d "/mantis_uploads" ] && [ "$(ls -A /mantis_uploads 2>/dev/null)" ]; then
        echo "[MANTIS-BACKUP] 📎 Comprimiendo archivos adjuntos..."
        
        tar -czf "$UPLOADS_FILE" -C /mantis_uploads .
        
        if [ $? -eq 0 ]; then
            FILE_SIZE=$(du -h "$UPLOADS_FILE" | cut -f1)
            echo "[MANTIS-BACKUP] ✅ Archivos comprimidos ($FILE_SIZE)"
            
            # Subir a NextCloud
            for i in $(seq 1 3); do
                echo "[MANTIS-BACKUP] ☁️  Intento $i/3: Subiendo archivos a NextCloud..."
                
                RESPONSE=$(curl -s -w "\n%{http_code}" \
                    --connect-timeout 30 \
                    --max-time 600 \
                    -u "$NEXTCLOUD_USER:$NEXTCLOUD_PASS" \
                    -T "$UPLOADS_FILE" \
                    "$NEXTCLOUD_URL/../mantis-backups/mantis-uploads-$TIMESTAMP.tar.gz")
                
                HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
                
                if [ "$HTTP_CODE" -eq 201 ] || [ "$HTTP_CODE" -eq 204 ]; then
                    echo "[MANTIS-BACKUP] ✅ Archivos subidos (HTTP $HTTP_CODE)"
                    break
                else
                    echo "[MANTIS-BACKUP] ⚠️  Error HTTP $HTTP_CODE"
                    [ $i -lt 3 ] && sleep 30
                fi
            done
            
            rm -f "$UPLOADS_FILE"
        fi
    else
        echo "[MANTIS-BACKUP] ℹ️  No hay archivos adjuntos para respaldar"
    fi
    
    echo "[MANTIS-BACKUP] ⏰ Próximo backup en 12 horas..."
    echo "[MANTIS-BACKUP] ===================="
    sleep 43200  # 12 horas
done