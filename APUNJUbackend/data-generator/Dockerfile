FROM node:18-alpine

WORKDIR /app

# Instalar dependencias del sistema (incluyendo mysql-client)
RUN apk add --no-cache bash curl mysql-client

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install --production

# Copiar el script generador
COPY generator.js ./

# Script de espera para la base de datos
COPY wait-for-db.sh ./
RUN chmod +x wait-for-db.sh

# Aumentar heap size de Node.js a 4GB
CMD ["./wait-for-db.sh", "node", "--max-old-space-size=4096", "generator.js"]
