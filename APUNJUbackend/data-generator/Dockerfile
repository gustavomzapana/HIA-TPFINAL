FROM node:18-alpine

WORKDIR /app

# Instalar mysql-client y bash (necesarios para wait-for-db.sh)
RUN apk add --no-cache mysql-client bash dos2unix

# Copiar package.json primero (para cache de npm install)
COPY package*.json ./
RUN npm install

# Copiar TODO el contenido
COPY . .

# Convertir line endings y dar permisos de ejecución
RUN dos2unix wait-for-db.sh && \
    chmod +x wait-for-db.sh

# Verificar que el archivo existe
RUN ls -la wait-for-db.sh

CMD ["./wait-for-db.sh", "node", "generator.js"]