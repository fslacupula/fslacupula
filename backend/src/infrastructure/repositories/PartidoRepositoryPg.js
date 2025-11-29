import { Partido } from "../../domain/entities/Partido.js";

/**
 * @class PartidoRepositoryPg
 * @description Implementación PostgreSQL del repositorio de partidos
 */
export class PartidoRepositoryPg {
  constructor(pool) {
    if (!pool) {
      throw new Error("pool de base de datos es requerido");
    }
    this.pool = pool;
  }

  /**
   * Convierte un registro de BD a entidad Partido
   * @private
   */
  _mapToEntity(row) {
    if (!row) return null;

    return Partido.fromDatabase({
      id: row.id,
      fechaHora: row.fecha_hora,
      rival: row.rival,
      lugar: row.lugar,
      tipo: row.tipo,
      esLocal: row.es_local,
      resultado: row.resultado,
      observaciones: row.observaciones,
      creadoPor: row.creado_por,
      createdAt: row.created_at,
      estado: row.estado,
    });
  }

  /**
   * Busca un partido por su ID
   */
  async findById(id) {
    const query = "SELECT * FROM partidos WHERE id = $1";
    const result = await this.pool.query(query, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    return this._mapToEntity(result.rows[0]);
  }

  /**
   * Busca un partido por su ID con datos completos de jugadores en asistencias
   */
  async findByIdWithPlayerData(id) {
    const query = "SELECT * FROM partidos WHERE id = $1";
    const result = await this.pool.query(query, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    const partido = this._mapToEntity(result.rows[0]);

    // Cargar asistencias con datos completos de jugadores
    const asistenciasQuery = `
      SELECT ap.*, u.nombre as jugador_nombre, u.email as jugador_email,
             j.numero_dorsal as dorsal, j.posicion_id, p.nombre as posicion, 
             p.abreviatura, p.color, j.alias, ma.motivo as motivo_nombre
      FROM asistencias_partidos ap
      JOIN usuarios u ON ap.jugador_id = u.id
      LEFT JOIN jugadores j ON u.id = j.usuario_id
      LEFT JOIN posiciones p ON j.posicion_id = p.id
      LEFT JOIN motivos_ausencia ma ON ap.motivo_ausencia_id = ma.id
      WHERE ap.partido_id = $1
      ORDER BY u.nombre
    `;

    const asistenciasResult = await this.pool.query(asistenciasQuery, [id]);

    // Convertir a objeto y agregar asistencias
    const partidoObj = partido.toObject();
    partidoObj.asistencias = asistenciasResult.rows;

    return partidoObj;
  }

  /**
   * Obtiene todos los partidos
   */
  async findAll(filters = {}) {
    let query = "SELECT * FROM partidos WHERE 1=1";
    const params = [];
    let paramCount = 1;

    if (filters.tipo !== undefined) {
      query += ` AND tipo = $${paramCount}`;
      params.push(filters.tipo);
      paramCount++;
    }

    if (filters.esLocal !== undefined) {
      query += ` AND es_local = $${paramCount}`;
      params.push(filters.esLocal);
      paramCount++;
    }

    if (filters.rival !== undefined) {
      query += ` AND rival ILIKE $${paramCount}`;
      params.push(`%${filters.rival}%`);
      paramCount++;
    }

    query += " ORDER BY fecha_hora DESC";

    const result = await this.pool.query(query, params);
    return result.rows.map((row) => this._mapToEntity(row));
  }

  /**
   * Obtiene partidos con paginación
   */
  async findPaginated(page, limit, filters = {}) {
    let baseQuery = "SELECT * FROM partidos WHERE 1=1";
    let countQuery = "SELECT COUNT(*) FROM partidos WHERE 1=1";
    const params = [];
    let paramCount = 1;

    // Aplicar filtros
    if (filters.tipo !== undefined) {
      const filterClause = ` AND tipo = $${paramCount}`;
      baseQuery += filterClause;
      countQuery += filterClause;
      params.push(filters.tipo);
      paramCount++;
    }

    if (filters.esLocal !== undefined) {
      const filterClause = ` AND es_local = $${paramCount}`;
      baseQuery += filterClause;
      countQuery += filterClause;
      params.push(filters.esLocal);
      paramCount++;
    }

    if (filters.rival !== undefined) {
      const filterClause = ` AND rival ILIKE $${paramCount}`;
      baseQuery += filterClause;
      countQuery += filterClause;
      params.push(`%${filters.rival}%`);
      paramCount++;
    }

    if (filters.fechaDesde !== undefined) {
      const filterClause = ` AND fecha_hora >= $${paramCount}`;
      baseQuery += filterClause;
      countQuery += filterClause;
      params.push(filters.fechaDesde);
      paramCount++;
    }

    if (filters.fechaHasta !== undefined) {
      const filterClause = ` AND fecha_hora <= $${paramCount}`;
      baseQuery += filterClause;
      countQuery += filterClause;
      params.push(filters.fechaHasta);
      paramCount++;
    }

    // Obtener total
    const countResult = await this.pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    // Calcular offset
    const offset = (page - 1) * limit;

    // Obtener datos paginados
    baseQuery += ` ORDER BY fecha_hora DESC LIMIT $${paramCount} OFFSET $${
      paramCount + 1
    }`;
    const dataParams = [...params, limit, offset];
    const result = await this.pool.query(baseQuery, dataParams);

    const data = result.rows.map((row) => this._mapToEntity(row));
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      totalPages,
    };
  }

  /**
   * Crea un nuevo partido
   */
  async create(partido) {
    const partidoObj = partido.toObject();

    const query = `
      INSERT INTO partidos (
        fecha_hora, rival, lugar, tipo, es_local,
        resultado, observaciones, creado_por
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const params = [
      partidoObj.fechaHora,
      partidoObj.rival,
      partidoObj.lugar,
      partidoObj.tipo || null,
      partidoObj.esLocal !== undefined ? partidoObj.esLocal : true,
      partidoObj.resultado || null,
      partidoObj.observaciones || null,
      partidoObj.creadoPor,
    ];

    const result = await this.pool.query(query, params);
    return this._mapToEntity(result.rows[0]);
  }

  /**
   * Actualiza un partido existente
   */
  async update(id, partido) {
    const partidoObj = partido.toObject();

    const query = `
      UPDATE partidos
      SET fecha_hora = $1, rival = $2, lugar = $3, tipo = $4,
          es_local = $5, resultado = $6, observaciones = $7
      WHERE id = $8
      RETURNING *
    `;

    const params = [
      partidoObj.fechaHora,
      partidoObj.rival,
      partidoObj.lugar,
      partidoObj.tipo || null,
      partidoObj.esLocal,
      partidoObj.resultado || null,
      partidoObj.observaciones || null,
      id,
    ];

    const result = await this.pool.query(query, params);

    if (result.rows.length === 0) {
      return null;
    }

    return this._mapToEntity(result.rows[0]);
  }

  /**
   * Elimina un partido
   */
  async delete(id) {
    const query = "DELETE FROM partidos WHERE id = $1 RETURNING *";
    const result = await this.pool.query(query, [id]);
    return result.rows.length > 0;
  }

  /**
   * Obtiene partidos futuros (próximos)
   */
  async findUpcoming(limit = null) {
    let query =
      "SELECT * FROM partidos WHERE fecha_hora > NOW() ORDER BY fecha_hora ASC";

    if (limit) {
      query += ` LIMIT $1`;
      const result = await this.pool.query(query, [limit]);
      return result.rows.map((row) => this._mapToEntity(row));
    }

    const result = await this.pool.query(query);
    return result.rows.map((row) => this._mapToEntity(row));
  }

  /**
   * Obtiene el próximo partido
   */
  async getNext() {
    const query =
      "SELECT * FROM partidos WHERE fecha_hora > NOW() ORDER BY fecha_hora ASC LIMIT 1";
    const result = await this.pool.query(query);

    if (result.rows.length === 0) {
      return null;
    }

    return this._mapToEntity(result.rows[0]);
  }

  /**
   * Obtiene partidos por rango de fechas
   */
  async findByDateRange(fechaInicio, fechaFin) {
    const query =
      "SELECT * FROM partidos WHERE fecha_hora >= $1 AND fecha_hora <= $2 ORDER BY fecha_hora ASC";
    const result = await this.pool.query(query, [fechaInicio, fechaFin]);
    return result.rows.map((row) => this._mapToEntity(row));
  }

  /**
   * Obtiene la cantidad total de partidos
   */
  async count(filters = {}) {
    let query = "SELECT COUNT(*) FROM partidos WHERE 1=1";
    const params = [];
    let paramCount = 1;

    if (filters.tipo !== undefined) {
      query += ` AND tipo = $${paramCount}`;
      params.push(filters.tipo);
      paramCount++;
    }

    if (filters.esLocal !== undefined) {
      query += ` AND es_local = $${paramCount}`;
      params.push(filters.esLocal);
      paramCount++;
    }

    const result = await this.pool.query(query, params);
    return parseInt(result.rows[0].count);
  }
}
