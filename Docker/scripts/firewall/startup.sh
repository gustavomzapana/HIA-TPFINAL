#!/bin/bash
set -e

echo "🔧 Iniciando configuración de red..."

# Ejecutar configuración básica del firewall
/firewall/firewall.sh

# Ejecutar protección DDoS
/firewall/ddos-protection.sh

echo "✅ Configuración de red completada"

# Mantener el contenedor en ejecución
tail -f /dev/null