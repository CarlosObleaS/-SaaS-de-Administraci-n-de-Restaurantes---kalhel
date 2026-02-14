FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .
RUN npx prisma generate

EXPOSE 4000

# Migraciones y arranque
CMD ["sh", "-c", "npx prisma db push --accept-data-loss 2>/dev/null; node src/server.js"]
