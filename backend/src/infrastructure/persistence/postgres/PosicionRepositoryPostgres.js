import { pool } from "../../../../config/database.js";

/**
 * Implementación PostgreSQL del repositorio de Posiciones
 */
export class PosicionRepositoryPostgres {
  /**
   * Busca todas las posiciones activas
   * @returns {Promise<Array>} Lista de posiciones
   */
  async findAll() {
    const query = `
      SELECT 
        id,
        nombre,
        abreviatura,
        color,
        orden,
        activo
      FROM posiciones
      WHERE activo = true
      ORDER BY orden ASC, nombre ASC
    `;

    const result = await pool.query(query);
    return result.rows;
  }

  /**
   * Busca una posición por ID
   * @param {number} id - ID de la posición
   * @returns {Promise<Object|null>} Posición encontrada o null
   */
  async findById(id) {
    const query = `
      SELECT 
        id,
        nombre,
        abreviatura,
        color,
        orden,
        activo
      FROM posiciones
      WHERE id = $1
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }
}
