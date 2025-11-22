#!/bin/bash
# Script de restauración de backups para MariaDB Galera Cluster

set -e

BACKUP_DIR="/backups"

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# Listar backups disponibles
list_backups() {
    log "Backups completos disponibles:"
    ls -lh $BACKUP_DIR/full/*.sql.gz 2>/dev/null || log "No hay backups disponibles"
}

# Restaurar backup específico
restore_backup() {
    BACKUP_FILE=$1
    
    if [ ! -f "$BACKUP_FILE" ]; then
        log "ERROR: Backup no encontrado: $BACKUP_FILE"
        exit 1
    fi
    
    log "Restaurando backup: $BACKUP_FILE"
    
    # Verificar checksum
    if [ -f "$BACKUP_FILE.md5" ]; then
        log "Verificando integridad del archivo..."
        md5sum -c $BACKUP_FILE.md5 || {
            log "ERROR: Checksum no coincide. Archivo corrupto."
            exit 1
        }
        log "Integridad verificada correctamente"
    fi
    
    # Descomprimir y restaurar
    log "Descomprimiendo y restaurando base de datos..."
    gunzip -c $BACKUP_FILE | mysql -h haproxy -u root -p${MYSQL_ROOT_PASSWORD}
    
    log "Restauración completada exitosamente"
}

# Menú interactivo
if [ $# -eq 0 ]; then
    list_backups
    echo ""
    echo "Uso: ./restore.sh <archivo_backup>"
    echo "Ejemplo: ./restore.sh $BACKUP_DIR/full/backup_full_20231115_120000.sql.gz"
else
    restore_backup $1
fi
