FROM node:18-alpine

WORKDIR /app

# Copiar package.json y package-lock.json si existe para optimizar la cache
COPY package*.json ./

RUN npm install --production

# Copiar el resto del código
COPY . .

# Hacer ejecutable el script de espera
RUN chmod +x wait-for-db.sh

ENV PORT=8000
EXPOSE 8000

CMD ["sh", "wait-for-db.sh"]
