import { Jugador } from "../../domain/entities/Jugador.js";

/**
 * @class JugadorRepositoryPg
 * @description Implementación PostgreSQL del repositorio de jugadores
 */
export class JugadorRepositoryPg {
  constructor(pool) {
    if (!pool) {
      throw new Error("pool de base de datos es requerido");
    }
    this.pool = pool;
  }

  /**
   * Convierte un registro de BD a entidad Jugador
   * @private
   */
  _mapToEntity(row) {
    if (!row) return null;

    return Jugador.fromDatabase({
      id: row.id,
      usuarioId: row.usuario_id,
      numeroDorsal: row.numero_dorsal,
      posicion: row.posicion,
      telefono: row.telefono,
      fechaNacimiento: row.fecha_nacimiento,
      fotoUrl: row.foto_url,
      alias: row.alias,
      posicionId: row.posicion_id,
      createdAt: row.created_at,
    });
  }

  /**
   * Convierte un registro de BD con JOIN de usuarios a objeto plano
   * @private
   */
  _mapToEntityWithUser(row) {
    if (!row) return null;

    const jugador = this._mapToEntity(row);

    // Convertir a objeto plano y añadir datos del usuario y posición
    return {
      id: row.id,
      usuarioId: row.usuario_id,
      numeroDorsal: row.numero_dorsal,
      posicionId: row.posicion_id,
      telefono: row.telefono,
      fechaNacimiento: row.fecha_nacimiento,
      alias: row.alias,
      fotoUrl: row.foto_url,
      createdAt: row.created_at,
      // Datos del usuario
      nombre: row.nombre,
      email: row.email,
      activo: row.activo,
      // Datos de la posición
      posicion: row.posicion_nombre,
      abreviatura: row.posicion_abreviatura,
      color: row.posicion_color,
    };
  }

