# ⚽ FútbolClub - Sistema de Gestión de Equipo

Sistema completo para gestionar entrenamientos, partidos y asistencia de jugadores de fútbol.

## 🚀 Características

- ✅ **Gestión de Entrenamientos**: Crear, editar y eliminar entrenamientos
- ✅ **Gestión de Partidos**: Administrar partidos con rivales, tipos y resultados
- ✅ **Control de Asistencia**: Jugadores confirman asistencia con motivos de ausencia
- ✅ **Roles de Usuario**: Gestores (administradores) y Jugadores
- ✅ **Vista Calendario y Lista**: Múltiples formas de visualizar eventos
- ✅ **Responsive Design**: Optimizado para mobile y desktop
- ✅ **Autenticación JWT**: Sistema seguro de login

## 🛠️ Tecnologías

### Backend

- **Node.js** + **Express**
- **PostgreSQL** (base de datos)
- **JWT** (autenticación)
- **bcrypt** (encriptación de contraseñas)

### Frontend

- **React 18** + **Vite**
- **React Router** (navegación)
- **Axios** (peticiones HTTP)
- **Tailwind CSS** (estilos)

## 📦 Instalación Local

### Prerrequisitos

- Node.js 18+
- PostgreSQL 14+ o Docker

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/futbolclub.git
cd futbolclub
```

### 2. Levantar la base de datos con Docker

```bash
docker-compose up -d
```

Esto iniciará PostgreSQL en el puerto 5433.

### 3. Configurar Backend

```bash
cd backend
npm install
```

Crea un archivo `.env`:

```env
PORT=3001
DB_USER=futbolclub
DB_PASSWORD=futbolclub123
DB_NAME=futbolclub
DB_HOST=localhost
DB_PORT=5433
JWT_SECRET=tu_secreto_jwt_super_seguro_cambiar_en_produccion
```

Ejecuta el schema para crear las tablas:

```bash
# Usando psql directamente
psql -h localhost -p 5433 -U futbolclub -d futbolclub -f database/schema.sql

