# Despliegue en VM con SSH y Docker

Guía para desplegar el proyecto SaaS Restaurante en una máquina virtual accesible desde otros dispositivos.

---

## Tu VM: resumen con tus datos

| Dato | Valor |
|------|--------|
| **Usuario SSH** | `carlo` |
| **IP VM** | `192.168.10.210` |
| **Acceso web** | http://192.168.10.210:3000 |

### Pasos rápidos (en orden)

**En tu PC (PowerShell o CMD):**

```bash
# 1. Subir el proyecto a la VM (te pedirá la contraseña)
scp -r "e:\Restaurante Saas" carlo@192.168.10.210:~/
```

**En la VM (después de conectarte con `ssh carlo@192.168.10.210`):**

```bash
# 2. Entrar al proyecto (el nombre de la carpeta puede tener espacio)
cd ~/Restaurante\ Saas

# 3. Crear .env con la IP de la VM
cp .env.example .env
# Editar .env y dejar VM_IP=192.168.10.210 (ya viene en el ejemplo)

# 4. Instalar Docker si aún no está (solo la primera vez)
sudo apt update && sudo apt install -y docker.io docker-compose-plugin
sudo usermod -aG docker $USER
# Luego: exit y volver a entrar por SSH

# 5. Levantar todo
docker compose up -d --build
```

**Desde cualquier dispositivo en la misma red:** abre **http://192.168.10.210:3000**

---

## Requisitos previos

- VM con **Linux** (Ubuntu 22.04 recomendado)
- Acceso **SSH**
- **Docker** y **Docker Compose** instalados en la VM

---

## 1. Instalar Docker en la VM (si no lo tienes)

Conéctate por SSH:

```bash
ssh usuario@IP_DE_TU_VM
```

Instala Docker:

```bash
# Actualizar paquetes
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Instalar Docker Compose
sudo apt install docker-compose-plugin -y

# Cerrar sesión y volver a entrar para aplicar el grupo docker
exit
```

---

## 2. Subir el proyecto a la VM

Desde tu PC local (PowerShell o CMD, en la carpeta del proyecto o indicando la ruta):

```bash
# Opción A: SCP (copia el directorio completo) — para tu VM:
scp -r "e:\Restaurante Saas" carlo@192.168.10.210:~/

# Opción B: Clonar desde GitHub (desde dentro de la VM)
ssh carlo@192.168.10.210 "cd ~ && git clone https://github.com/CarlosObleaS/-SaaS-de-Administraci-n-de-Restaurantes---kalhel.git Restaurante-Saas"
```

Si usas SCP, en la VM la carpeta quedará como `~/Restaurante Saas` (con espacio). Usa `cd ~/Restaurante\ Saas` o `cd ~/"Restaurante Saas"`.

---

## 3. Configurar variables de entorno

En la VM:

```bash
cd ~/Restaurante\ Saas   # o ~/Restaurante-Saas si clonaste por git

cp .env.example .env
nano .env
```

**Variables obligatorias:**

| Variable | Descripción | Para tu VM |
|----------|-------------|------------|
| `VM_IP` | IP desde la que otros dispositivos accederán | `192.168.10.210` |
| `POSTGRES_PASSWORD` | Contraseña de PostgreSQL | Ej: `postgres` o la que elijas |
| `JWT_SECRET` | Secret para tokens JWT | Un string largo y aleatorio |

**Cómo obtener la IP de la VM:**

```bash
# IP en la red local
ip addr show | grep "inet " | grep -v 127.0.0.1

# O si tienes IP pública
curl -s ifconfig.me
```

---

## 4. Levantar los contenedores

```bash
cd ~/Restaurante\ Saas   # (o ~/Restaurante-Saas si clonaste por git)

docker compose up -d --build

# Ver logs
docker compose logs -f
```

---

## 5. Acceder desde otros dispositivos

Una vez levantado:

| Servicio | URL | Uso |
|----------|-----|-----|
| **Frontend** | `http://VM_IP:3000` | Aplicación web (login, admin, menú) |
| **API** | `http://VM_IP:4000` | Backend (usado por el frontend) |

Desde otro dispositivo en la **misma red** (celular, otra PC), abre el navegador:

```
http://192.168.10.210:3000
```

---

## 6. Comandos útiles

```bash
# Ver contenedores
docker compose ps

# Ver logs
docker compose logs -f api
docker compose logs -f web

# Reiniciar
docker compose restart

# Parar todo
docker compose down

# Parar y borrar volúmenes (cuidado: borra la BD)
docker compose down -v
```

---

## 7. Firewall (si no puedes conectar desde otros dispositivos)

Si otros dispositivos no pueden acceder, abre los puertos:

```bash
# UFW (Ubuntu)
sudo ufw allow 3000
sudo ufw allow 4000
sudo ufw enable
```

---

## 8. Datos iniciales (primer uso)

Si tienes un seed, puedes ejecutarlo:

```bash
docker compose exec api npx prisma db seed
```

---

## Resumen rápido (tu VM)

1. `ssh carlo@192.168.10.210` (contraseña cuando la pida)
2. `cd ~/Restaurante\ Saas`
3. `cp .env.example .env` (VM_IP=192.168.10.210 ya está en el ejemplo)
4. `docker compose up -d --build`
5. Abre **http://192.168.10.210:3000** desde cualquier dispositivo en la red
