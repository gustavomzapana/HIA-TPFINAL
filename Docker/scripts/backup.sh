#!/bin/sh
set -e

# ============================================================================
# SISTEMA DE BACKUPS AUTOMÁTICOS
# ============================================================================
# ¿Para qué sirve este script?
# 
# 1. PROTECCIÓN DE DATOS: Genera copias de seguridad de toda la base de datos
#    cada 6 horas, protegiéndote contra:
#    - Pérdida de datos por fallas de hardware
#    - Errores humanos (borrado accidental)
#    - Corrupción de datos
#    - Ataques o ransomware
#
# 2. ALMACENAMIENTO EN LA NUBE: Sube automáticamente los backups a NextCloud
#    (almacenamiento en la nube propio), permitiendo:
#    - Recuperación ante desastres (si se pierde el servidor completo)
#    - Acceso remoto a backups desde cualquier lugar
#    - Versionado de backups (mantener múltiples versiones)
#
# 3. OPTIMIZACIÓN: 
#    - Comprime los backups con gzip (reduce tamaño 70-90%)
#    - Usa --single-transaction para backups sin bloqueos
#    - Reintentos automáticos con backoff exponencial
#
# 4. USO:
#    - Backups automáticos: Se ejecutan solos cada 6 horas
#    - Backup manual: docker exec backup /app/backup.sh
#    - Restaurar: docker exec backup /app/restore.sh <archivo.sql.gz>
# ============================================================================

echo "[BACKUP] 🚀 Iniciando servicio de backup con NextCloud..."
echo "[BACKUP] Esperando a que la base de datos esté disponible..."

# Esperar a que haproxy esté disponible
until mariadb-admin ping -h haproxy -P 3306 -uroot -proot --skip-ssl --silent; do
    echo "[BACKUP] ⏳ Reintentando conexión a haproxy:3306..."
    sleep 5
done

echo "[BACKUP] ✅ Base de datos lista. Iniciando backups automáticos cada 6 horas..."

# Loop infinito para backups cada 6 horas
while true; do
    TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
    FILE="/tmp/db-backup-$TIMESTAMP.sql"
    FILE_GZ="/tmp/db-backup-$TIMESTAMP.sql.gz"
    
    echo "[BACKUP] 📦 Generando dump: $FILE"
    
    # Generar dump
    mariadb-dump \
        -h haproxy \
        -P 3306 \
        -uroot \
        -proot \
        --skip-ssl \
        --single-transaction \
        --quick \
        --lock-tables=false \
        --all-databases \
        > "$FILE"
    
    if [ $? -eq 0 ]; then
        echo "[BACKUP] ✅ Dump generado exitosamente"
        
        # Comprimir
        echo "[BACKUP] 🗜️  Comprimiendo: $FILE_GZ"
        gzip "$FILE"
        
        if [ $? -eq 0 ]; then
            FILE_SIZE=$(du -h "$FILE_GZ" | cut -f1)
            echo "[BACKUP] ✅ Archivo comprimido ($FILE_SIZE)"
            
            # Subir a NextCloud con reintentos
            MAX_RETRIES=3
            RETRY_DELAY=60
            SUCCESS=0
            
            for i in $(seq 1 $MAX_RETRIES); do
                echo "[BACKUP] ☁️  Intento $i/$MAX_RETRIES: Subiendo a NextCloud..."
                echo "[BACKUP] URL: $NEXTCLOUD_URL/db-backup-$TIMESTAMP.sql.gz"
                
                # Subir con curl (con timeout de 5 minutos)
                RESPONSE=$(curl -s -w "\n%{http_code}" \
                    --connect-timeout 30 \
                    --max-time 300 \
                    -H "User-Agent: APUNJU-Backup/1.0" \
                    -u "$NEXTCLOUD_USER:$NEXTCLOUD_PASS" \
                    -T "$FILE_GZ" \
                    "$NEXTCLOUD_URL/db-backup-$TIMESTAMP.sql.gz" 2>&1)
                
                CURL_EXIT_CODE=$?
                HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
                
                echo "[BACKUP] Respuesta: $RESPONSE"
                echo "[BACKUP] Código de salida curl: $CURL_EXIT_CODE"
                
                if [ $CURL_EXIT_CODE -eq 0 ] && ([ "$HTTP_CODE" -eq 201 ] || [ "$HTTP_CODE" -eq 204 ]); then
                    echo "[BACKUP] ✅ Backup subido exitosamente a NextCloud (HTTP $HTTP_CODE)"
                    SUCCESS=1
                    break
                else
                    echo "[BACKUP] ⚠️  Error HTTP $HTTP_CODE. Esperando $RETRY_DELAY segundos..."
                    
                    if [ $i -lt $MAX_RETRIES ]; then
                        sleep $RETRY_DELAY
                        RETRY_DELAY=$((RETRY_DELAY * 2))  # Backoff exponencial
                    fi
                fi
            done
            
            if [ $SUCCESS -eq 1 ]; then
                rm -f "$FILE_GZ"
                echo "[BACKUP] 🧹 Archivo temporal eliminado"
            else
                echo "[BACKUP] ❌ No se pudo subir después de $MAX_RETRIES intentos"
                echo "[BACKUP] 💾 Archivo guardado en: $FILE_GZ"
            fi
        else
            echo "[BACKUP] ❌ Error al comprimir el archivo"
        fi
    else
        echo "[BACKUP] ❌ Error al generar el dump"
    fi
    
    echo "[BACKUP] ⏰ Próximo backup en 6 horas..."
    echo "[BACKUP] ===================="
    sleep 21600  # 6 horas
done