#!/bin/bash

# ============================================================================
# ANÁLISIS Y OPTIMIZACIÓN CON PERCONA TOOLKIT
# ============================================================================
# Percona Toolkit es la herramienta elegida porque:
#
# 1. ANÁLISIS DE QUERIES REALES (pt-query-digest)
#    - Lee el slow query log de MariaDB
#    - Identifica queries lentas específicas con ejemplos
#    - Muestra estadísticas: tiempo total, frecuencia, rows examined
#    - Te dice EXACTAMENTE qué query optimizar
#
# 2. VERIFICACIÓN DE CONSISTENCIA EN GALERA (pt-table-checksum)
#    - Calcula checksums de todas las filas
#    - Compara entre los 3 nodos del cluster
#    - Detecta inconsistencias de replicación
#    - Crítico para garantizar integridad de datos
#
# 3. DETECCIÓN DE ÍNDICES PROBLEMÁTICOS
#    - pt-duplicate-key-checker: Índices redundantes que desperdicien espacio
#    - pt-index-usage: Índices no usados (solo consumen espacio/tiempo)
#    - Recomienda qué índices eliminar de forma segura
#
# 4. CAMBIOS SIN DOWNTIME (pt-online-schema-change)
#    - Permite ALTER TABLE sin bloquear la tabla
#    - Esencial para producción 24/7
#
# USO:
#   docker-compose run --rm optimization-tools /scripts/run-optimizations.sh
# ============================================================================

set -e

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

REPORT_DIR="/optimization/reports"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $REPORT_DIR

log "╔══════════════════════════════════════════════════════════════╗"
log "║     ANÁLISIS DE OPTIMIZACIÓN - PERCONA TOOLKIT              ║"
log "╚══════════════════════════════════════════════════════════════╝"
log ""
log "Cluster: MariaDB Galera 3 nodos + HAProxy"
log "Base de datos: apunju_db (~500K registros)"
log "Reportes: $REPORT_DIR"
log ""

# 1. Percona Toolkit - Análisis avanzado
log "═══════════════════════════════════════════════════════════════"
log "1️⃣ EJECUTANDO PERCONA TOOLKIT"
log "═══════════════════════════════════════════════════════════════"
/scripts/percona-toolkit.sh

# 2. Optimize Tables - Mantenimiento
log ""
log "═══════════════════════════════════════════════════════════════"
log "2️⃣ OPTIMIZANDO TABLAS"
log "═══════════════════════════════════════════════════════════════"
/scripts/optimize-tables.sh

# 3. Generar reporte consolidado
log ""
log "═══════════════════════════════════════════════════════════════"
log "3️⃣ GENERANDO REPORTE CONSOLIDADO"
log "═══════════════════════════════════════════════════════════════"

CONSOLIDATED_REPORT="$REPORT_DIR/consolidated_report_$DATE.txt"

cat > $CONSOLIDATED_REPORT <<EOF
================================================================================
REPORTE DE OPTIMIZACIÓN - PERCONA TOOLKIT
================================================================================
Fecha: $(date)
Cluster: 3 nodos MariaDB 10.5 + HAProxy
Base de datos: apunju_db
Registros: ~500K (50K usuarios, 200K reservas, 200K fechas, 30K pagos)

================================================================================
HERRAMIENTAS EJECUTADAS
================================================================================

1. pt-query-digest
   └─ Analiza slow query log
   └─ Identifica queries lentas específicas
   └─ Recomienda índices faltantes

2. pt-duplicate-key-checker
   └─ Encuentra índices redundantes
   └─ Recomienda qué índices eliminar

3. pt-table-checksum
   └─ Verifica consistencia entre nodos Galera
   └─ Detecta datos inconsistentes

4. OPTIMIZE TABLE
   └─ Desfragmenta tablas InnoDB
   └─ Actualiza estadísticas
   └─ Recupera espacio en disco

================================================================================
ARCHIVOS GENERADOS
================================================================================

EOF

ls -lh $REPORT_DIR/*$DATE* >> $CONSOLIDATED_REPORT

log ""
log "✅ OPTIMIZACIÓN COMPLETADA"
log ""
log "📊 Reporte consolidado: $CONSOLIDATED_REPORT"
log ""
log "Para ver los reportes en tu máquina local:"
log "  docker cp optimization-tools:/optimization/reports ./Docker/optimization-reports/"
log ""
log "Para aplicar recomendaciones (agregar índices, etc):"
log "  1. Lee el reporte de pt-query-digest"
log "  2. Identifica queries lentas"
log "  3. Ejecuta CREATE INDEX según recomendaciones"
log "  4. Vuelve a ejecutar este script para verificar mejoras"
log ""
log "═══════════════════════════════════════════════════════════════"

