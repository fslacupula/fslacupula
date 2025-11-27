import pool from "../config/database.js";

export { pool };

// Helper para formatear fechas correctamente (evita problemas de zona horaria)
const formatearFecha = (fecha) => {
  if (!fecha) return fecha;
  if (typeof fecha === 'string') return fecha;
  // Si es un objeto Date, formatearlo como YYYY-MM-DD sin conversión de zona horaria
  const d = new Date(fecha);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper para procesar resultados con fechas
const procesarResultadoConFecha = (row) => {
  if (!row) return row;
  if (row.fecha) {
    row.fecha = formatearFecha(row.fecha);
  }
  if (row.fecha_nacimiento) {
    row.fecha_nacimiento = formatearFecha(row.fecha_nacimiento);
  }
  return row;
};

export const Usuario = {
  async crear(email, password, nombre, rol = "jugador") {
    const result = await pool.query(
      "INSERT INTO usuarios (email, password, nombre, rol) VALUES ($1, $2, $3, $4) RETURNING id, email, nombre, rol, created_at",
      [email, password, nombre, rol]
    );
    return result.rows[0];
  },

  async buscarPorEmail(email) {
    const result = await pool.query("SELECT * FROM usuarios WHERE email = $1", [
      email,
    ]);
    return result.rows[0];
  },

  async buscarPorId(id) {
    const result = await pool.query(
      "SELECT id, email, nombre, rol, activo, created_at FROM usuarios WHERE id = $1",
      [id]
    );
    return result.rows[0];
  },

  async listarJugadores() {
    const result = await pool.query(
      `SELECT u.id, u.email, u.nombre, u.activo, 
              j.numero_dorsal, j.posicion_id, p.nombre as posicion, p.abreviatura, p.color, 
              j.telefono, j.fecha_nacimiento, j.alias
       FROM usuarios u
       LEFT JOIN jugadores j ON u.id = j.usuario_id
       LEFT JOIN posiciones p ON j.posicion_id = p.id
       WHERE u.rol = 'jugador'
       ORDER BY 
         u.activo DESC,
         CASE WHEN j.numero_dorsal IS NULL THEN 0 ELSE 1 END,
         j.numero_dorsal NULLS FIRST,
         u.nombre`
    );
    return result.rows;
  },

  async cambiarEstado(id, activo) {
    const result = await pool.query(
      "UPDATE usuarios SET activo = $1 WHERE id = $2 RETURNING id, activo",
      [activo, id]
    );
    return result.rows[0];
  },
};

export const Jugador = {
  async crear(usuarioId, datos) {
    const {
      numeroDorsal,
      posicionId,
      telefono,
      fechaNacimiento,
      fotoUrl,
      alias,
    } = datos;
    const result = await pool.query(
      "INSERT INTO jugadores (usuario_id, numero_dorsal, posicion_id, telefono, fecha_nacimiento, foto_url, alias) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
      [
        usuarioId,
        numeroDorsal,
        posicionId,
        telefono,
        fechaNacimiento,
        fotoUrl,
        alias,
      ]
    );
    return result.rows[0];
  },

  async actualizar(usuarioId, datos) {
    const {
      numeroDorsal,
      posicionId,
      telefono,
      fechaNacimiento,
      fotoUrl,
      alias,
    } = datos;
    const result = await pool.query(
      "UPDATE jugadores SET numero_dorsal = $1, posicion_id = $2, telefono = $3, fecha_nacimiento = $4, foto_url = $5, alias = $6 WHERE usuario_id = $7 RETURNING *",
      [
        numeroDorsal,
        posicionId,
        telefono,
        fechaNacimiento,
        fotoUrl,
        alias,
        usuarioId,
      ]
    );
    return result.rows[0];
  },

  async buscarPorUsuarioId(usuarioId) {
    const result = await pool.query(
      "SELECT * FROM jugadores WHERE usuario_id = $1",
      [usuarioId]
    );
    return result.rows[0];
  },
};

export const Entrenamiento = {
  async crear(fecha, hora, ubicacion, descripcion, duracionMinutos, creadoPor) {
    const result = await pool.query(
      "INSERT INTO entrenamientos (fecha, hora, lugar, descripcion, duracion_minutos, creado_por) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *, lugar as ubicacion",
      [fecha, hora, ubicacion, descripcion, duracionMinutos, creadoPor]
    );
    return result.rows[0];
  },

  async listar(filtros = {}) {
    let query = "SELECT *, lugar as ubicacion FROM entrenamientos WHERE 1=1";
    const params = [];

    if (filtros.fechaDesde) {
      params.push(filtros.fechaDesde);
      query += ` AND fecha >= $${params.length}`;
    }

    if (filtros.fechaHasta) {
      params.push(filtros.fechaHasta);
      query += ` AND fecha <= $${params.length}`;
    }

    query += " ORDER BY fecha DESC, hora DESC";

    const result = await pool.query(query, params);
    return result.rows.map(procesarResultadoConFecha);
  },

  async buscarPorId(id) {
    const result = await pool.query(
      "SELECT *, lugar as ubicacion FROM entrenamientos WHERE id = $1",
      [id]
    );
    return procesarResultadoConFecha(result.rows[0]);
  },

  async actualizar(id, datos) {
    const { fecha, hora, ubicacion, descripcion, duracionMinutos } = datos;
    const result = await pool.query(
      "UPDATE entrenamientos SET fecha = $1, hora = $2, lugar = $3, descripcion = $4, duracion_minutos = $5 WHERE id = $6 RETURNING *, lugar as ubicacion",
      [fecha, hora, ubicacion, descripcion, duracionMinutos, id]
    );
    return result.rows[0];
  },

  async eliminar(id) {
    await pool.query("DELETE FROM entrenamientos WHERE id = $1", [id]);
  },
};

export const Partido = {
  async crear(datos, creadoPor) {
    const {
      fecha,
      hora,
      rival,
      ubicacion,
      tipo,
      esLocal,
      resultado,
      observaciones,
    } = datos;
    const result = await pool.query(
      "INSERT INTO partidos (fecha, hora, rival, lugar, tipo, es_local, resultado, observaciones, creado_por) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *, lugar as ubicacion",
      [
        fecha,
        hora,
        rival,
        ubicacion,
        tipo,
        esLocal,
        resultado,
        observaciones,
        creadoPor,
      ]
    );
    return result.rows[0];
  },

  async listar(filtros = {}) {
    let query = "SELECT *, lugar as ubicacion FROM partidos WHERE 1=1";
    const params = [];

    if (filtros.fechaDesde) {
      params.push(filtros.fechaDesde);
      query += ` AND fecha >= $${params.length}`;
    }

    if (filtros.fechaHasta) {
      params.push(filtros.fechaHasta);
      query += ` AND fecha <= $${params.length}`;
    }

    query += " ORDER BY fecha DESC, hora DESC";

    const result = await pool.query(query, params);
    return result.rows.map(procesarResultadoConFecha);
  },

  async buscarPorId(id) {
    const result = await pool.query(
      "SELECT *, lugar as ubicacion FROM partidos WHERE id = $1",
      [id]
    );
    return procesarResultadoConFecha(result.rows[0]);
  },

  async actualizar(id, datos) {
    const {
      fecha,
      hora,
      rival,
      ubicacion,
      tipo,
      esLocal,
      resultado,
      observaciones,
    } = datos;
    const result = await pool.query(
      "UPDATE partidos SET fecha = $1, hora = $2, rival = $3, lugar = $4, tipo = $5, es_local = $6, resultado = $7, observaciones = $8 WHERE id = $9 RETURNING *, lugar as ubicacion",
      [
        fecha,
        hora,
        rival,
        ubicacion,
        tipo,
        esLocal,
        resultado,
        observaciones,
        id,
      ]
    );
    return result.rows[0];
  },

  async eliminar(id) {
    await pool.query("DELETE FROM partidos WHERE id = $1", [id]);
  },
};

export const AsistenciaEntrenamiento = {
  async registrar(
    entrenamientoId,
    jugadorId,
    estado,
    motivoAusenciaId = null,
    comentario = null
  ) {
    const result = await pool.query(
      `INSERT INTO asistencias_entrenamientos (entrenamiento_id, jugador_id, estado, motivo_ausencia_id, comentario) 
       VALUES ($1, $2, $3, $4, $5) 
       ON CONFLICT (entrenamiento_id, jugador_id) 
       DO UPDATE SET 
         estado = EXCLUDED.estado, 
         motivo_ausencia_id = EXCLUDED.motivo_ausencia_id, 
         comentario = EXCLUDED.comentario, 
         fecha_respuesta = CURRENT_TIMESTAMP
       RETURNING *`,
      [entrenamientoId, jugadorId, estado, motivoAusenciaId, comentario]
    );
    console.log("Resultado de INSERT/UPDATE:", result.rows[0]);
    return result.rows[0];
  },

  async listarPorEntrenamiento(entrenamientoId) {
    const result = await pool.query(
      `SELECT ae.*, u.nombre as jugador_nombre, u.email as jugador_email, 
              j.numero_dorsal as dorsal, j.posicion_id, p.nombre as posicion, p.abreviatura, p.color,
              j.alias, ma.motivo as motivo_nombre
       FROM asistencias_entrenamientos ae
       JOIN usuarios u ON ae.jugador_id = u.id
       LEFT JOIN jugadores j ON u.id = j.usuario_id
       LEFT JOIN posiciones p ON j.posicion_id = p.id
       LEFT JOIN motivos_ausencia ma ON ae.motivo_ausencia_id = ma.id
       WHERE ae.entrenamiento_id = $1
       ORDER BY u.nombre`,
      [entrenamientoId]
    );
    return result.rows;
  },

  async listarPorJugador(jugadorId) {
    const result = await pool.query(
      `SELECT e.id as entrenamiento_id, e.fecha, e.hora, e.lugar as ubicacion, e.descripcion,
              ae.estado, ae.motivo_ausencia_id, ae.comentario,
              ma.motivo as motivo_nombre
       FROM asistencias_entrenamientos ae
       JOIN entrenamientos e ON ae.entrenamiento_id = e.id
       LEFT JOIN motivos_ausencia ma ON ae.motivo_ausencia_id = ma.id
       WHERE ae.jugador_id = $1
       ORDER BY e.fecha DESC, e.hora DESC`,
      [jugadorId]
    );
    return result.rows.map((row) => ({
      id: row.entrenamiento_id,
      fecha: row.fecha,
      hora: row.hora,
      ubicacion: row.ubicacion,
      descripcion: row.descripcion,
      estado: row.estado,
      motivo_ausencia_id: row.motivo_ausencia_id,
      motivo_nombre: row.motivo_nombre,
      comentarios: row.comentario,
    }));
  },
};

export const AsistenciaPartido = {
  async registrar(
    partidoId,
    jugadorId,
    estado,
    motivoAusenciaId = null,
    comentario = null
  ) {
    const result = await pool.query(
      `INSERT INTO asistencias_partidos (partido_id, jugador_id, estado, motivo_ausencia_id, comentario) 
       VALUES ($1, $2, $3, $4, $5) 
       ON CONFLICT (partido_id, jugador_id) 
       DO UPDATE SET 
         estado = EXCLUDED.estado, 
         motivo_ausencia_id = EXCLUDED.motivo_ausencia_id, 
         comentario = EXCLUDED.comentario, 
         fecha_respuesta = CURRENT_TIMESTAMP
       RETURNING *`,
      [partidoId, jugadorId, estado, motivoAusenciaId, comentario]
    );
    console.log("Resultado de INSERT/UPDATE partido:", result.rows[0]);
    return result.rows[0];
  },

  async listarPorPartido(partidoId) {
    const result = await pool.query(
      `SELECT ap.*, u.nombre as jugador_nombre, u.email as jugador_email,
              j.numero_dorsal as dorsal, j.posicion_id, p.nombre as posicion, p.abreviatura, p.color,
              j.alias, ma.motivo as motivo_nombre
       FROM asistencias_partidos ap
       JOIN usuarios u ON ap.jugador_id = u.id
       LEFT JOIN jugadores j ON u.id = j.usuario_id
       LEFT JOIN posiciones p ON j.posicion_id = p.id
       LEFT JOIN motivos_ausencia ma ON ap.motivo_ausencia_id = ma.id
       WHERE ap.partido_id = $1
       ORDER BY u.nombre`,
      [partidoId]
    );
    return result.rows;
  },

  async listarPorJugador(jugadorId) {
    const result = await pool.query(
      `SELECT p.id as partido_id, p.fecha, p.hora, p.rival, p.lugar as ubicacion, 
              p.tipo, p.es_local, p.resultado,
              ap.estado, ap.motivo_ausencia_id, ap.comentario,
              ma.motivo as motivo_nombre
       FROM asistencias_partidos ap
       JOIN partidos p ON ap.partido_id = p.id
       LEFT JOIN motivos_ausencia ma ON ap.motivo_ausencia_id = ma.id
       WHERE ap.jugador_id = $1
       ORDER BY p.fecha DESC, p.hora DESC`,
      [jugadorId]
    );
    return result.rows.map((row) => ({
      id: row.partido_id,
      fecha: row.fecha,
      hora: row.hora,
      ubicacion: row.ubicacion,
      rival: row.rival,
      tipo: row.tipo,
      es_local: row.es_local,
      resultado: row.resultado,
      estado: row.estado,
      motivo_ausencia_id: row.motivo_ausencia_id,
      motivo_nombre: row.motivo_nombre,
      comentarios: row.comentario,
    }));
  },
};

export const MotivoAusencia = {
  async listar() {
    const result = await pool.query(
      "SELECT * FROM motivos_ausencia WHERE activo = TRUE ORDER BY motivo"
    );
    return result.rows;
  },
};

export const Posicion = {
  async listar() {
    const result = await pool.query(
      "SELECT * FROM posiciones WHERE activo = TRUE ORDER BY orden"
    );
    return result.rows;
  },

  async buscarPorId(id) {
    const result = await pool.query("SELECT * FROM posiciones WHERE id = $1", [
      id,
    ]);
    return result.rows[0];
  },

  async buscarPorNombre(nombre) {
    const result = await pool.query(
      "SELECT * FROM posiciones WHERE LOWER(nombre) = LOWER($1)",
      [nombre]
    );
    return result.rows[0];
  },
};
