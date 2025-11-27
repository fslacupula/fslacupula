-- Schema V2 de FutbolClub con TIMESTAMPTZ
-- Usa timestamps completos en lugar de DATE + TIME separados

-- Eliminar tablas si existen
DROP TABLE IF EXISTS asistencias_entrenamientos CASCADE;
DROP TABLE IF EXISTS asistencias_partidos CASCADE;
DROP TABLE IF EXISTS entrenamientos CASCADE;
DROP TABLE IF EXISTS jugadores CASCADE;
DROP TABLE IF EXISTS motivos_ausencia CASCADE;
DROP TABLE IF EXISTS partidos CASCADE;
DROP TABLE IF EXISTS posiciones CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

-- Tabla usuarios
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

-- Insertar posiciones por defecto
INSERT INTO posiciones (nombre, abreviatura, color, orden) VALUES
  ('Portero', 'J', 'blue', 1),
  ('Cierre', 'J', 'blue', 2),
  ('Ala', 'J', 'blue', 3),
  ('Pivot', 'J', 'blue', 4),
  ('Ala-Pivot', 'J', 'blue', 5),
  ('Extra', 'E', 'orange-600', 6),
  ('Staff', 'S', 'red', 7);

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

-- Insertar motivos por defecto
INSERT INTO motivos_ausencia (motivo) VALUES
  ('Trabajo'),
  ('Lesión'),
  ('Enfermedad'),
  ('Viaje'),
  ('Personal'),
  ('Otro');

-- Tabla entrenamientos (TIMESTAMPTZ en lugar de DATE + TIME)
CREATE TABLE entrenamientos (
  id SERIAL PRIMARY KEY,
  fecha_hora TIMESTAMPTZ NOT NULL,
  lugar VARCHAR(255) NOT NULL,
  descripcion TEXT,
  duracion_minutos INTEGER DEFAULT 90,
  creado_por INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_entrenamientos_fecha_hora ON entrenamientos(fecha_hora);

-- Tabla partidos (TIMESTAMPTZ en lugar de DATE + TIME)
CREATE TABLE partidos (
  id SERIAL PRIMARY KEY,
  fecha_hora TIMESTAMPTZ NOT NULL,
  rival VARCHAR(255) NOT NULL,
  lugar VARCHAR(255) NOT NULL,
  tipo VARCHAR(50),
  es_local BOOLEAN DEFAULT true,
  resultado VARCHAR(20),
  observaciones TEXT,
  creado_por INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_partidos_fecha_hora ON partidos(fecha_hora);

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
