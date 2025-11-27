-- Schema completo de FutbolClub
-- Generado: 2025-11-27T01:37:36.015Z

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

CREATE TABLE asistencias_entrenamientos (
  id INTEGER NOT NULL DEFAULT nextval('asistencias_entrenamientos_id_seq'::regclass),
  entrenamiento_id INTEGER,
  jugador_id INTEGER,
  estado VARCHAR(20) NOT NULL,
  motivo_ausencia_id INTEGER,
  comentario TEXT,
  fecha_respuesta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

ALTER TABLE asistencias_entrenamientos
  ADD CONSTRAINT asistencias_entrenamientos_entrenamiento_id_fkey
  FOREIGN KEY (entrenamiento_id)
  REFERENCES entrenamientos(id)
  ON DELETE CASCADE;

ALTER TABLE asistencias_entrenamientos
  ADD CONSTRAINT asistencias_entrenamientos_jugador_id_fkey
  FOREIGN KEY (jugador_id)
  REFERENCES usuarios(id)
  ON DELETE CASCADE;

ALTER TABLE asistencias_entrenamientos
  ADD CONSTRAINT asistencias_entrenamientos_motivo_ausencia_id_fkey
  FOREIGN KEY (motivo_ausencia_id)
  REFERENCES motivos_ausencia(id)
  ON DELETE CASCADE;

ALTER TABLE asistencias_entrenamientos
  ADD CONSTRAINT asistencias_entrenamientos_entrenamiento_id_jugador_id_key
  UNIQUE (entrenamiento_id);

ALTER TABLE asistencias_entrenamientos
  ADD CONSTRAINT asistencias_entrenamientos_entrenamiento_id_jugador_id_key
  UNIQUE (jugador_id);

CREATE TABLE asistencias_partidos (
  id INTEGER NOT NULL DEFAULT nextval('asistencias_partidos_id_seq'::regclass),
  partido_id INTEGER,
  jugador_id INTEGER,
  estado VARCHAR(20) NOT NULL,
  motivo_ausencia_id INTEGER,
  comentario TEXT,
  fecha_respuesta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

ALTER TABLE asistencias_partidos
  ADD CONSTRAINT asistencias_partidos_partido_id_fkey
  FOREIGN KEY (partido_id)
  REFERENCES partidos(id)
  ON DELETE CASCADE;

ALTER TABLE asistencias_partidos
  ADD CONSTRAINT asistencias_partidos_jugador_id_fkey
  FOREIGN KEY (jugador_id)
  REFERENCES usuarios(id)
  ON DELETE CASCADE;

ALTER TABLE asistencias_partidos
  ADD CONSTRAINT asistencias_partidos_motivo_ausencia_id_fkey
  FOREIGN KEY (motivo_ausencia_id)
  REFERENCES motivos_ausencia(id)
  ON DELETE CASCADE;

ALTER TABLE asistencias_partidos
  ADD CONSTRAINT asistencias_partidos_partido_id_jugador_id_key
  UNIQUE (partido_id);

ALTER TABLE asistencias_partidos
  ADD CONSTRAINT asistencias_partidos_partido_id_jugador_id_key
  UNIQUE (jugador_id);

CREATE TABLE entrenamientos (
  id INTEGER NOT NULL DEFAULT nextval('entrenamientos_id_seq'::regclass),
  fecha DATE NOT NULL,
  hora TIME WITHOUT TIME ZONE NOT NULL,
  lugar VARCHAR(255) NOT NULL,
  descripcion TEXT,
  duracion_minutos INTEGER DEFAULT 90,
  creado_por INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

ALTER TABLE entrenamientos
  ADD CONSTRAINT entrenamientos_creado_por_fkey
  FOREIGN KEY (creado_por)
  REFERENCES usuarios(id)
  ON DELETE CASCADE;

CREATE TABLE jugadores (
  id INTEGER NOT NULL DEFAULT nextval('jugadores_id_seq'::regclass),
  usuario_id INTEGER,
  numero_dorsal INTEGER,
  posicion VARCHAR(50),
  telefono VARCHAR(20),
  fecha_nacimiento DATE,
  foto_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  alias VARCHAR(50),
  posicion_id INTEGER,
  PRIMARY KEY (id)
);

ALTER TABLE jugadores
  ADD CONSTRAINT jugadores_usuario_id_fkey
  FOREIGN KEY (usuario_id)
  REFERENCES usuarios(id)
  ON DELETE CASCADE;

ALTER TABLE jugadores
  ADD CONSTRAINT jugadores_posicion_id_fkey
  FOREIGN KEY (posicion_id)
  REFERENCES posiciones(id)
  ON DELETE CASCADE;

ALTER TABLE jugadores
  ADD CONSTRAINT jugadores_usuario_id_key
  UNIQUE (usuario_id);

CREATE TABLE motivos_ausencia (
  id INTEGER NOT NULL DEFAULT nextval('motivos_ausencia_id_seq'::regclass),
  motivo VARCHAR(100) NOT NULL,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

ALTER TABLE motivos_ausencia
  ADD CONSTRAINT motivos_ausencia_motivo_key
  UNIQUE (motivo);

CREATE TABLE partidos (
  id INTEGER NOT NULL DEFAULT nextval('partidos_id_seq'::regclass),
  fecha DATE NOT NULL,
  hora TIME WITHOUT TIME ZONE NOT NULL,
  rival VARCHAR(255) NOT NULL,
  lugar VARCHAR(255) NOT NULL,
  tipo VARCHAR(50),
  es_local BOOLEAN DEFAULT true,
  resultado VARCHAR(20),
  observaciones TEXT,
  creado_por INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

ALTER TABLE partidos
  ADD CONSTRAINT partidos_creado_por_fkey
  FOREIGN KEY (creado_por)
  REFERENCES usuarios(id)
  ON DELETE CASCADE;

CREATE TABLE posiciones (
  id INTEGER NOT NULL DEFAULT nextval('posiciones_id_seq'::regclass),
  nombre VARCHAR(50) NOT NULL,
  descripcion TEXT,
  orden INTEGER,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  abreviatura VARCHAR(5) DEFAULT 'J'::character varying,
  color VARCHAR(20) DEFAULT 'blue'::character varying,
  PRIMARY KEY (id)
);

ALTER TABLE posiciones
  ADD CONSTRAINT posiciones_nombre_key
  UNIQUE (nombre);

CREATE TABLE usuarios (
  id INTEGER NOT NULL DEFAULT nextval('usuarios_id_seq'::regclass),
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  rol VARCHAR(20) NOT NULL,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

ALTER TABLE usuarios
  ADD CONSTRAINT usuarios_email_key
  UNIQUE (email);

