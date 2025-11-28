#!/bin/bash

set -e

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

REPORT_DIR="/optimization/reports"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $REPORT_DIR

log "=== Ejecutando Percona Toolkit ==="

# Detectar nombres de archivos de slow query log conectándose directamente a cada nodo
log "Detectando archivos de slow query log..."
SLOW_LOG_GALERA1=$(mysql -h galera1 -uroot -proot -N -e "SHOW VARIABLES LIKE 'slow_query_log_file';" | awk '{print $2}')
SLOW_LOG_GALERA2=$(mysql -h galera2 -uroot -proot -N -e "SHOW VARIABLES LIKE 'slow_query_log_file';" | awk '{print $2}')
SLOW_LOG_GALERA3=$(mysql -h galera3 -uroot -proot -N -e "SHOW VARIABLES LIKE 'slow_query_log_file';" | awk '{print $2}')

log "  Galera1: $SLOW_LOG_GALERA1"
log "  Galera2: $SLOW_LOG_GALERA2"
log "  Galera3: $SLOW_LOG_GALERA3"

# 1. pt-query-digest: Análisis de queries lentas
log ""
log "1. Analizando queries lentas (pt-query-digest)..."

# Analizar galera1
log "   Analizando galera1..."
if [ -n "$SLOW_LOG_GALERA1" ] && [ "$SLOW_LOG_GALERA1" != "NULL" ]; then
    # Copiar el archivo desde el nodo remoto usando mysql
    mysql -h galera1 -uroot -proot -e "SELECT LOAD_FILE('$SLOW_LOG_GALERA1')" > /tmp/galera1-slow.log 2>/dev/null || echo "No se pudo copiar el log"
    
    if [ -s /tmp/galera1-slow.log ]; then
        pt-query-digest --limit 20 --order-by Query_time:sum /tmp/galera1-slow.log > $REPORT_DIR/pt-query-digest-galera1_$DATE.txt 2>&1
        log "     ✓ Análisis completado"
    else
        echo "El archivo está vacío o no se pudo leer. No hay queries lentas registradas." > $REPORT_DIR/pt-query-digest-galera1_$DATE.txt
        log "     ⚠ No hay queries lentas"
    fi
else
    echo "No se pudo detectar el archivo de slow query log" > $REPORT_DIR/pt-query-digest-galera1_$DATE.txt
    log "     ⚠ Archivo no detectado"
fi

# Similar para galera2 y galera3
log "   Analizando galera2..."
if [ -n "$SLOW_LOG_GALERA2" ] && [ "$SLOW_LOG_GALERA2" != "NULL" ]; then
    mysql -h galera2 -uroot -proot -e "SELECT LOAD_FILE('$SLOW_LOG_GALERA2')" > /tmp/galera2-slow.log 2>/dev/null || echo "No se pudo copiar el log"
    
    if [ -s /tmp/galera2-slow.log ]; then
        pt-query-digest --limit 20 --order-by Query_time:sum /tmp/galera2-slow.log > $REPORT_DIR/pt-query-digest-galera2_$DATE.txt 2>&1
        log "     ✓ Análisis completado"
    else
        echo "El archivo está vacío. No hay queries lentas registradas." > $REPORT_DIR/pt-query-digest-galera2_$DATE.txt
        log "     ⚠ No hay queries lentas"
    fi
fi

log "   Analizando galera3..."
if [ -n "$SLOW_LOG_GALERA3" ] && [ "$SLOW_LOG_GALERA3" != "NULL" ]; then
    #mysql -h galera3 -uroot -proot -e "SELECT LOAD_FILE('/var/lib/mysql/$SLOW_LOG_GALERA3')" > /tmp/galera3-slow.log 2>/dev/null || echo "No se pudo copiar el log"
    mysql -h galera3 -uroot -proot -e "SELECT LOAD_FILE('$SLOW_LOG_GALERA3')" > /tmp/galera3-slow.log 2>/dev/null || echo "No se pudo copiar el log"

    if [ -s /tmp/galera3-slow.log ]; then
        pt-query-digest --limit 20 --order-by Query_time:sum /tmp/galera3-slow.log > $REPORT_DIR/pt-query-digest-galera3_$DATE.txt 2>&1
        log "     ✓ Análisis completado"
    else
        echo "El archivo está vacío. No hay queries lentas registradas." > $REPORT_DIR/pt-query-digest-galera3_$DATE.txt
        log "     ⚠ No hay queries lentas"
    fi
fi

# 2. pt-duplicate-key-checker: Encontrar índices duplicados
log ""
log "2. Buscando índices duplicados (pt-duplicate-key-checker)..."
pt-duplicate-key-checker --host=galera1 --user=root --password=root --databases apunju_db > $REPORT_DIR/pt-duplicate-keys_$DATE.txt 2>&1
log "     ✓ Análisis completado"

# 3. pt-table-checksum: Verificar consistencia entre nodos
log ""
log "3. Verificando consistencia del cluster (pt-table-checksum)..."
pt-table-checksum --host=haproxy --user=root --password=root --databases apunju_db --no-check-binlog-format --replicate=percona.checksums > $REPORT_DIR/pt-table-checksum_$DATE.txt 2>&1 || log "     ⚠ Puede fallar en Galera sin replicación tradicional"

# 4. pt-mysql-summary: Resumen de MySQL
log ""
log "4. Generando resumen de MySQL (pt-mysql-summary)..."
pt-mysql-summary --host=haproxy --user=root --password=root > $REPORT_DIR/pt-mysql-summary_$DATE.txt 2>&1
log "     ✓ Resumen generado"

log ""
log "=== Análisis completado ==="
log "Reportes generados en: $REPORT_DIR"
ls -lh $REPORT_DIR/*_$DATE.txt 2>/dev/null || echo "Ver reportes en el directorio"