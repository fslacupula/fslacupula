/**
 * @class AsistenciaRepositoryPg
 * @description Implementación PostgreSQL del repositorio de asistencias.
 * Gestiona tanto asistencias a partidos como a entrenamientos usando dos tablas separadas.
 */
export class AsistenciaRepositoryPg {
  constructor(pool) {
    if (!pool) {
      throw new Error("pool de base de datos es requerido");
    }
    this.pool = pool;
  }

  /**
   * Registra una asistencia para un evento (partido o entrenamiento)
   */
  async registrar(asistenciaData) {
    const {
      jugadorId,
      partidoId,
      entrenamientoId,
      estado,
      motivoAusenciaId,
      comentario,
    } = asistenciaData;

    // Determinar tabla según el tipo de evento
    const esPartido = partidoId !== undefined && partidoId !== null;
    const esEntrenamiento =
      entrenamientoId !== undefined && entrenamientoId !== null;

    if (!esPartido && !esEntrenamiento) {
      throw new Error("Debe especificar partidoId o entrenamientoId");
    }

    if (esPartido && esEntrenamiento) {
      throw new Error(
        "No se puede registrar asistencia para partido y entrenamiento simultáneamente"
      );
    }

    const tabla = esPartido
      ? "asistencias_partidos"
      : "asistencias_entrenamientos";
    const campoEvento = esPartido ? "partido_id" : "entrenamiento_id";
    const valorEvento = esPartido ? partidoId : entrenamientoId;

    const query = `
      INSERT INTO ${tabla} (
        ${campoEvento}, jugador_id, estado, motivo_ausencia_id, comentario, fecha_respuesta
      )
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING *
    `;

    const params = [
      valorEvento,
      jugadorId,
      estado,
      motivoAusenciaId || null,
      comentario || null,
    ];

    const result = await this.pool.query(query, params);
    return this._mapToObject(result.rows[0], esPartido);
  }

  /**
   * Actualiza el estado de una asistencia existente
   */
  async actualizar(id, actualizaciones) {
    const { estado, motivoAusenciaId, comentario } = actualizaciones;

    // Intentar actualizar en asistencias_partidos primero
    let query = `
      UPDATE asistencias_partidos
      SET estado = COALESCE($1, estado),
          motivo_ausencia_id = $2,
          comentario = COALESCE($3, comentario),
          fecha_respuesta = NOW()
      WHERE id = $4
      RETURNING *
    `;

    let params = [estado, motivoAusenciaId || null, comentario, id];
    let result = await this.pool.query(query, params);

    if (result.rows.length > 0) {
      return this._mapToObject(result.rows[0], true);
    }

    // Si no encontró, intentar en asistencias_entrenamientos
    query = `
      UPDATE asistencias_entrenamientos
      SET estado = COALESCE($1, estado),
          motivo_ausencia_id = $2,
          comentario = COALESCE($3, comentario),
          fecha_respuesta = NOW()
      WHERE id = $4
      RETURNING *
    `;

    result = await this.pool.query(query, params);

    if (result.rows.length === 0) {
      return null;
    }

    return this._mapToObject(result.rows[0], false);
  }

