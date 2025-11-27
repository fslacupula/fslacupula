# Ejecutar FutbolClub en Local

## Configuración actual

- **Backend**: Local (puerto 3001)
- **Frontend**: Local (puerto 5173 con Vite)
- **Base de datos**: Render (PostgreSQL en producción)

## Pasos para ejecutar

### 1. Backend

```powershell
cd backend
npm start
# o para desarrollo con auto-reload:
npm run dev
```

El backend arrancará en `http://localhost:3001`

### 2. Frontend (en otra terminal)

```powershell
cd frontend
npm run dev
```

El frontend arrancará en `http://localhost:5173`

### 3. Acceder a la aplicación

Abre tu navegador en: `http://localhost:5173`

## Credenciales de prueba

### Gestor:

- Email: `gestor@test.com`
- Password: `123456`

### Jugador:

- Email: `ortegasanz@gmail.com`
- Password: (la que esté configurada)

## Configuración de la base de datos

El archivo `backend/.env` está configurado para conectar a la base de datos de Render:

```
DATABASE_URL=postgresql://futbolclub_user:0aPGCWQKDaH6Z9sh0I9kZq2PdogdVU2w@dpg-d4jq522li9vc73dadslg-a.frankfurt-postgres.render.com/futbolclub
```

Si quieres cambiar a base de datos local, comenta `DATABASE_URL` y descomenta las variables locales en `backend/.env`.

## Troubleshooting

### Error de conexión a la base de datos

- Verifica que tengas conexión a internet (la BD está en Render)
- Verifica que la URL de conexión en `.env` sea correcta

### Error CORS

- Asegúrate de que el backend esté corriendo en el puerto 3001
- Asegúrate de que el frontend esté configurado para apuntar a `http://localhost:3001/api`

### Frontend no se conecta al backend

- Verifica que el archivo `frontend/.env` tenga:
  ```
  VITE_API_URL=http://localhost:3001/api
  ```
- Reinicia el servidor de Vite después de cambiar `.env`

## Notas

- Los cambios en el código se reflejan automáticamente gracias a hot-reload
- La base de datos es compartida con producción, ten cuidado al hacer cambios
- No es necesario desplegar en Render para probar cambios localmente
