# Pasos para subir y poner a funcionar el proyecto en la VM

Todo en orden. Sigue esta guía de principio a fin.

---

## 🚀 Opción recomendada: usar Git (sin SCP, sin permisos)

La forma más limpia es **clonar el repositorio en la VM** y actualizar con `git pull`. Así evitas errores de permisos y copias innecesarias.

---

# Guía con Git (primera vez + actualizaciones)

## Primera vez: preparar la VM y el proyecto

### 1. Conectarte a la VM

```bash
ssh carlo@192.168.10.210
```

Introduce la contraseña cuando te la pida.

---

### 2. (Opcional) Borrar la carpeta antigua si ya tenías el proyecto con SCP

Si antes subiste el proyecto con SCP y tuviste problemas, elimina la carpeta:

```bash
rm -rf ~/Restaurante\ Saas
```

Si es la primera vez, omite este paso.

---

### 3. Clonar el repositorio en la VM

En la VM, ejecuta:

```bash
cd ~
git clone https://github.com/CarlosObleaS/-SaaS-de-Administraci-n-de-Restaurantes---kalhel.git "Restaurante Saas"
cd "Restaurante Saas"
```

Con esto la VM queda conectada al repositorio de GitHub. La carpeta se llama `Restaurante Saas` (con espacio).

---

### 4. Instalar Git en la VM (si no está instalado)

```bash
sudo apt update
sudo apt install -y git
```

---

### 5. Instalar Docker (si aún no está)

Si aparece error con `docker.io`, usa el script oficial:

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
exit
```

Luego vuelve a entrar: `ssh carlo@192.168.10.210`

---

### 6. Crear el archivo .env

```bash
cd ~/Restaurante\ Saas
cp .env.example .env
```

Revisa que `VM_IP=192.168.10.210` esté en `.env`. Si quieres editarlo: `nano .env` (Ctrl+O guardar, Ctrl+X salir).

---

### 7. Levantar la aplicación

```bash
docker compose up -d --build
```

Espera a que termine. La primera vez puede tardar varios minutos.

---

### 8. Verificar que funciona

```bash
docker compose ps
```

Debes ver 3 contenedores en estado **Up**. Luego abre en el navegador: **http://192.168.10.210:3000**

---

## Actualizar el proyecto cuando hagas cambios en tu PC

### En tu PC (Windows)

1. Modifica el código en Cursor/IDE.
2. Haz commit y push a GitHub:

```bash
cd "e:\Restaurante Saas"
git add .
git commit -m "Descripción del cambio"
git push origin main
```

(Te pedirá usuario y contraseña o token de GitHub si no tienes credenciales guardadas.)

---

### En la VM

1. Conéctate por SSH:

```bash
ssh carlo@192.168.10.210
```

2. Entra al proyecto, actualiza y reconstruye:

```bash
cd ~/Restaurante\ Saas
git pull origin main
docker compose up -d --build
```

3. Listo. Los cambios ya están desplegados. La base de datos **no se borra**.

---

## Resumen del flujo con Git

| Paso | Dónde | Comando |
|------|--------|---------|
| 1 | PC | Editar código, luego: `git add .` → `git commit -m "mensaje"` → `git push origin main` |
| 2 | PC | `ssh carlo@192.168.10.210` |
| 3 | VM | `cd ~/Restaurante\ Saas` |
| 4 | VM | `git pull origin main` |
| 5 | VM | `docker compose up -d --build` |

---

# Alternativa: subir con SCP (si no usas Git)

## Parte 1: En tu PC (Windows)

### Paso 1.1 — Subir el proyecto a la VM

Abre **PowerShell** o **CMD**:

```bash
scp -r "e:\Restaurante Saas" carlo@192.168.10.210:~/
```

(Te pedirá la contraseña de `carlo`. Si hay error de permisos en `.git`, usa el método Git de arriba.)

---

## Parte 2: En la VM (por SSH)

### Paso 2.1 — Conectarte a la VM

En PowerShell o CMD:

```bash
ssh carlo@192.168.10.210
```

Introduce la contraseña cuando te la pida. Ya estás dentro de la VM.

---

### Paso 2.2 — Instalar Docker (solo la primera vez)

Si en la VM **aún no tienes Docker**, ejecuta:

```bash
sudo apt update
sudo apt install -y docker.io docker-compose-plugin
sudo usermod -aG docker $USER
```

Luego **sal y vuelve a entrar** para que el usuario pueda usar Docker:

```bash
exit
ssh carlo@192.168.10.210
```

Si **ya tenías Docker**, omite este paso y sigue al 2.3.

---

### Paso 2.3 — Ir a la carpeta del proyecto

```bash
cd ~/Restaurante\ Saas
```

(La carpeta se llama "Restaurante Saas" porque la subiste con ese nombre.)

---

### Paso 2.4 — Crear el archivo .env

```bash
cp .env.example .env
```

Opcional: revisar o editar (por defecto ya trae `VM_IP=192.168.10.210`):

```bash
nano .env
```

Pulsa `Ctrl+O` para guardar, `Enter`, y `Ctrl+X` para salir.

---

### Paso 2.5 — Levantar la aplicación

```bash
docker compose up -d --build
```

La primera vez tarda varios minutos (descarga imágenes y construye backend y frontend). Cuando termine, no mostrará mucho más; es normal.

---

## Parte 3: Comprobar que está funcionando

### 3.1 — Ver que los contenedores están en marcha

En la VM (misma sesión SSH):

```bash
docker compose ps
```

Tienes que ver **3 contenedores** en estado **Up** (o "running"):

- `resto_saas_db`   (puerto 5432)
- `resto_saas_api`  (puerto 4000)
- `resto_saas_web`  (puerto 3000)

Si alguno está "Exit" o no aparece, algo falló.

---

### 3.2 — Ver los logs (si algo falla)

```bash
# Todos los servicios
docker compose logs -f

