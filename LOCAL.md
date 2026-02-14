# Ejecutar en local (desarrollo)

## Opción recomendada: Backend y frontend con npm, solo BD en Docker

### 1. Levantar solo la base de datos

En una terminal:

```bash
cd saas-restaurante-backend
docker compose up db -d
```

Esto deja PostgreSQL corriendo en `localhost:5432`.

### 2. Backend (API)

En otra terminal:

```bash
cd saas-restaurante-backend
npm install
```

Crea un archivo `.env` (o copia de uno que tengas) con algo como:

```env
PORT=4000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/resto_saas?schema=public
JWT_SECRET=super-secret-cambia-esto
JWT_EXPIRES_IN=7d
APP_URL=http://localhost:3000
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

Luego:

```bash
npx prisma generate
npx prisma db push
npm run dev
```

La API quedará en **http://localhost:4000**.

### 3. Frontend (Next.js)

En otra terminal:

```bash
cd saas-restaurante-frontend
npm install
```

Asegúrate de tener `.env.local` con:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_RESTAURANT_SLUG=demo-resto
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=...
NEXT_PUBLIC_PAYPAL_CLIENT_ID=...
```

Luego:

```bash
npm run dev
```

La app quedará en **http://localhost:3000**.

---

## Resumen rápido (3 terminales)

| Terminal | Comando | Qué levanta |
|----------|---------|-------------|
| 1 | `cd saas-restaurante-backend && docker compose up db -d` | PostgreSQL |
| 2 | `cd saas-restaurante-backend && npm run dev` | API (puerto 4000) |
| 3 | `cd saas-restaurante-frontend && npm run dev` | Web (puerto 3000) |

Abre **http://localhost:3000** en el navegador.

---

## Parar la base de datos

Cuando termines de trabajar:

```bash
cd saas-restaurante-backend
docker compose down
```
