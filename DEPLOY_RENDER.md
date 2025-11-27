# 🚀 Guía de Despliegue en Render.com

## 📋 Requisitos previos

1. Cuenta en [Render.com](https://render.com) (gratis)
2. Cuenta en [GitHub](https://github.com)
3. Tu código subido a un repositorio de GitHub

---

## 🎯 Pasos de Despliegue

### 1️⃣ Subir código a GitHub

```bash
# Si aún no tienes git inicializado
git init
git add .
git commit -m "Preparar proyecto para Render"

# Crear repositorio en GitHub y subir
git remote add origin https://github.com/TU-USUARIO/FutbolClub.git
git branch -M main
git push -u origin main
```

### 2️⃣ Crear cuenta en Render.com

- Ve a https://render.com
- Regístrate con tu cuenta de GitHub
- Autoriza a Render para acceder a tus repositorios

### 3️⃣ Crear Base de Datos PostgreSQL

1. En el Dashboard de Render, haz clic en **"New +"** → **"PostgreSQL"**
2. Configuración:
   - **Name**: `futbolclub-db`
   - **Database**: `futbolclub`
   - **User**: (deja el por defecto)
   - **Region**: Frankfurt (o el más cercano)
   - **Plan**: **Free**
3. Clic en **"Create Database"**
4. **Guarda estos datos** (los verás en la página de la BD):
   - Internal Database URL
   - External Database URL

### 4️⃣ Crear Backend (Web Service)

1. Clic en **"New +"** → **"Web Service"**
2. Conecta tu repositorio de GitHub `FutbolClub`
3. Configuración:

   - **Name**: `futbolclub-api`
   - **Region**: Frankfurt (mismo que la BD)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: **Free**

4. **Variables de Entorno** (Environment Variables):
   Agregar estas variables:

   ```
   NODE_ENV=production
   PORT=3001
   DATABASE_URL=[Pegar Internal Database URL de la BD creada]
   JWT_SECRET=tu_secreto_super_seguro_aqui_cambiar_esto
   ```

5. Clic en **"Create Web Service"**
6. Espera a que se despliegue (5-10 minutos)
7. **Guarda la URL** que te da (ej: `https://futbolclub-api.onrender.com`)

### 5️⃣ Inicializar la Base de Datos

Una vez desplegado el backend, necesitas crear las tablas:

**Opción A: Desde Render Shell**

1. Ve a tu servicio `futbolclub-api`
2. Pestaña **"Shell"**
3. Ejecuta:

```bash
cd backend
node -e "
const fs = require('fs');
const { pool } = require('./models/index.js');

async function init() {
  const schema = fs.readFileSync('./database/schema.sql', 'utf8');
  await pool.query(schema);
  console.log('✅ BD inicializada');
  await pool.end();
}
init();
"
```

**Opción B: Desde cliente PostgreSQL local**

1. Copia el **External Database URL**
2. En tu terminal local:

```bash
psql "External-Database-URL-aqui" < backend/database/schema.sql
```

### 6️⃣ Crear Frontend (Static Site)

1. Clic en **"New +"** → **"Static Site"**
2. Conecta el mismo repositorio `FutbolClub`
3. Configuración:

   - **Name**: `futbolclub-frontend`
   - **Region**: Frankfurt
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

4. **Variables de Entorno**:

   ```
   VITE_API_URL=https://futbolclub-api.onrender.com/api
   ```

   (Usa la URL de tu backend del paso 4)

5. Clic en **"Create Static Site"**
6. Espera el despliegue (3-5 minutos)

### 7️⃣ Configurar CORS en el Backend

Actualiza el archivo `backend/server.js` si es necesario para permitir tu frontend:

```javascript
app.use(
  cors({
    origin: [
      "https://futbolclub-frontend.onrender.com",
      "http://localhost:5173", // Para desarrollo local
    ],
    credentials: true,
  })
);
```

Haz commit y push:

```bash
git add backend/server.js
git commit -m "Configurar CORS para Render"
git push
```

---

## 🎉 ¡Listo! Tu aplicación está desplegada

- **Frontend**: `https://futbolclub-frontend.onrender.com`
- **Backend API**: `https://futbolclub-api.onrender.com`
- **Base de Datos**: Conectada automáticamente

---

## ⚠️ Limitaciones del Plan Gratuito

### Backend (Web Service Free):

- ❄️ **Se duerme después de 15 minutos de inactividad**
- ⏰ Tarda ~30 segundos en despertar al recibir la primera petición
- 🕐 750 horas/mes (suficiente para 24/7 de 1 servicio)

### Base de Datos PostgreSQL Free:

- 💾 1GB de almacenamiento
- ⏳ 90 días de retención de datos
- 🔄 Después de 90 días sin actividad, se elimina

### Frontend (Static Site):

- ✅ 100% gratis sin límites
- ✅ No se duerme
- ✅ CDN global incluido

---

## 🔄 Actualizar la Aplicación

Cada vez que hagas `git push` a tu rama main, Render automáticamente:

1. Detecta los cambios
2. Reconstruye los servicios
3. Despliega la nueva versión

**No necesitas hacer nada más** 🎉

---

## 🐛 Solución de Problemas

### El backend no responde:

- Está dormido, espera 30 segundos
- Revisa los logs en Render Dashboard

### Error de CORS:

- Verifica que la URL del frontend esté en la configuración CORS del backend

### Base de datos no conecta:

- Verifica que DATABASE_URL esté correctamente configurada
- Asegúrate de usar la "Internal Database URL" en el backend

### Frontend no se ve:

- Revisa que VITE_API_URL apunte a la URL correcta del backend
- Verifica que el build se completó sin errores en los logs

---

## 📞 URLs Importantes

- Dashboard Render: https://dashboard.render.com
- Documentación: https://render.com/docs
- Tu proyecto desplegado:
  - Frontend: `https://futbolclub-frontend.onrender.com`
  - API: `https://futbolclub-api.onrender.com`

---

## 💡 Consejos

1. **Mantén activo el backend**: Configura un servicio como [UptimeRobot](https://uptimerobot.com) para hacer ping cada 5 minutos y evitar que se duerma

2. **Variables secretas**: Nunca subas `.env` a GitHub. Usa las variables de entorno de Render

3. **Logs**: Revisa los logs en tiempo real en el Dashboard para debugging

4. **Backups BD**: Exporta tu base de datos periódicamente desde el dashboard de PostgreSQL

---

¡Todo listo! 🚀
