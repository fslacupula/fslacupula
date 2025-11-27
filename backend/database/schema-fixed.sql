-- Schema completo de FutbolClub
-- Corregido para usar SERIAL

-- Eliminar tablas si existen
DROP TABLE IF EXISTS asistencias_entrenamientos CASCADE;
DROP TABLE IF EXISTS asistencias_partidos CASCADE;
DROP TABLE IF EXISTS entrenamientos CASCADE;
DROP TABLE IF EXISTS jugadores CASCADE;
DROP TABLE IF EXISTS motivos_ausencia CASCADE;
DROP TABLE IF EXISTS partidos CASCADE;
DROP TABLE IF EXISTS posiciones CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

-- Crear tablas

-- Tabla usuarios (primero porque es referenciada por otras)
CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  rol VARCHAR(20) NOT NULL,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla posiciones
CREATE TABLE posiciones (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL UNIQUE,
  descripcion TEXT,
  orden INTEGER,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  abreviatura VARCHAR(5) DEFAULT 'J',
  color VARCHAR(20) DEFAULT 'blue'
);

-- Tabla jugadores
CREATE TABLE jugadores (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
  numero_dorsal INTEGER,
  posicion VARCHAR(50),
  telefono VARCHAR(20),
  fecha_nacimiento DATE,
  foto_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  alias VARCHAR(50),
  posicion_id INTEGER REFERENCES posiciones(id) ON DELETE CASCADE
);

-- Tabla motivos_ausencia
CREATE TABLE motivos_ausencia (
  id SERIAL PRIMARY KEY,
  motivo VARCHAR(100) NOT NULL UNIQUE,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla entrenamientos
CREATE TABLE entrenamientos (
  id SERIAL PRIMARY KEY,
  fecha DATE NOT NULL,
  hora TIME WITHOUT TIME ZONE NOT NULL,
  lugar VARCHAR(255) NOT NULL,
  descripcion TEXT,
  duracion_minutos INTEGER DEFAULT 90,
  creado_por INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla partidos
CREATE TABLE partidos (
  id SERIAL PRIMARY KEY,
  fecha DATE NOT NULL,
  hora TIME WITHOUT TIME ZONE NOT NULL,
  rival VARCHAR(255) NOT NULL,
  lugar VARCHAR(255) NOT NULL,
  tipo VARCHAR(50),
  es_local BOOLEAN DEFAULT true,
  resultado VARCHAR(20),
  observaciones TEXT,
  creado_por INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla asistencias_entrenamientos
CREATE TABLE asistencias_entrenamientos (
  id SERIAL PRIMARY KEY,
  entrenamiento_id INTEGER REFERENCES entrenamientos(id) ON DELETE CASCADE,
  jugador_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
  estado VARCHAR(20) NOT NULL,
  motivo_ausencia_id INTEGER REFERENCES motivos_ausencia(id) ON DELETE CASCADE,
  comentario TEXT,
  fecha_respuesta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(entrenamiento_id, jugador_id)
);

-- Tabla asistencias_partidos
CREATE TABLE asistencias_partidos (
  id SERIAL PRIMARY KEY,
  partido_id INTEGER REFERENCES partidos(id) ON DELETE CASCADE,
  jugador_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
  estado VARCHAR(20) NOT NULL,
  motivo_ausencia_id INTEGER REFERENCES motivos_ausencia(id) ON DELETE CASCADE,
  comentario TEXT,
  fecha_respuesta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(partido_id, jugador_id)
);
