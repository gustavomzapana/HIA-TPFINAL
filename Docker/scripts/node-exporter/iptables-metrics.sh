#!/bin/sh
OUTPUT_FILE="/var/lib/node-exporter/iptables.prom"
TEMP_FILE="${OUTPUT_FILE}.tmp"

# Crear directorio si no existe
mkdir -p /var/lib/node-exporter

# Obtener métricas y formatearlas correctamente
iptables -L -v -n -x | awk '
/^Chain (INPUT|OUTPUT|FORWARD)/ {
    # Saltar la primera línea de encabezado
    getline
    # La primera línea después del encabezado contiene los contadores
    if ($0 ~ /^[0-9]/) {
        print "iptables_packets_total{chain=\"" $1 "\"} " $1
        print "iptables_bytes_total{chain=\"" $1 "\"} " $2
    }
}' > "$TEMP_FILE"

# Si el archivo está vacío, agregar métricas por defecto
[ ! -s "$TEMP_FILE" ] && echo "iptables_packets_total{chain=\"INPUT\"} 0" > "$TEMP_FILE"

# Mover el archivo temporal al final para evitar lecturas parciales
mv "$TEMP_FILE" "$OUTPUT_FILE"