FROM alpine:latest

# Instalar herramientas necesarias
RUN apk add --no-cache \
    mariadb-client \
    curl \
    bash \
    tzdata \
    ca-certificates

# Configurar zona horaria
ENV TZ=America/Argentina/Buenos_Aires

# Crear directorio de trabajo
WORKDIR /app

# Copiar el script de backup
COPY ./Docker/scripts/backup.sh /app/backup.sh

# Dar permisos de ejecución
RUN chmod +x /app/backup.sh

# Ejecutar el script
ENTRYPOINT ["/bin/sh", "/app/backup.sh"]