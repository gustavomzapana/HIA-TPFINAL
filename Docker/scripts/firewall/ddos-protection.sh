#!/bin/bash
echo "🛡️  Configurando protección DDoS..."

# Crear cadena para protección DDoS
iptables -N ANTI_DDOS
iptables -A INPUT -j ANTI_DDOS

# 1. Protección contra SYN Flood
iptables -A ANTI_DDOS -p tcp --syn -m limit --limit 10/s --limit-burst 20 -j RETURN
iptables -A ANTI_DDOS -p tcp --syn -j DROP

# 2. Limitar conexiones por IP
for port in 80 443; do
    iptables -A ANTI_DDOS -p tcp --dport $port -m connlimit --connlimit-above 50 -j DROP
done

# 3. Protección contra escaneo de puertos
iptables -A ANTI_DDOS -p tcp --tcp-flags SYN,ACK,FIN,RST RST -m limit --limit 1/s -j LOG --log-prefix "Port Scan: "
iptables -A ANTI_DDOS -p tcp --tcp-flags SYN,ACK,FIN,RST RST -j DROP

# 4. Bloquear paquetes fragmentados
iptables -A ANTI_DDOS -f -j DROP

# 5. Bloquear paquetes inválidos
iptables -A ANTI_DDOS -m conntrack --ctstate INVALID -j DROP

# 6. Limitar nuevas conexiones por IP
for port in 80 443 8000 8080 3000 9090 3307; do
    iptables -A ANTI_DDOS -p tcp --dport $port -m state --state NEW -m recent --set --name "PORT_$port"
    iptables -A ANTI_DDOS -p tcp --dport $port -m state --state NEW -m recent --update --seconds 60 --hitcount 20 --name "PORT_$port" -j DROP
done

echo "✅ Protección DDoS configurada"