# Solo la API
docker compose logs -f api

# Solo el frontend
docker compose logs -f web
```

Pulsa `Ctrl+C` para dejar de seguir los logs.

---

### 3.3 — Probar desde el navegador

**Desde la misma VM** (si tiene interfaz gráfica) o **desde tu PC** (en la misma red):

1. Abre el navegador.
2. Ve a: **http://192.168.10.210:3000**

Deberías ver la página de inicio del SaaS (login o landing).

---

### 3.4 — Probar la API

En el navegador o con `curl`:

- **http://192.168.10.210:4000** — si hay una ruta de health o raíz, debería responder.
- Desde la VM: `curl -s http://localhost:4000` (o la ruta que tenga el backend para "ok").

Si la API responde, el backend está bien.

---

### 3.5 — Probar desde el celular u otro dispositivo

Con el celular (o otra PC) en **la misma red Wi‑Fi**:

1. Abre el navegador.
2. Entra a: **http://192.168.10.210:3000**

Si carga la misma página que en el PC, todo está funcionando y accesible desde otros dispositivos.

---

## Resumen rápido (checklist)

| # | Dónde | Qué hacer |
|---|--------|-----------|
| 1 | PC | `scp -r "e:\Restaurante Saas" carlo@192.168.10.210:~/` |
| 2 | PC | `ssh carlo@192.168.10.210` |
| 3 | VM | (Solo primera vez) Instalar Docker y hacer `exit` + volver a entrar |
| 4 | VM | `cd ~/Restaurante\ Saas` |
| 5 | VM | `cp .env.example .env` |
| 6 | VM | `docker compose up -d --build` |
| 7 | VM | `docker compose ps` → 3 contenedores "Up" |
| 8 | Navegador | Abrir **http://192.168.10.210:3000** |
| 9 | Celular/otro | Misma red → **http://192.168.10.210:3000** |

---

## Si algo no funciona

- **No puedo conectar por SSH:** comprueba que la VM está encendida y que la IP es 192.168.10.210 (`ping 192.168.10.210`).
- **No carga la web en el navegador:** comprueba que el firewall de la VM permite los puertos 3000 y 4000 (`sudo ufw allow 3000`, `sudo ufw allow 4000`, `sudo ufw enable` si usas UFW).
- **Contenedor en Exit:** ejecuta `docker compose logs api` (o `web` o `db`) y revisa el error.
- **Cambios en el código:** (con Git) en PC: `git push origin main`; en VM: `git pull` y `docker compose up -d --build`.

---

## Comandos útiles después de desplegar

```bash
# Ver estado
docker compose ps

# Ver logs en vivo
docker compose logs -f

# Reiniciar todo
docker compose restart

# Parar todo
docker compose down

# Parar y volver a levantar (tras subir cambios)
docker compose up -d --build
```
