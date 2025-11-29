/**
 * Interfaz del repositorio de Motivos de Ausencia
 * Define el contrato para el acceso a datos de motivos
 */
export class IMotivoAusenciaRepository {
  /**
   * Busca todos los motivos activos
   * @returns {Promise<Array>} Lista de motivos
   */
  async findAll() {
    throw new Error("Método findAll() debe ser implementado");
  }

  /**
   * Busca un motivo por ID
   * @param {number} id - ID del motivo
   * @returns {Promise<Object|null>} Motivo encontrado o null
   */
  async findById(id) {
    throw new Error("Método findById() debe ser implementado");
  }
}
