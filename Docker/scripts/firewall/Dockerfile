FROM alpine:3.18

# Instalar dependencias mínimas
RUN apk add --no-cache iptables iproute2 bash

# Crear directorio para el script
RUN mkdir -p /firewall

# Copiar script
COPY start.sh /firewall/
RUN chmod +x /firewall/start.sh

# Comando de inicio
CMD ["/firewall/start.sh"]