# O con Docker
docker exec -i futbolclub-db psql -U futbolclub -d futbolclub < database/schema.sql
```

Inicia el servidor:

```bash
npm start
```

El backend estará en http://localhost:3001

### 4. Configurar Frontend

```bash
cd ../frontend
npm install
npm run dev
```

El frontend estará en http://localhost:5173

## 🌐 Despliegue en Railway

Para desplegar en producción, consulta la guía completa: **[RAILWAY_DEPLOY.md](./RAILWAY_DEPLOY.md)**

### Resumen rápido:

1. Sube tu código a GitHub
2. Crea cuenta en [railway.app](https://railway.app)
3. Crea nuevo proyecto desde GitHub repo
4. Agrega PostgreSQL database
5. Configura variables de entorno (NODE_ENV=production, JWT_SECRET)
6. Ejecuta schema.sql en Railway PostgreSQL
7. Railway desplegará automáticamente

## 👥 Usuarios de Prueba

Después de ejecutar `schema.sql`, tendrás estos usuarios disponibles:

### Gestor (Administrador)

- **Email**: gestor@futbolclub.com
- **Contraseña**: password123
- **Permisos**: Crear eventos, gestionar asistencias, editar/eliminar

### Jugadores

- **Email**: jugador1@futbolclub.com
- **Contraseña**: password123
- **Permisos**: Ver eventos, confirmar asistencia

_Hay 5 jugadores creados (jugador1 a jugador5) con la misma contraseña_

## 📱 Uso de la Aplicación

### Como Gestor:

1. Login con cuenta de gestor
2. Ver dashboard con todos los eventos (entrenamientos y partidos)
3. Crear nuevos entrenamientos o partidos
4. Editar o eliminar eventos existentes
5. Ver detalle de asistencia de cada evento
6. Filtrar eventos: Todos, Entrenamientos, Partidos

### Como Jugador:

1. Login con cuenta de jugador
2. Ver eventos asignados (vista calendario o lista)
3. Confirmar asistencia con un clic
4. Indicar ausencia y seleccionar motivo:
   - 🏥 Lesión
   - 🤒 Enfermedad
   - 💼 Trabajo
   - 📚 Estudios
   - ✈️ Viaje
   - 👨‍👩‍👧 Compromiso familiar
   - ❓ Otro
5. Añadir comentarios adicionales (opcional)

## 🗂️ Estructura del Proyecto

```
FutbolClub/
├── backend/
│   ├── config/
│   │   └── database.js      # Configuración PostgreSQL
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── entrenamientoController.js
│   │   ├── partidoController.js
│   │   └── motivoController.js
│   ├── database/
│   │   └── schema.sql       # Schema completo + datos iniciales
│   ├── middleware/
│   │   └── auth.js          # Middleware JWT
│   ├── models/
│   │   └── index.js         # Modelos de datos
│   ├── routes/
│   │   ├── auth.js
│   │   ├── entrenamientos.js
│   │   ├── partidos.js
│   │   └── motivos.js
│   ├── server.js            # Servidor principal
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── DashboardGestor.jsx
│   │   │   ├── DashboardJugador.jsx
│   │   │   └── DetalleAsistencia.jsx
│   │   ├── services/
│   │   │   └── api.js       # Cliente Axios
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
├── docker-compose.yml       # PostgreSQL local
├── railway.json             # Config Railway
├── nixpacks.toml            # Build config Railway
├── RAILWAY_DEPLOY.md        # Guía despliegue
└── README.md
```

## 🔧 Scripts Disponibles

### Backend

```bash
npm start          # Producción
npm run dev        # Desarrollo con nodemon
```

### Frontend

```bash
npm run dev        # Servidor desarrollo (Vite)
npm run build      # Build producción
npm run preview    # Preview build local
```

## 📊 Base de datos

El schema incluye:

- **usuarios**: Usuarios con email, contraseña (bcrypt) y rol (jugador/gestor)
- **jugadores**: Información adicional de jugadores (dorsal, posición)
- **entrenamientos**: Entrenamientos programados con fecha, hora, lugar
- **partidos**: Partidos con rival, tipo (amistoso/liga/copa), resultado
- **motivos_ausencia**: 7 motivos predefinidos para justificar ausencias
- **asistencias_entrenamientos**: Control de asistencia a entrenamientos
- **asistencias_partidos**: Control de asistencia a partidos

**Nota**: Al crear un entrenamiento o partido, automáticamente se generan registros de asistencia en estado "pendiente" para todos los jugadores activos mediante triggers.

## 🔌 API Endpoints

### Auth (`/api/auth`)

- `POST /register` - Registro de usuario (jugador o gestor)
- `POST /login` - Login (devuelve JWT token)
- `GET /perfil` - Perfil del usuario autenticado (requiere token)

### Entrenamientos (`/api/entrenamientos`)

- `GET /` - Listar todos (gestor) o filtrados por jugador
- `GET /mis-entrenamientos` - Entrenamientos del jugador autenticado
- `POST /` - Crear entrenamiento (solo gestor)
- `GET /:id` - Detalle con lista de asistencias
- `PUT /:id` - Actualizar entrenamiento (solo gestor)
- `DELETE /:id` - Eliminar entrenamiento (solo gestor)
- `POST /:id/asistencia` - Registrar/actualizar asistencia (jugador)

### Partidos (`/api/partidos`)

- `GET /` - Listar todos (gestor) o filtrados por jugador
- `GET /mis-partidos` - Partidos del jugador autenticado
- `POST /` - Crear partido (solo gestor)
- `GET /:id` - Detalle con lista de asistencias
- `PUT /:id` - Actualizar partido (solo gestor)
- `DELETE /:id` - Eliminar partido (solo gestor)
- `POST /:id/asistencia` - Registrar/actualizar asistencia (jugador)

### Motivos (`/api/motivos`)

- `GET /` - Listar motivos de ausencia disponibles

## 💻 Desarrollo

Para desarrollo local, ejecuta ambos servidores simultáneamente:

**Terminal 1 - Backend:**

```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**

```bash
cd frontend
npm run dev
```

El frontend tiene configurado un proxy en `vite.config.js` que redirige `/api/*` al backend en `http://localhost:3001`.

## 🚀 Producción

El backend está configurado para servir el frontend en producción. Cuando `NODE_ENV=production`, Express sirve los archivos estáticos desde `frontend/dist/`.

**Build completo:**

```bash
# 1. Build frontend
cd frontend
npm run build

# 2. Iniciar backend (sirve frontend + API)
cd ../backend
NODE_ENV=production npm start
```

En Railway, este proceso es automático gracias a `nixpacks.toml`.

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/NuevaCaracteristica`)
3. Commit cambios (`git commit -m 'Añadir nueva característica'`)
4. Push a la rama (`git push origin feature/NuevaCaracteristica`)
5. Abre un Pull Request

## 📝 Notas Adicionales

- **Seguridad**: Las contraseñas se encriptan con bcrypt (10 rondas de salt)
- **Tokens JWT**: Expiran en 24 horas
- **Triggers automáticos**: Al crear eventos se generan asistencias para todos los jugadores
- **Validaciones**: El backend valida roles, autenticación y permisos
- **Responsive**: Diseño optimizado para mobile-first con Tailwind CSS

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

---

⚽ **¡Hecho con pasión por el fútbol!** ⚽
