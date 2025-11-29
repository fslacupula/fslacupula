/**
 * Interfaz del repositorio de Posiciones
 * Define el contrato para el acceso a datos de posiciones
 */
export class IPosicionRepository {
  /**
   * Busca todas las posiciones activas
   * @returns {Promise<Array>} Lista de posiciones
   */
  async findAll() {
    throw new Error("Método findAll() debe ser implementado");
  }

  /**
   * Busca una posición por ID
   * @param {number} id - ID de la posición
   * @returns {Promise<Object|null>} Posición encontrada o null
   */
  async findById(id) {
    throw new Error("Método findById() debe ser implementado");
  }
}
