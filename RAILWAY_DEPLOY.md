# Despliegue en Railway - FútbolClub ⚽

## Paso 1: Preparar el repositorio

1. Inicializa Git si no lo has hecho:

```bash
git init
git add .
git commit -m "Initial commit - FútbolClub project"
```

2. Sube tu código a GitHub:

```bash
# Crea un nuevo repositorio en GitHub y luego:
git remote add origin https://github.com/tu-usuario/futbolclub.git
git branch -M main
git push -u origin main
```

## Paso 2: Crear proyecto en Railway

1. Ve a [railway.app](https://railway.app) y crea una cuenta
2. Click en "New Project"
3. Selecciona "Deploy from GitHub repo"
4. Conecta tu cuenta de GitHub y selecciona el repositorio `futbolclub`

## Paso 3: Agregar PostgreSQL

1. En el dashboard de tu proyecto, click en "+ New"
2. Selecciona "Database" → "PostgreSQL"
3. Railway creará automáticamente la base de datos

## Paso 4: Configurar Variables de Entorno

En el servicio de tu aplicación, ve a "Variables" y agrega:

```env
NODE_ENV=production
PORT=3001
JWT_SECRET=tu_clave_secreta_super_segura_aqui_cambiala
```

Railway automáticamente agregará las variables de la base de datos:

- `DATABASE_URL` (Railway la proporciona automáticamente)
- O puedes usar las individuales:
  - `DB_HOST`
  - `DB_PORT`
  - `DB_USER`
  - `DB_PASSWORD`
  - `DB_NAME`

## Paso 5: Inicializar la Base de Datos

1. En Railway, ve a tu base de datos PostgreSQL
2. Click en "Connect" → "psql"
3. Copia y pega el contenido de `backend/database/schema.sql`
4. Ejecuta el script para crear las tablas

O puedes conectarte localmente:

```bash
# Usa la cadena de conexión que proporciona Railway
psql <DATABASE_URL>
\i backend/database/schema.sql
```

## Paso 6: Deploy

Railway desplegará automáticamente tu aplicación:

- Instalará las dependencias
- Compilará el frontend
- Iniciará el servidor backend

## Paso 7: Verificar

1. Railway te dará una URL como: `https://tu-proyecto.up.railway.app`
2. Visita esa URL y deberías ver tu aplicación funcionando

## Paso 8: Crear Usuario Administrador

Conéctate a la base de datos y crea un usuario gestor:

```sql
INSERT INTO usuarios (nombre, email, password_hash, rol, activo)
VALUES (
  'Admin',
  'admin@futbolclub.com',
  -- Genera el hash con bcrypt (contraseña: admin123)
  '$2b$10$...',
  'gestor',
  true
);
```

Para generar el hash de la contraseña, puedes usar:

```bash
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('admin123', 10).then(console.log)"
```

## Mantenimiento

### Ver Logs:

En Railway → Tu servicio → "Deployments" → Click en el deploy → "View Logs"

### Redeployear:

```bash
git add .
git commit -m "Update"
git push
```

Railway automáticamente detectará los cambios y redesplegará.

### Variables de Entorno:

Puedes cambiarlas en Railway → Variables → Editar

## Troubleshooting

**Error de conexión a la base de datos:**

- Verifica que las variables `DB_*` estén configuradas
- Asegúrate de que el schema.sql se haya ejecutado

**Frontend no se ve:**

- Verifica que `NODE_ENV=production` esté configurado
- Revisa que el build del frontend se haya completado

**Errores en logs:**

- Ve a Railway → Deployments → View Logs
- Busca mensajes de error específicos

## URLs Importantes

- **Dashboard Railway:** https://railway.app/dashboard
- **Documentación:** https://docs.railway.app
- **Status:** https://status.railway.app

## Costos

Railway ofrece:

- **$5 USD de crédito mensual gratis**
- Suficiente para proyectos de desarrollo/demo
- Monitorea tu uso en el dashboard
