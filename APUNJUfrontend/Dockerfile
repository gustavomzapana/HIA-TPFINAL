# Etapa 1: Build de la aplicación Angular
FROM node:18-alpine AS build

WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar el resto del código
COPY . .

# Reemplazar apiUrl antes del build
RUN sed -i "s|apiUrl: 'https://proybackendgrupo01.onrender.com'|apiUrl: 'http://localhost:8000'|g" src/environments.ts

# Build de la aplicación Angular en modo producción
RUN npm run build -- --configuration=production

# Etapa 2: Servir con Nginx
FROM nginx:alpine

# Copiar archivos compilados al directorio de nginx
COPY --from=build /app/dist/proyfrontendgrupo01/browser /usr/share/nginx/html

# Copiar configuración personalizada de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer puerto 80
EXPOSE 80

# Comando para iniciar nginx
CMD ["nginx", "-g", "daemon off;"]