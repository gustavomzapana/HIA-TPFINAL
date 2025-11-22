#!/bin/bash

set -e

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

REPORT_DIR="/optimization/reports"
DATE=$(date +%Y%m%d_%H%M%S)
REPORT_FILE="$REPORT_DIR/optimize-tables_$DATE.txt"

mkdir -p $REPORT_DIR

log "=== Iniciando optimización de tablas ===" | tee $REPORT_FILE

# 1. Analizar tablas
log "1. Analizando tablas para actualizar estadísticas..." | tee -a $REPORT_FILE
mysql -h haproxy -uroot -proot apunju_db -e "
  ANALYZE TABLE usuarios, recursos, reservas, fechas, pagos, actividades, inscripciones, noticias;
" | tee -a $REPORT_FILE

# 2. Ver tamaño de tablas
log "2. Tamaño actual de las tablas..." | tee -a $REPORT_FILE
mysql -h haproxy -uroot -proot apunju_db -e "
  SELECT 
    table_name AS 'Tabla',
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Tamaño (MB)',
    ROUND((data_free / 1024 / 1024), 2) AS 'Espacio Libre (MB)',
    table_rows AS 'Filas'
  FROM information_schema.tables
  WHERE table_schema = 'apunju_db'
  ORDER BY (data_length + index_length) DESC;
" | tee -a $REPORT_FILE

# 3. Optimizar tablas con espacio libre significativo
log "3. Optimizando tablas con fragmentación..." | tee -a $REPORT_FILE
mysql -h haproxy -uroot -proot apunju_db -e "
  OPTIMIZE TABLE usuarios, recursos, reservas, fechas, pagos, actividades, inscripciones, noticias;
" | tee -a $REPORT_FILE

# 4. Estadísticas de índices
log "4. Estadísticas de índices..." | tee -a $REPORT_FILE
mysql -h haproxy -uroot -proot apunju_db -e "
  SELECT 
    TABLE_NAME AS 'Tabla',
    INDEX_NAME AS 'Índice',
    CARDINALITY AS 'Cardinalidad',
    COLUMN_NAME AS 'Columna'
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = 'apunju_db'
  ORDER BY TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX;
" | tee -a $REPORT_FILE

log "=== Optimización completada ===" | tee -a $REPORT_FILE
log "Reporte guardado en: $REPORT_FILE"