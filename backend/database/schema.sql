-- Tabla de usuarios (jugadores y gestores)
CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  rol VARCHAR(20) NOT NULL CHECK (rol IN ('jugador', 'gestor')),
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de jugadores (información adicional)
CREATE TABLE jugadores (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
  numero_dorsal INTEGER,
  posicion VARCHAR(50),
  telefono VARCHAR(20),
  fecha_nacimiento DATE,
  foto_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de entrenamientos
CREATE TABLE entrenamientos (
  id SERIAL PRIMARY KEY,
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  lugar VARCHAR(255) NOT NULL,
  descripcion TEXT,
  duracion_minutos INTEGER DEFAULT 90,
  creado_por INTEGER REFERENCES usuarios(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de partidos
CREATE TABLE partidos (
  id SERIAL PRIMARY KEY,
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  rival VARCHAR(255) NOT NULL,
  lugar VARCHAR(255) NOT NULL,
  tipo VARCHAR(50) CHECK (tipo IN ('amistoso', 'liga', 'copa', 'torneo')),
  es_local BOOLEAN DEFAULT TRUE,
  resultado VARCHAR(20),
  observaciones TEXT,
  creado_por INTEGER REFERENCES usuarios(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de motivos de ausencia
CREATE TABLE motivos_ausencia (
  id SERIAL PRIMARY KEY,
  motivo VARCHAR(100) NOT NULL UNIQUE,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar motivos predefinidos
INSERT INTO motivos_ausencia (motivo) VALUES
  ('Lesión'),
  ('Enfermedad'),
  ('Trabajo'),
  ('Estudios'),
  ('Viaje'),
  ('Asuntos personales'),
  ('Otro');

-- Tabla de asistencia a entrenamientos
CREATE TABLE asistencias_entrenamientos (
  id SERIAL PRIMARY KEY,
  entrenamiento_id INTEGER REFERENCES entrenamientos(id) ON DELETE CASCADE,
  jugador_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
  estado VARCHAR(20) NOT NULL CHECK (estado IN ('confirmado', 'no_asiste', 'pendiente')),
  motivo_ausencia_id INTEGER REFERENCES motivos_ausencia(id),
  comentario TEXT,
  fecha_respuesta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(entrenamiento_id, jugador_id)
);

-- Tabla de asistencia a partidos
CREATE TABLE asistencias_partidos (
  id SERIAL PRIMARY KEY,
  partido_id INTEGER REFERENCES partidos(id) ON DELETE CASCADE,
  jugador_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
  estado VARCHAR(20) NOT NULL CHECK (estado IN ('confirmado', 'no_asiste', 'pendiente')),
  motivo_ausencia_id INTEGER REFERENCES motivos_ausencia(id),
  comentario TEXT,
  fecha_respuesta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(partido_id, jugador_id)
);

-- Índices para mejorar rendimiento
CREATE INDEX idx_entrenamientos_fecha ON entrenamientos(fecha);
CREATE INDEX idx_partidos_fecha ON partidos(fecha);
CREATE INDEX idx_asistencias_ent_jugador ON asistencias_entrenamientos(jugador_id);
CREATE INDEX idx_asistencias_par_jugador ON asistencias_partidos(jugador_id);
CREATE INDEX idx_usuarios_rol ON usuarios(rol);
