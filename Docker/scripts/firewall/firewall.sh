#!/bin/bash
echo "🔧 Configurando reglas básicas del firewall..."

# Limpiar reglas existentes
iptables -F
iptables -X
iptables -t nat -F
iptables -t nat -X
iptables -t mangle -F
iptables -t mangle -X

# Políticas por defecto
iptables -P INPUT DROP
iptables -P FORWARD DROP
iptables -P OUTPUT ACCEPT

# Permitir localhost
iptables -A INPUT -i lo -j ACCEPT
iptables -A OUTPUT -o lo -j ACCEPT

# Permitir conexiones establecidas
iptables -A INPUT -m conntrack --ctstate RELATED,ESTABLISHED -j ACCEPT

# Puertos necesarios
PORTS="80 443 8000 8080 3000 9090 3307"
for port in $PORTS; do
    iptables -A INPUT -p tcp --dport $port -j ACCEPT
    echo "✅ Puerto $port abierto"
done

# Permitir pings (limitados)
iptables -A INPUT -p icmp --icmp-type echo-request -m limit --limit 1/s -j ACCEPT

# Registrar intentos de conexión rechazados
iptables -A INPUT -m limit --limit 1/min -j LOG --log-prefix "Firewall-Dropped: " --log-level 4

echo "✅ Firewall básico configurado"