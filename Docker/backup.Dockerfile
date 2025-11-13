FROM alpine:latest

# Instalamos las herramientas necesarias
RUN apk add --no-cache mariadb-client curl

WORKDIR /app
COPY ./Docker/scripts/backup.sh /app/backup.sh
RUN chmod +x /app/backup.sh

CMD ["/app/backup.sh"]