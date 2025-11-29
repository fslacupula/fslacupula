import { pool } from "../../../../config/database.js";

/**
 * Implementación PostgreSQL del repositorio de Motivos de Ausencia
 */
export class MotivoAusenciaRepositoryPostgres {
  /**
   * Busca todos los motivos activos
   * @returns {Promise<Array>} Lista de motivos
   */
  async findAll() {
    const query = `
      SELECT 
        id,
        motivo,
        activo,
        created_at
      FROM motivos_ausencia
      WHERE activo = true
      ORDER BY motivo ASC
    `;

    const result = await pool.query(query);
    return result.rows;
  }

  /**
   * Busca un motivo por ID
   * @param {number} id - ID del motivo
   * @returns {Promise<Object|null>} Motivo encontrado o null
   */
  async findById(id) {
    const query = `
      SELECT 
        id,
        motivo,
        activo,
        created_at
      FROM motivos_ausencia
      WHERE id = $1
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }
}