  /**
   * Busca un jugador por su ID
   */
  async findById(id) {
    const query = "SELECT * FROM jugadores WHERE id = $1";
    const result = await this.pool.query(query, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    return this._mapToEntity(result.rows[0]);
  }

  /**
   * Busca un jugador por el ID del usuario asociado
   */
  async findByUsuarioId(usuarioId) {
    const query = "SELECT * FROM jugadores WHERE usuario_id = $1";
    const result = await this.pool.query(query, [usuarioId]);

    if (result.rows.length === 0) {
      return null;
    }

    return this._mapToEntity(result.rows[0]);
  }

  /**
   * Obtiene todos los jugadores
   */
  async findAll(filters = {}) {
    let query = `
      SELECT 
        j.*,
        u.nombre,
        u.email,
        u.activo,
        p.nombre as posicion_nombre,
        p.abreviatura as posicion_abreviatura,
        p.color as posicion_color
      FROM jugadores j
      LEFT JOIN usuarios u ON j.usuario_id = u.id
      LEFT JOIN posiciones p ON j.posicion_id = p.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (filters.posicion !== undefined) {
      query += ` AND j.posicion = $${paramCount}`;
      params.push(filters.posicion);
      paramCount++;
    }

    if (filters.numeroDorsal !== undefined) {
      query += ` AND j.numero_dorsal = $${paramCount}`;
      params.push(filters.numeroDorsal);
      paramCount++;
    }

    if (filters.posicionId !== undefined) {
      query += ` AND j.posicion_id = $${paramCount}`;
      params.push(filters.posicionId);
      paramCount++;
    }

    query += " ORDER BY j.numero_dorsal ASC NULLS LAST, j.created_at DESC";

    const result = await this.pool.query(query, params);
    return result.rows.map((row) => this._mapToEntityWithUser(row));
  }

  /**
   * Obtiene jugadores con paginación
   */
  async findPaginated(page, limit, filters = {}) {
    let baseQuery = "SELECT * FROM jugadores WHERE 1=1";
    let countQuery = "SELECT COUNT(*) FROM jugadores WHERE 1=1";
    const params = [];
    let paramCount = 1;

    // Aplicar filtros
    if (filters.posicion !== undefined) {
      const filterClause = ` AND posicion = $${paramCount}`;
      baseQuery += filterClause;
      countQuery += filterClause;
      params.push(filters.posicion);
      paramCount++;
    }

    if (filters.numeroDorsal !== undefined) {
      const filterClause = ` AND numero_dorsal = $${paramCount}`;
      baseQuery += filterClause;
      countQuery += filterClause;
      params.push(filters.numeroDorsal);
      paramCount++;
    }

    if (filters.posicionId !== undefined) {
      const filterClause = ` AND posicion_id = $${paramCount}`;
      baseQuery += filterClause;
      countQuery += filterClause;
      params.push(filters.posicionId);
      paramCount++;
    }

    // Obtener total
    const countResult = await this.pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    // Calcular offset
    const offset = (page - 1) * limit;

    // Obtener datos paginados
    baseQuery += ` ORDER BY numero_dorsal ASC NULLS LAST, created_at DESC LIMIT $${paramCount} OFFSET $${
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
   * Busca un jugador por número de dorsal
   */
  async findByNumeroDorsal(numeroDorsal) {
    const query = "SELECT * FROM jugadores WHERE numero_dorsal = $1";
    const result = await this.pool.query(query, [numeroDorsal]);

    if (result.rows.length === 0) {
      return null;
    }

    return this._mapToEntity(result.rows[0]);
  }

  /**
   * Obtiene jugadores por posición
   */
  async findByPosicion(posicion) {
    const query =
      "SELECT * FROM jugadores WHERE posicion = $1 ORDER BY numero_dorsal ASC NULLS LAST";
    const result = await this.pool.query(query, [posicion]);
    return result.rows.map((row) => this._mapToEntity(row));
  }

  /**
   * Crea un nuevo jugador
   */
  async create(jugador) {
    const jugadorObj = jugador.toObject();

    const query = `
      INSERT INTO jugadores (
        usuario_id, numero_dorsal, posicion, telefono,
        fecha_nacimiento, foto_url, alias, posicion_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const params = [
      jugadorObj.usuarioId,
      jugadorObj.numeroDorsal || null,
      jugadorObj.posicion || null,
      jugadorObj.telefono || null,
      jugadorObj.fechaNacimiento || null,
      jugadorObj.fotoUrl || null,
      jugadorObj.alias || null,
      jugadorObj.posicionId || null,
    ];

    const result = await this.pool.query(query, params);
    return this._mapToEntity(result.rows[0]);
  }

  /**
   * Actualiza un jugador existente
   */
  async update(id, jugador) {
    const jugadorObj = jugador.toObject();

    const query = `
      UPDATE jugadores
      SET usuario_id = $1, numero_dorsal = $2, posicion = $3, telefono = $4,
          fecha_nacimiento = $5, foto_url = $6, alias = $7, posicion_id = $8
      WHERE id = $9
      RETURNING *
    `;

    const params = [
      jugadorObj.usuarioId,
      jugadorObj.numeroDorsal || null,
      jugadorObj.posicion || null,
      jugadorObj.telefono || null,
      jugadorObj.fechaNacimiento || null,
      jugadorObj.fotoUrl || null,
      jugadorObj.alias || null,
      jugadorObj.posicionId || null,
      id,
    ];

    const result = await this.pool.query(query, params);

    if (result.rows.length === 0) {
      return null;
    }

    return this._mapToEntity(result.rows[0]);
  }

  /**
   * Elimina un jugador
   */
  async delete(id) {
    const query = "DELETE FROM jugadores WHERE id = $1 RETURNING *";
    const result = await this.pool.query(query, [id]);
    return result.rows.length > 0;
  }

  /**
   * Verifica si existe un jugador con el usuario ID dado
   */
  async existsByUsuarioId(usuarioId, excludeId = null) {
    let query = "SELECT COUNT(*) FROM jugadores WHERE usuario_id = $1";
    const params = [usuarioId];

    if (excludeId !== null) {
      query += " AND id != $2";
      params.push(excludeId);
    }

    const result = await this.pool.query(query, params);
    return parseInt(result.rows[0].count) > 0;
  }

  /**
   * Verifica si existe un jugador con el número de dorsal dado
   */
  async existsByNumeroDorsal(numeroDorsal, excludeId = null) {
    let query = "SELECT COUNT(*) FROM jugadores WHERE numero_dorsal = $1";
    const params = [numeroDorsal];

    if (excludeId !== null) {
      query += " AND id != $2";
      params.push(excludeId);
    }

    const result = await this.pool.query(query, params);
    return parseInt(result.rows[0].count) > 0;
  }

  /**
   * Obtiene la cantidad total de jugadores
   */
  async count(filters = {}) {
    let query = "SELECT COUNT(*) FROM jugadores WHERE 1=1";
    const params = [];
    let paramCount = 1;

    if (filters.posicion !== undefined) {
      query += ` AND posicion = $${paramCount}`;
      params.push(filters.posicion);
      paramCount++;
    }

    if (filters.posicionId !== undefined) {
      query += ` AND posicion_id = $${paramCount}`;
      params.push(filters.posicionId);
      paramCount++;
    }

    const result = await this.pool.query(query, params);
    return parseInt(result.rows[0].count);
  }
}
