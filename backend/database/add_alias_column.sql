-- Agregar columna alias a la tabla jugadores
ALTER TABLE jugadores ADD COLUMN IF NOT EXISTS alias VARCHAR(50);

-- Agregar comentario a la columna
COMMENT ON COLUMN jugadores.alias IS 'Nombre de pila o apodo del jugador';
