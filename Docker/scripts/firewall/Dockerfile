FROM alpine:3.18

# Instalar dependencias
RUN apk add --no-cache iptables iproute2 bash

# Crear directorio para los scripts
RUN mkdir -p /firewall

# Copiar scripts
COPY *.sh /firewall/
RUN chmod +x /firewall/*.sh

# Comando de inicio
CMD ["/firewall/startup.sh"]