  /**
   * Busca una asistencia por ID
   */
  async findById(id) {
    // Buscar en asistencias_partidos
    let query = "SELECT * FROM asistencias_partidos WHERE id = $1";
    let result = await this.pool.query(query, [id]);

    if (result.rows.length > 0) {
      return this._mapToObject(result.rows[0], true);
    }

    // Buscar en asistencias_entrenamientos
    query = "SELECT * FROM asistencias_entrenamientos WHERE id = $1";
    result = await this.pool.query(query, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    return this._mapToObject(result.rows[0], false);
  }

  /**
   * Busca una asistencia específica de un jugador a un evento
   */
  async findByJugadorYEvento(
    jugadorId,
    partidoId = null,
    entrenamientoId = null
  ) {
    if (partidoId) {
      const query =
        "SELECT * FROM asistencias_partidos WHERE jugador_id = $1 AND partido_id = $2";
      const result = await this.pool.query(query, [jugadorId, partidoId]);
      return result.rows.length > 0
        ? this._mapToObject(result.rows[0], true)
        : null;
    }

    if (entrenamientoId) {
      const query =
        "SELECT * FROM asistencias_entrenamientos WHERE jugador_id = $1 AND entrenamiento_id = $2";
      const result = await this.pool.query(query, [jugadorId, entrenamientoId]);
      return result.rows.length > 0
        ? this._mapToObject(result.rows[0], false)
        : null;
    }

    return null;
  }

  /**
   * Obtiene todas las asistencias de un partido
   */
  async findByPartidoId(partidoId) {
    const query =
      "SELECT * FROM asistencias_partidos WHERE partido_id = $1 ORDER BY jugador_id ASC";
    const result = await this.pool.query(query, [partidoId]);
    return result.rows.map((row) => this._mapToObject(row, true));
  }

  /**
   * Obtiene todas las asistencias de un entrenamiento
   */
  async findByEntrenamientoId(entrenamientoId) {
    const query =
      "SELECT * FROM asistencias_entrenamientos WHERE entrenamiento_id = $1 ORDER BY jugador_id ASC";
    const result = await this.pool.query(query, [entrenamientoId]);
    return result.rows.map((row) => this._mapToObject(row, false));
  }

  /**
   * Obtiene todas las asistencias de un jugador
   */
  async findByJugadorId(jugadorId, opciones = {}) {
    const { tipo, fechaDesde, fechaHasta } = opciones;
    const asistencias = [];

    // Obtener asistencias de partidos
    if (!tipo || tipo === "partido") {
      let query = `
        SELECT ap.* 
        FROM asistencias_partidos ap
        JOIN partidos p ON ap.partido_id = p.id
        WHERE ap.jugador_id = $1
      `;
      const params = [jugadorId];
      let paramCount = 2;

      if (fechaDesde) {
        query += ` AND p.fecha_hora >= $${paramCount}`;
        params.push(fechaDesde);
        paramCount++;
      }

      if (fechaHasta) {
        query += ` AND p.fecha_hora <= $${paramCount}`;
        params.push(fechaHasta);
        paramCount++;
      }

      query += " ORDER BY p.fecha_hora DESC";

      const result = await this.pool.query(query, params);
      asistencias.push(
        ...result.rows.map((row) => this._mapToObject(row, true))
      );
    }

    // Obtener asistencias de entrenamientos
    if (!tipo || tipo === "entrenamiento") {
      let query = `
        SELECT ae.* 
        FROM asistencias_entrenamientos ae
        JOIN entrenamientos e ON ae.entrenamiento_id = e.id
        WHERE ae.jugador_id = $1
      `;
      const params = [jugadorId];
      let paramCount = 2;

      if (fechaDesde) {
        query += ` AND e.fecha_hora >= $${paramCount}`;
        params.push(fechaDesde);
        paramCount++;
      }

      if (fechaHasta) {
        query += ` AND e.fecha_hora <= $${paramCount}`;
        params.push(fechaHasta);
        paramCount++;
      }

      query += " ORDER BY e.fecha_hora DESC";

      const result = await this.pool.query(query, params);
      asistencias.push(
        ...result.rows.map((row) => this._mapToObject(row, false))
      );
    }

    return asistencias;
  }

  /**
   * Obtiene estadísticas de asistencia de un jugador
   */
  async getEstadisticasByJugador(jugadorId, opciones = {}) {
    const { tipo, fechaDesde, fechaHasta } = opciones;
    let total = 0;
    let confirmados = 0;
    let ausentes = 0;
    let pendientes = 0;

    // Estadísticas de partidos
    if (!tipo || tipo === "partido") {
      let query = `
        SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE ap.estado = 'confirmado') as confirmados,
          COUNT(*) FILTER (WHERE ap.estado = 'ausente') as ausentes,
          COUNT(*) FILTER (WHERE ap.estado = 'pendiente') as pendientes
        FROM asistencias_partidos ap
        JOIN partidos p ON ap.partido_id = p.id
        WHERE ap.jugador_id = $1
      `;
      const params = [jugadorId];
      let paramCount = 2;

      if (fechaDesde) {
        query += ` AND p.fecha_hora >= $${paramCount}`;
        params.push(fechaDesde);
        paramCount++;
      }

      if (fechaHasta) {
        query += ` AND p.fecha_hora <= $${paramCount}`;
        params.push(fechaHasta);
        paramCount++;
      }

      const result = await this.pool.query(query, params);
      const stats = result.rows[0];
      total += parseInt(stats.total);
      confirmados += parseInt(stats.confirmados);
      ausentes += parseInt(stats.ausentes);
      pendientes += parseInt(stats.pendientes);
    }

    // Estadísticas de entrenamientos
    if (!tipo || tipo === "entrenamiento") {
      let query = `
        SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE ae.estado = 'confirmado') as confirmados,
          COUNT(*) FILTER (WHERE ae.estado = 'ausente') as ausentes,
          COUNT(*) FILTER (WHERE ae.estado = 'pendiente') as pendientes
        FROM asistencias_entrenamientos ae
        JOIN entrenamientos e ON ae.entrenamiento_id = e.id
        WHERE ae.jugador_id = $1
      `;
      const params = [jugadorId];
      let paramCount = 2;

      if (fechaDesde) {
        query += ` AND e.fecha_hora >= $${paramCount}`;
        params.push(fechaDesde);
        paramCount++;
      }

      if (fechaHasta) {
        query += ` AND e.fecha_hora <= $${paramCount}`;
        params.push(fechaHasta);
        paramCount++;
      }

      const result = await this.pool.query(query, params);
      const stats = result.rows[0];
      total += parseInt(stats.total);
      confirmados += parseInt(stats.confirmados);
      ausentes += parseInt(stats.ausentes);
      pendientes += parseInt(stats.pendientes);
    }

    const porcentajeAsistencia = total > 0 ? (confirmados / total) * 100 : 0;

    return {
      total,
      confirmados,
      ausentes,
      pendientes,
      porcentajeAsistencia: Math.round(porcentajeAsistencia * 100) / 100,
    };
  }

  /**
   * Obtiene estadísticas de asistencia de un evento
   */
  async getEstadisticasByEvento(partidoId = null, entrenamientoId = null) {
    if (partidoId) {
      const query = `
        SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE estado = 'confirmado') as confirmados,
          COUNT(*) FILTER (WHERE estado = 'ausente') as ausentes,
          COUNT(*) FILTER (WHERE estado = 'pendiente') as pendientes
        FROM asistencias_partidos
        WHERE partido_id = $1
      `;
      const result = await this.pool.query(query, [partidoId]);
      const stats = result.rows[0];
      const total = parseInt(stats.total);
      const confirmados = parseInt(stats.confirmados);
      const porcentajeAsistencia = total > 0 ? (confirmados / total) * 100 : 0;

      return {
        total,
        confirmados: parseInt(stats.confirmados),
        ausentes: parseInt(stats.ausentes),
        pendientes: parseInt(stats.pendientes),
        porcentajeAsistencia: Math.round(porcentajeAsistencia * 100) / 100,
      };
    }

    if (entrenamientoId) {
      const query = `
        SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE estado = 'confirmado') as confirmados,
          COUNT(*) FILTER (WHERE estado = 'ausente') as ausentes,
          COUNT(*) FILTER (WHERE estado = 'pendiente') as pendientes
        FROM asistencias_entrenamientos
        WHERE entrenamiento_id = $1
      `;
      const result = await this.pool.query(query, [entrenamientoId]);
      const stats = result.rows[0];
      const total = parseInt(stats.total);
      const confirmados = parseInt(stats.confirmados);
      const porcentajeAsistencia = total > 0 ? (confirmados / total) * 100 : 0;

      return {
        total,
        confirmados: parseInt(stats.confirmados),
        ausentes: parseInt(stats.ausentes),
        pendientes: parseInt(stats.pendientes),
        porcentajeAsistencia: Math.round(porcentajeAsistencia * 100) / 100,
      };
    }

    return {
      total: 0,
      confirmados: 0,
      ausentes: 0,
      pendientes: 0,
      porcentajeAsistencia: 0,
    };
  }

  /**
   * Elimina una asistencia
   */
  async delete(id) {
    // Intentar eliminar de asistencias_partidos
    let query = "DELETE FROM asistencias_partidos WHERE id = $1";
    let result = await this.pool.query(query, [id]);

    if (result.rowCount > 0) {
      return true;
    }

    // Intentar eliminar de asistencias_entrenamientos
    query = "DELETE FROM asistencias_entrenamientos WHERE id = $1";
    result = await this.pool.query(query, [id]);

    return result.rowCount > 0;
  }

  /**
   * Registra asistencias para múltiples jugadores a un evento
   */
  async registrarMasivo(asistencias) {
    const registradas = [];

    for (const asistencia of asistencias) {
      const registrada = await this.registrar(asistencia);
      registradas.push(registrada);
    }

    return registradas;
  }

  /**
   * Verifica si existe una asistencia para un jugador en un evento
   */
  async existe(jugadorId, partidoId = null, entrenamientoId = null) {
    if (partidoId) {
      const query =
        "SELECT COUNT(*) FROM asistencias_partidos WHERE jugador_id = $1 AND partido_id = $2";
      const result = await this.pool.query(query, [jugadorId, partidoId]);
      return parseInt(result.rows[0].count) > 0;
    }

    if (entrenamientoId) {
      const query =
        "SELECT COUNT(*) FROM asistencias_entrenamientos WHERE jugador_id = $1 AND entrenamiento_id = $2";
      const result = await this.pool.query(query, [jugadorId, entrenamientoId]);
      return parseInt(result.rows[0].count) > 0;
    }

    return false;
  }

  /**
   * Convierte un registro de BD a objeto de asistencia
   * @private
   */
  _mapToObject(row, esPartido) {
    if (!row) return null;

    const asistencia = {
      id: row.id,
      jugadorId: row.jugador_id,
      estado: row.estado,
      motivoAusenciaId: row.motivo_ausencia_id,
      comentario: row.comentario,
      fechaRespuesta: row.fecha_respuesta,
    };

    if (esPartido) {
      asistencia.partidoId = row.partido_id;
      asistencia.tipoEvento = "partido";
    } else {
      asistencia.entrenamientoId = row.entrenamiento_id;
      asistencia.tipoEvento = "entrenamiento";
    }

    return asistencia;
  }
}
