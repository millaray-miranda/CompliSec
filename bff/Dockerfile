# Imagen base optimizada para Node.js
FROM node:18-alpine

# Directorio de trabajo
WORKDIR /app

# Copiar configuración de dependencias (para caché de Docker)
COPY package*.json ./
RUN npm install

# Copiar el código fuente
COPY . .

# Puerto expuesto por el BFF
EXPOSE 4000

# Comando para iniciar el BFF (en desarrollo usaremos nodemon, en prod node)
CMD ["npx", "nodemon", "src/index.js"]
