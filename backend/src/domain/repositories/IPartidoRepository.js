/**
 * Interface: IPartidoRepository
 *
 * Define el contrato para el repositorio de Partidos.
 * Esta interfaz pertenece a la capa de dominio y debe ser implementada
 * por la capa de infraestructura.
 */
export class IPartidoRepository {
  /**
   * Busca un partido por su ID
   * @param {string|number} id - ID del partido
   * @returns {Promise<Partido|null>} Partido encontrado o null
   */
  async findById(id) {
    throw new Error("Method findById() must be implemented");
  }

  /**
   * Obtiene todos los partidos
   * @param {Object} filters - Filtros opcionales
   * @param {string} filters.tipo - Filtrar por tipo ('liga', 'amistoso', 'copa', 'torneo')
   * @param {Date} filters.fechaDesde - Filtrar desde fecha
   * @param {Date} filters.fechaHasta - Filtrar hasta fecha
   * @param {boolean} filters.conResultado - Filtrar partidos con/sin resultado
   * @returns {Promise<Partido[]>} Lista de partidos
   */
  async findAll(filters = {}) {
    throw new Error("Method findAll() must be implemented");
  }

  /**
   * Obtiene partidos con paginación
   * @param {number} page - Número de página (empezando en 1)
   * @param {number} limit - Cantidad de resultados por página
   * @param {Object} filters - Filtros opcionales
   * @returns {Promise<{data: Partido[], total: number, page: number, totalPages: number}>}
   */
  async findPaginated(page, limit, filters = {}) {
    throw new Error("Method findPaginated() must be implemented");
  }

  /**
   * Obtiene partidos por tipo
   * @param {string} tipo - Tipo de partido ('liga', 'amistoso', 'copa', 'torneo')
   * @returns {Promise<Partido[]>} Lista de partidos
   */
  async findByTipo(tipo) {
    throw new Error("Method findByTipo() must be implemented");
  }

  /**
   * Obtiene partidos en un rango de fechas
   * @param {Date} fechaInicio - Fecha de inicio
   * @param {Date} fechaFin - Fecha de fin
   * @returns {Promise<Partido[]>} Lista de partidos
   */
  async findByDateRange(fechaInicio, fechaFin) {
    throw new Error("Method findByDateRange() must be implemented");
  }

  /**
   * Obtiene partidos futuros (próximos)
   * @param {number} limit - Cantidad máxima de resultados (opcional)
   * @returns {Promise<Partido[]>} Lista de partidos ordenados por fecha
   */
  async findUpcoming(limit = null) {
    throw new Error("Method findUpcoming() must be implemented");
  }

  /**
   * Obtiene partidos pasados (histórico)
   * @param {number} limit - Cantidad máxima de resultados (opcional)
   * @returns {Promise<Partido[]>} Lista de partidos ordenados por fecha descendente
   */
  async findPast(limit = null) {
    throw new Error("Method findPast() must be implemented");
  }

  /**
   * Obtiene partidos con resultado
   * @returns {Promise<Partido[]>} Lista de partidos finalizados
   */
  async findWithResult() {
    throw new Error("Method findWithResult() must be implemented");
  }

  /**
   * Obtiene partidos sin resultado (pendientes)
   * @returns {Promise<Partido[]>} Lista de partidos sin finalizar
   */
  async findWithoutResult() {
    throw new Error("Method findWithoutResult() must be implemented");
  }

  /**
   * Busca partidos por rival
   * @param {string} rival - Nombre del rival
   * @returns {Promise<Partido[]>} Lista de partidos contra ese rival
   */
  async findByRival(rival) {
    throw new Error("Method findByRival() must be implemented");
  }

  /**
   * Busca partidos por lugar
   * @param {string} lugar - Lugar del partido
   * @returns {Promise<Partido[]>} Lista de partidos en ese lugar
   */
  async findByLugar(lugar) {
    throw new Error("Method findByLugar() must be implemented");
  }

  /**
   * Crea un nuevo partido
   * @param {Partido} partido - Entidad Partido a crear
   * @returns {Promise<Partido>} Partido creado con ID asignado
   */
  async create(partido) {
    throw new Error("Method create() must be implemented");
  }

  /**
   * Actualiza un partido existente
   * @param {string|number} id - ID del partido
   * @param {Partido} partido - Entidad Partido con datos actualizados
   * @returns {Promise<Partido>} Partido actualizado
   */
  async update(id, partido) {
    throw new Error("Method update() must be implemented");
  }

  /**
   * Elimina un partido
   * @param {string|number} id - ID del partido
   * @returns {Promise<boolean>} true si se eliminó correctamente
   */
  async delete(id) {
    throw new Error("Method delete() must be implemented");
  }

  /**
   * Cuenta el total de partidos
   * @param {Object} filters - Filtros opcionales
   * @returns {Promise<number>} Cantidad de partidos
   */
  async count(filters = {}) {
    throw new Error("Method count() must be implemented");
  }

  /**
   * Obtiene estadísticas de partidos
   * @returns {Promise<{total: number, ganados: number, empatados: number, perdidos: number, sinResultado: number}>}
   */
  async getStats() {
    throw new Error("Method getStats() must be implemented");
  }

  /**
   * Obtiene estadísticas por tipo de partido
   * @returns {Promise<Array<{tipo: string, total: number, ganados: number, empatados: number, perdidos: number}>>}
   */
  async getStatsByTipo() {
    throw new Error("Method getStatsByTipo() must be implemented");
  }

  /**
   * Obtiene el próximo partido
   * @returns {Promise<Partido|null>} Próximo partido o null
   */
  async getNext() {
    throw new Error("Method getNext() must be implemented");
  }

  /**
   * Obtiene el último partido jugado
   * @returns {Promise<Partido|null>} Último partido o null
   */
  async getLast() {
    throw new Error("Method getLast() must be implemented");
  }
}
