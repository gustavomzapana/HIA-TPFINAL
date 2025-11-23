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

upload_reports() {
    echo "[REPORTES] 📊 Verificando reportes para subir..."
    
    if [ ! -d "/reportes" ] || [ -z "$(ls -A /reportes 2>/dev/null)" ]; then
        echo "[REPORTES] ℹ️  No hay reportes para subir"
        return
    fi
    
    for REPORT_FILE in /reportes/*.json; do
        if [ -f "$REPORT_FILE" ]; then
            FILENAME=$(basename "$REPORT_FILE")
            echo "[REPORTES] 📤 Subiendo: $FILENAME"
            
            RESPONSE=$(curl -s -w "\n%{http_code}" \
                --connect-timeout 30 \
                --max-time 120 \
                -H "User-Agent: APUNJU-Backup/1.0" \
                -u "$NEXTCLOUD_USER:$NEXTCLOUD_PASS" \
                -T "$REPORT_FILE" \
                "$NEXTCLOUD_URL/reportes/$FILENAME" 2>&1)
            
            HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
            
            if [ "$HTTP_CODE" -eq 201 ] || [ "$HTTP_CODE" -eq 204 ]; then
                echo "[REPORTES] ✅ $FILENAME subido exitosamente (HTTP $HTTP_CODE)"
            else
                echo "[REPORTES] ⚠️  Error al subir $FILENAME (HTTP $HTTP_CODE)"
            fi
        fi
    done
    for REPORT_FILE in /reportes/*.png; do
        if [ -f "$REPORT_FILE" ]; then
            FILENAME=$(basename "$REPORT_FILE")
            echo "[REPORTES] 📤 Subiendo: $FILENAME"
            
            RESPONSE=$(curl -s -w "\n%{http_code}" \
                --connect-timeout 30 \
                --max-time 120 \
                -H "User-Agent: APUNJU-Backup/1.0" \
                -u "$NEXTCLOUD_USER:$NEXTCLOUD_PASS" \
                -T "$REPORT_FILE" \
                "$NEXTCLOUD_URL/reportes/$FILENAME" 2>&1)
            
            HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
            
            if [ "$HTTP_CODE" -eq 201 ] || [ "$HTTP_CODE" -eq 204 ]; then
                echo "[REPORTES] ✅ $FILENAME subido exitosamente (HTTP $HTTP_CODE)"
            else
                echo "[REPORTES] ⚠️  Error al subir $FILENAME (HTTP $HTTP_CODE)"
            fi
        fi
    done
}



backup_database() {
    TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
    FILE="/tmp/db-backup-$TIMESTAMP.sql"
    FILE_GZ="/tmp/db-backup-$TIMESTAMP.sql.gz"

    echo "[BACKUP] 📦 Generando dump: $FILE"
    
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
        
        echo "[BACKUP] 🗜️  Comprimiendo: $FILE_GZ"
        gzip "$FILE"
        
        if [ $? -eq 0 ]; then
            FILE_SIZE=$(du -h "$FILE_GZ" | cut -f1)
            echo "[BACKUP] ✅ Archivo comprimido ($FILE_SIZE)"
            
            MAX_RETRIES=3
            RETRY_DELAY=60
            SUCCESS=0
            
            for i in $(seq 1 $MAX_RETRIES); do
                echo "[BACKUP] ☁️  Intento $i/$MAX_RETRIES: Subiendo a NextCloud..."
                
                RESPONSE=$(curl -s -w "\n%{http_code}" \
                    --connect-timeout 30 \
                    --max-time 300 \
                    -H "User-Agent: APUNJU-Backup/1.0" \
                    -u "$NEXTCLOUD_USER:$NEXTCLOUD_PASS" \
                    -T "$FILE_GZ" \
                    "$NEXTCLOUD_URL/backups/db-backup-$TIMESTAMP.sql.gz" 2>&1)
                
                CURL_EXIT_CODE=$?
                HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
                
                if [ $CURL_EXIT_CODE -eq 0 ] && ([ "$HTTP_CODE" -eq 201 ] || [ "$HTTP_CODE" -eq 204 ]); then
                    echo "[BACKUP] ✅ Backup subido exitosamente a NextCloud (HTTP $HTTP_CODE)"
                    SUCCESS=1
                    break
                else
                    echo "[BACKUP] ⚠️  Error HTTP $HTTP_CODE. Esperando $RETRY_DELAY segundos..."
                    
                    if [ $i -lt $MAX_RETRIES ]; then
                        sleep $RETRY_DELAY
                        RETRY_DELAY=$((RETRY_DELAY * 2))
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
        fi
    else
        echo "[BACKUP] ❌ Error al generar el dump"
    fi
}

# ============================================================================
# LOOP PRINCIPAL
# ============================================================================
echo "[BACKUP] 🚀 Iniciando loop de backups automáticos..."

# Contador de horas para backups de BD
HOUR_COUNT=0

# Ejecutar backup inicial inmediatamente
upload_reports
backup_database

# Loop infinito para backups periódicos
while true; do
    echo "[BACKUP] ⏰ Próximo ciclo en 1 hora (reportes) / 6 horas (backup BD)..."
    echo "[BACKUP] ===================="
    
    # Esperar 1 hora
    sleep 3600
    
    # Subir reportes cada hora
    upload_reports
    
    # Cada 6 iteraciones (6 horas), hacer backup de BD
    HOUR_COUNT=$((HOUR_COUNT + 1))
    if [ $((HOUR_COUNT % 6)) -eq 0 ]; then
        backup_database
    fi
done