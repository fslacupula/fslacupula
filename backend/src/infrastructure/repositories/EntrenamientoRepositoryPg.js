import { Entrenamiento } from "../../domain/entities/Entrenamiento.js";

/**
 * @class EntrenamientoRepositoryPg
 * @description Implementación PostgreSQL del repositorio de entrenamientos
 */
export class EntrenamientoRepositoryPg {
  constructor(pool) {
    if (!pool) {
      throw new Error("pool de base de datos es requerido");
    }
    this.pool = pool;
  }

  /**
   * Convierte un registro de BD a entidad Entrenamiento
   * @private
   */
  _mapToEntity(row) {
    if (!row) return null;

    return Entrenamiento.fromDatabase({
      id: row.id,
      fechaHora: row.fecha_hora,
      lugar: row.lugar,
      descripcion: row.descripcion,
      duracionMinutos: row.duracion_minutos,
      creadoPor: row.creado_por,
      createdAt: row.created_at,
    });
  }

  /**
   * Busca un entrenamiento por su ID
   */
  async findById(id) {
    const query = "SELECT * FROM entrenamientos WHERE id = $1";
    const result = await this.pool.query(query, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    return this._mapToEntity(result.rows[0]);
  }

  /**
   * Obtiene un entrenamiento por ID con datos completos de jugadores en asistencias
   */
  async findByIdWithPlayerData(id) {
    const query = "SELECT * FROM entrenamientos WHERE id = $1";
    const result = await this.pool.query(query, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    const entrenamiento = this._mapToEntity(result.rows[0]);

    // Cargar asistencias con datos completos de jugadores
    const asistenciasQuery = `
      SELECT ae.*, u.nombre as jugador_nombre, u.email as jugador_email,
             j.numero_dorsal as dorsal, j.posicion_id, p.nombre as posicion, 
             p.abreviatura, p.color, j.alias, ma.motivo as motivo_nombre
      FROM asistencias_entrenamientos ae
      JOIN usuarios u ON ae.jugador_id = u.id
      LEFT JOIN jugadores j ON u.id = j.usuario_id
      LEFT JOIN posiciones p ON j.posicion_id = p.id
      LEFT JOIN motivos_ausencia ma ON ae.motivo_ausencia_id = ma.id
      WHERE ae.entrenamiento_id = $1
      ORDER BY u.nombre
    `;

    const asistenciasResult = await this.pool.query(asistenciasQuery, [id]);

    // Convertir a objeto y agregar asistencias
    const entrenamientoObj = entrenamiento.toObject();
    entrenamientoObj.asistencias = asistenciasResult.rows;

    return entrenamientoObj;
  }

  /**
   * Obtiene todos los entrenamientos
   */
  async findAll(filters = {}) {
    let query = "SELECT * FROM entrenamientos WHERE 1=1";
    const params = [];
    let paramCount = 1;

    if (filters.lugar !== undefined) {
      query += ` AND lugar ILIKE $${paramCount}`;
      params.push(`%${filters.lugar}%`);
      paramCount++;
    }

    if (filters.fechaDesde !== undefined) {
      query += ` AND fecha_hora >= $${paramCount}`;
      params.push(filters.fechaDesde);
      paramCount++;
    }

    if (filters.fechaHasta !== undefined) {
      query += ` AND fecha_hora <= $${paramCount}`;
      params.push(filters.fechaHasta);
      paramCount++;
    }

    query += " ORDER BY fecha_hora DESC";

    const result = await this.pool.query(query, params);
    return result.rows.map((row) => this._mapToEntity(row));
  }

  /**
   * Obtiene entrenamientos con paginación
   */
  async findPaginated(page, limit, filters = {}) {
    let baseQuery = "SELECT * FROM entrenamientos WHERE 1=1";
    let countQuery = "SELECT COUNT(*) FROM entrenamientos WHERE 1=1";
    const params = [];
    let paramCount = 1;

    // Aplicar filtros
    if (filters.lugar !== undefined) {
      const filterClause = ` AND lugar ILIKE $${paramCount}`;
      baseQuery += filterClause;
      countQuery += filterClause;
      params.push(`%${filters.lugar}%`);
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
   * Crea un nuevo entrenamiento
   */
  async create(entrenamiento) {
    const entrenamientoObj = entrenamiento.toObject();

    const query = `
      INSERT INTO entrenamientos (
        fecha_hora, lugar, descripcion, duracion_minutos, creado_por
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const params = [
      entrenamientoObj.fechaHora,
      entrenamientoObj.lugar,
      entrenamientoObj.descripcion || null,
      entrenamientoObj.duracionMinutos || 90,
      entrenamientoObj.creadoPor,
    ];

    const result = await this.pool.query(query, params);
    return this._mapToEntity(result.rows[0]);
  }

  /**
   * Actualiza un entrenamiento existente
   */
  async update(id, entrenamiento) {
    const entrenamientoObj = entrenamiento.toObject();

    const query = `
      UPDATE entrenamientos
      SET fecha_hora = $1, lugar = $2, descripcion = $3, duracion_minutos = $4
      WHERE id = $5
      RETURNING *
    `;

    const params = [
      entrenamientoObj.fechaHora,
      entrenamientoObj.lugar,
      entrenamientoObj.descripcion || null,
      entrenamientoObj.duracionMinutos,
      id,
    ];

    const result = await this.pool.query(query, params);

    if (result.rows.length === 0) {
      return null;
    }

    return this._mapToEntity(result.rows[0]);
  }

  /**
   * Elimina un entrenamiento
   */
  async delete(id) {
    const query = "DELETE FROM entrenamientos WHERE id = $1 RETURNING *";
    const result = await this.pool.query(query, [id]);
    return result.rows.length > 0;
  }

  /**
   * Obtiene entrenamientos futuros (próximos)
   */
  async findUpcoming(limit = null) {
    let query =
      "SELECT * FROM entrenamientos WHERE fecha_hora > NOW() ORDER BY fecha_hora ASC";

    if (limit) {
      query += ` LIMIT $1`;
      const result = await this.pool.query(query, [limit]);
      return result.rows.map((row) => this._mapToEntity(row));
    }

    const result = await this.pool.query(query);
    return result.rows.map((row) => this._mapToEntity(row));
  }

  /**
   * Obtiene el próximo entrenamiento
   */
  async getNext() {
    const query =
      "SELECT * FROM entrenamientos WHERE fecha_hora > NOW() ORDER BY fecha_hora ASC LIMIT 1";
    const result = await this.pool.query(query);

    if (result.rows.length === 0) {
      return null;
    }

    return this._mapToEntity(result.rows[0]);
  }

  /**
   * Obtiene entrenamientos de hoy
   */
  async findToday() {
    const query = `
      SELECT * FROM entrenamientos
      WHERE DATE(fecha_hora AT TIME ZONE 'Europe/Madrid') = CURRENT_DATE
      ORDER BY fecha_hora ASC
    `;
    const result = await this.pool.query(query);
    return result.rows.map((row) => this._mapToEntity(row));
  }

  /**
   * Obtiene entrenamientos de esta semana
   */
  async findThisWeek() {
    const query = `
      SELECT * FROM entrenamientos
      WHERE fecha_hora >= DATE_TRUNC('week', CURRENT_DATE)
        AND fecha_hora < DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '7 days'
      ORDER BY fecha_hora ASC
    `;
    const result = await this.pool.query(query);
    return result.rows.map((row) => this._mapToEntity(row));
  }

  /**
   * Obtiene entrenamientos por rango de fechas
   */
  async findByDateRange(fechaInicio, fechaFin) {
    const query =
      "SELECT * FROM entrenamientos WHERE fecha_hora >= $1 AND fecha_hora <= $2 ORDER BY fecha_hora ASC";
    const result = await this.pool.query(query, [fechaInicio, fechaFin]);
    return result.rows.map((row) => this._mapToEntity(row));
  }

  /**
   * Obtiene entrenamientos por lugar
   */
  async findByLugar(lugar) {
    const query =
      "SELECT * FROM entrenamientos WHERE lugar ILIKE $1 ORDER BY fecha_hora DESC";
    const result = await this.pool.query(query, [`%${lugar}%`]);
    return result.rows.map((row) => this._mapToEntity(row));
  }

  /**
   * Obtiene la cantidad total de entrenamientos
   */
  async count(filters = {}) {
    let query = "SELECT COUNT(*) FROM entrenamientos WHERE 1=1";
    const params = [];
    let paramCount = 1;

    if (filters.lugar !== undefined) {
      query += ` AND lugar ILIKE $${paramCount}`;
      params.push(`%${filters.lugar}%`);
      paramCount++;
    }

    const result = await this.pool.query(query, params);
    return parseInt(result.rows[0].count);
  }
}
