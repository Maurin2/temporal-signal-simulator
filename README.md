# Proyecto React — Guía rápida

Guía corta para correr el proyecto en **Ubuntu** y **Windows** sin vueltas.

---

## Requisitos

* **Node.js LTS**

**Ubuntu**

```bash
sudo apt update
sudo apt install -y nodejs npm
node -v && npm -v
```

**Windows**

1. Bajá **Node.js LTS** de [https://nodejs.org/](https://nodejs.org/)
2. Verificá en PowerShell:

```powershell
node -v
npm -v
```

---

## Instalación y ejecución

Desde la carpeta del proyecto:

```bash
# instalar dependencias
npm install

# levantar en desarrollo
npm run dev      # Vite
```

> La consola te muestra la URL (ej.: `http://localhost:5173`).

---

## Tips rápidos

* **Dependencias rotas**:

  ```bash
  rm -rf node_modules package-lock.json
  npm install
  ```
* **Puerto ocupado** (Ubuntu):

  ```bash
  lsof -ti:5173 | xargs kill -9   # o 3000
  ```

  **Windows (PowerShell)**:

  ```powershell
  netstat -ano | findstr :5173
  taskkill /PID <PID> /F
  ```
