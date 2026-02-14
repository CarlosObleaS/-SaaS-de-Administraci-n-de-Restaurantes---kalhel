@echo off
REM Sube el proyecto a la VM. Te pedira la contraseña de carlo@192.168.10.210
echo Subiendo proyecto a carlo@192.168.10.210 ...
cd /d "%~dp0.."
scp -r "Restaurante Saas" carlo@192.168.10.210:~/
echo.
echo Listo. Conectate con: ssh carlo@192.168.10.210
echo Luego: cd "Restaurante Saas"  y  cp .env.example .env  y  docker compose up -d --build
pause
