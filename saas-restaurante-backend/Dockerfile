FROM node:20-alpine

WORKDIR /app

# Instala dependencias primero (mejor cache)
COPY package*.json ./
RUN npm install

# Copia el resto del proyecto
COPY . .

# Genera Prisma Client
RUN npx prisma generate

EXPOSE 4000

CMD ["npm", "run", "dev"]
