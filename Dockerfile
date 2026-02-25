FROM node:18-alpine AS build
WORKDIR /app

# Copiar archivos de dependencias
COPY frontend/package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código (sin sobrescribir node_modules)
COPY frontend/ ./

# Construir la aplicación
RUN npx ng build --configuration production

FROM nginx:alpine
COPY --from=build /app/dist/frontend /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]