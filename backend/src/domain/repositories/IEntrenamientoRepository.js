/**
 * Interface: IEntrenamientoRepository
 *
 * Define el contrato para el repositorio de Entrenamientos.
 * Esta interfaz pertenece a la capa de dominio y debe ser implementada
 * por la capa de infraestructura.
 */
export class IEntrenamientoRepository {
  /**
   * Busca un entrenamiento por su ID
   * @param {string|number} id - ID del entrenamiento
   * @returns {Promise<Entrenamiento|null>} Entrenamiento encontrado o null
   */
  async findById(id) {
    throw new Error("Method findById() must be implemented");
  }

  /**
   * Obtiene todos los entrenamientos
   * @param {Object} filters - Filtros opcionales
   * @param {Date} filters.fechaDesde - Filtrar desde fecha
   * @param {Date} filters.fechaHasta - Filtrar hasta fecha
   * @param {string} filters.lugar - Filtrar por lugar
   * @returns {Promise<Entrenamiento[]>} Lista de entrenamientos
   */
  async findAll(filters = {}) {
    throw new Error("Method findAll() must be implemented");
  }

  /**
   * Obtiene entrenamientos con paginación
   * @param {number} page - Número de página (empezando en 1)
   * @param {number} limit - Cantidad de resultados por página
   * @param {Object} filters - Filtros opcionales
   * @returns {Promise<{data: Entrenamiento[], total: number, page: number, totalPages: number}>}
   */
  async findPaginated(page, limit, filters = {}) {
    throw new Error("Method findPaginated() must be implemented");
  }

  /**
   * Obtiene entrenamientos en un rango de fechas
   * @param {Date} fechaInicio - Fecha de inicio
   * @param {Date} fechaFin - Fecha de fin
   * @returns {Promise<Entrenamiento[]>} Lista de entrenamientos
   */
  async findByDateRange(fechaInicio, fechaFin) {
    throw new Error("Method findByDateRange() must be implemented");
  }

  /**
   * Obtiene entrenamientos futuros (próximos)
   * @param {number} limit - Cantidad máxima de resultados (opcional)
   * @returns {Promise<Entrenamiento[]>} Lista de entrenamientos ordenados por fecha
   */
  async findUpcoming(limit = null) {
    throw new Error("Method findUpcoming() must be implemented");
  }

  /**
   * Obtiene entrenamientos pasados (histórico)
   * @param {number} limit - Cantidad máxima de resultados (opcional)
   * @returns {Promise<Entrenamiento[]>} Lista de entrenamientos ordenados por fecha descendente
   */
  async findPast(limit = null) {
    throw new Error("Method findPast() must be implemented");
  }

  /**
   * Busca entrenamientos por lugar
   * @param {string} lugar - Lugar del entrenamiento
   * @returns {Promise<Entrenamiento[]>} Lista de entrenamientos en ese lugar
   */
  async findByLugar(lugar) {
    throw new Error("Method findByLugar() must be implemented");
  }

  /**
   * Obtiene entrenamientos de hoy
   * @returns {Promise<Entrenamiento[]>} Lista de entrenamientos de hoy
   */
  async findToday() {
    throw new Error("Method findToday() must be implemented");
  }

  /**
   * Obtiene entrenamientos de esta semana
   * @returns {Promise<Entrenamiento[]>} Lista de entrenamientos de la semana actual
   */
  async findThisWeek() {
    throw new Error("Method findThisWeek() must be implemented");
  }

  /**
   * Obtiene entrenamientos de este mes
   * @returns {Promise<Entrenamiento[]>} Lista de entrenamientos del mes actual
   */
  async findThisMonth() {
    throw new Error("Method findThisMonth() must be implemented");
  }

  /**
   * Crea un nuevo entrenamiento
   * @param {Entrenamiento} entrenamiento - Entidad Entrenamiento a crear
   * @returns {Promise<Entrenamiento>} Entrenamiento creado con ID asignado
   */
  async create(entrenamiento) {
    throw new Error("Method create() must be implemented");
  }

  /**
   * Actualiza un entrenamiento existente
   * @param {string|number} id - ID del entrenamiento
   * @param {Entrenamiento} entrenamiento - Entidad Entrenamiento con datos actualizados
   * @returns {Promise<Entrenamiento>} Entrenamiento actualizado
   */
  async update(id, entrenamiento) {
    throw new Error("Method update() must be implemented");
  }

  /**
   * Elimina un entrenamiento
   * @param {string|number} id - ID del entrenamiento
   * @returns {Promise<boolean>} true si se eliminó correctamente
   */
  async delete(id) {
    throw new Error("Method delete() must be implemented");
  }

  /**
   * Cuenta el total de entrenamientos
   * @param {Object} filters - Filtros opcionales
   * @returns {Promise<number>} Cantidad de entrenamientos
   */
  async count(filters = {}) {
    throw new Error("Method count() must be implemented");
  }

  /**
   * Obtiene estadísticas de entrenamientos
   * @returns {Promise<{total: number, totalHoras: number, promedioAsistencia: number}>}
   */
  async getStats() {
    throw new Error("Method getStats() must be implemented");
  }

  /**
   * Obtiene estadísticas por lugar
   * @returns {Promise<Array<{lugar: string, cantidad: number}>>}
   */
  async getStatsByLugar() {
    throw new Error("Method getStatsByLugar() must be implemented");
  }

  /**
   * Obtiene el próximo entrenamiento
   * @returns {Promise<Entrenamiento|null>} Próximo entrenamiento o null
   */
  async getNext() {
    throw new Error("Method getNext() must be implemented");
  }

  /**
   * Obtiene el último entrenamiento realizado
   * @returns {Promise<Entrenamiento|null>} Último entrenamiento o null
   */
  async getLast() {
    throw new Error("Method getLast() must be implemented");
  }

  /**
   * Verifica si hay conflictos de horario
   * @param {Date} fechaHora - Fecha y hora del entrenamiento
   * @param {number} duracion - Duración en minutos
   * @param {string|number} excludeId - ID a excluir de la búsqueda (opcional)
   * @returns {Promise<boolean>} true si hay conflicto
   */
  async hasScheduleConflict(fechaHora, duracion, excludeId = null) {
    throw new Error("Method hasScheduleConflict() must be implemented");
  }
}
