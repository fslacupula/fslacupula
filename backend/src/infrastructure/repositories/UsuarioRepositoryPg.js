import { Usuario } from "../../domain/entities/Usuario.js";
import { Email } from "../../domain/valueObjects/Email.js";
import { Password } from "../../domain/valueObjects/Password.js";

/**
 * @class UsuarioRepositoryPg
 * @description Implementación PostgreSQL del repositorio de usuarios
 */
export class UsuarioRepositoryPg {
  constructor(pool) {
    if (!pool) {
      throw new Error("pool de base de datos es requerido");
    }
    this.pool = pool;
  }

  /**
   * Convierte un registro de BD a entidad Usuario
   * @private
   */
  _mapToEntity(row) {
    if (!row) return null;

    return Usuario.fromDatabase({
      id: row.id,
      email: row.email,
      password: row.password,
      nombre: row.nombre,
      rol: row.rol,
      activo: row.activo,
      createdAt: row.created_at,
    });
  }

  /**
   * Busca un usuario por su ID
   */
  async findById(id) {
    const query = "SELECT * FROM usuarios WHERE id = $1";
    const result = await this.pool.query(query, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    return this._mapToEntity(result.rows[0]);
  }

  /**
   * Busca un usuario por su email
   */
  async findByEmail(email) {
    const emailValue = email instanceof Email ? email.value : email;
    const query = "SELECT * FROM usuarios WHERE email = $1";
    const result = await this.pool.query(query, [emailValue]);

    if (result.rows.length === 0) {
      return null;
    }

    return this._mapToEntity(result.rows[0]);
  }

  /**
   * Obtiene todos los usuarios
   */
  async findAll(filters = {}) {
    let query = "SELECT * FROM usuarios WHERE 1=1";
    const params = [];
    let paramCount = 1;

    if (filters.rol !== undefined) {
      query += ` AND rol = $${paramCount}`;
      params.push(filters.rol);
      paramCount++;
    }

    if (filters.activo !== undefined) {
      query += ` AND activo = $${paramCount}`;
      params.push(filters.activo);
      paramCount++;
    }

    query += " ORDER BY created_at DESC";

    const result = await this.pool.query(query, params);
    return result.rows.map((row) => this._mapToEntity(row));
  }

  /**
   * Obtiene usuarios con paginación
   */
  async findPaginated(page, limit, filters = {}) {
    let baseQuery = "SELECT * FROM usuarios WHERE 1=1";
    let countQuery = "SELECT COUNT(*) FROM usuarios WHERE 1=1";
    const params = [];
    let paramCount = 1;

    // Aplicar filtros
    if (filters.rol !== undefined) {
      const filterClause = ` AND rol = $${paramCount}`;
      baseQuery += filterClause;
      countQuery += filterClause;
      params.push(filters.rol);
      paramCount++;
    }

    if (filters.activo !== undefined) {
      const filterClause = ` AND activo = $${paramCount}`;
      baseQuery += filterClause;
      countQuery += filterClause;
      params.push(filters.activo);
      paramCount++;
    }

    // Obtener total
    const countResult = await this.pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    // Calcular offset
    const offset = (page - 1) * limit;

    // Obtener datos paginados
    baseQuery += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${
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
   * Crea un nuevo usuario
   */
  async create(usuario) {
    const usuarioObj = usuario.toObject();

    const query = `
      INSERT INTO usuarios (email, password, nombre, rol, activo)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const params = [
      usuarioObj.email,
      usuarioObj.password,
      usuarioObj.nombre,
      usuarioObj.rol,
      usuarioObj.activo !== undefined ? usuarioObj.activo : true,
    ];

    const result = await this.pool.query(query, params);
    return this._mapToEntity(result.rows[0]);
  }

  /**
   * Actualiza un usuario existente
   */
  async update(id, usuario) {
    const usuarioObj = usuario.toObject();

    const query = `
      UPDATE usuarios
      SET email = $1, password = $2, nombre = $3, rol = $4, activo = $5
      WHERE id = $6
      RETURNING *
    `;

    const params = [
      usuarioObj.email,
      usuarioObj.password,
      usuarioObj.nombre,
      usuarioObj.rol,
      usuarioObj.activo,
      id,
    ];

    const result = await this.pool.query(query, params);

    if (result.rows.length === 0) {
      return null;
    }

    return this._mapToEntity(result.rows[0]);
  }

  /**
   * Elimina un usuario (soft delete - marca como inactivo)
   */
  async delete(id) {
    const query = `
      UPDATE usuarios
      SET activo = false
      WHERE id = $1
      RETURNING *
    `;

    const result = await this.pool.query(query, [id]);
    return result.rows.length > 0;
  }

  /**
   * Elimina permanentemente un usuario (hard delete)
   */
  async hardDelete(id) {
    const query = "DELETE FROM usuarios WHERE id = $1 RETURNING *";
    const result = await this.pool.query(query, [id]);
    return result.rows.length > 0;
  }

  /**
   * Verifica si existe un usuario con el email dado
   */
  async existsByEmail(email, excludeId = null) {
    const emailValue = email instanceof Email ? email.value : email;

    let query = "SELECT COUNT(*) FROM usuarios WHERE email = $1";
    const params = [emailValue];

    if (excludeId !== null) {
      query += " AND id != $2";
      params.push(excludeId);
    }

    const result = await this.pool.query(query, params);
    return parseInt(result.rows[0].count) > 0;
  }

  /**
   * Obtiene la cantidad total de usuarios
   */
  async count(filters = {}) {
    let query = "SELECT COUNT(*) FROM usuarios WHERE 1=1";
    const params = [];
    let paramCount = 1;

    if (filters.rol !== undefined) {
      query += ` AND rol = $${paramCount}`;
      params.push(filters.rol);
      paramCount++;
    }

    if (filters.activo !== undefined) {
      query += ` AND activo = $${paramCount}`;
      params.push(filters.activo);
      paramCount++;
    }

    const result = await this.pool.query(query, params);
    return parseInt(result.rows[0].count);
  }

  /**
   * Busca usuarios por rol
   */
  async findByRol(rol) {
    const query = "SELECT * FROM usuarios WHERE rol = $1 ORDER BY nombre ASC";
    const result = await this.pool.query(query, [rol]);
    return result.rows.map((row) => this._mapToEntity(row));
  }

  /**
   * Busca usuarios activos
   */
  async findActive() {
    const query =
      "SELECT * FROM usuarios WHERE activo = true ORDER BY nombre ASC";
    const result = await this.pool.query(query);
    return result.rows.map((row) => this._mapToEntity(row));
  }
}
