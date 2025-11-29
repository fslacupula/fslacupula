/**
 * Interface: IJugadorRepository
 *
 * Define el contrato para el repositorio de Jugadores.
 * Esta interfaz pertenece a la capa de dominio y debe ser implementada
 * por la capa de infraestructura.
 *
 * Un Jugador es una extensión de Usuario con datos específicos del jugador.
 */
export class IJugadorRepository {
  /**
   * Busca un jugador por su ID
   * @param {string|number} id - ID del jugador
   * @returns {Promise<Jugador|null>} Jugador encontrado o null
   */
  async findById(id) {
    throw new Error("Method findById() must be implemented");
  }

  /**
   * Busca un jugador por el ID del usuario asociado
   * @param {string|number} usuarioId - ID del usuario
   * @returns {Promise<Jugador|null>} Jugador encontrado o null
   */
  async findByUsuarioId(usuarioId) {
    throw new Error("Method findByUsuarioId() must be implemented");
  }

  /**
   * Obtiene todos los jugadores
   * @param {Object} filters - Filtros opcionales
   * @param {string} filters.posicion - Filtrar por posición
   * @param {number} filters.numeroDorsal - Filtrar por número de dorsal
   * @returns {Promise<Jugador[]>} Lista de jugadores
   */
  async findAll(filters = {}) {
    throw new Error("Method findAll() must be implemented");
  }

  /**
   * Obtiene jugadores con paginación
   * @param {number} page - Número de página (empezando en 1)
   * @param {number} limit - Cantidad de resultados por página
   * @param {Object} filters - Filtros opcionales
   * @returns {Promise<{data: Jugador[], total: number, page: number, totalPages: number}>}
   */
  async findPaginated(page, limit, filters = {}) {
    throw new Error("Method findPaginated() must be implemented");
  }

  /**
   * Busca un jugador por número de dorsal
   * @param {number} numeroDorsal - Número de dorsal
   * @returns {Promise<Jugador|null>} Jugador encontrado o null
   */
  async findByNumeroDorsal(numeroDorsal) {
    throw new Error("Method findByNumeroDorsal() must be implemented");
  }

  /**
   * Obtiene jugadores por posición
   * @param {string} posicion - Posición del jugador
   * @returns {Promise<Jugador[]>} Lista de jugadores
   */
  async findByPosicion(posicion) {
    throw new Error("Method findByPosicion() must be implemented");
  }

  /**
   * Crea un nuevo jugador
   * @param {Jugador} jugador - Entidad Jugador a crear
   * @returns {Promise<Jugador>} Jugador creado con ID asignado
   */
  async create(jugador) {
    throw new Error("Method create() must be implemented");
  }

  /**
   * Actualiza un jugador existente
   * @param {string|number} id - ID del jugador
   * @param {Jugador} jugador - Entidad Jugador con datos actualizados
   * @returns {Promise<Jugador>} Jugador actualizado
   */
  async update(id, jugador) {
    throw new Error("Method update() must be implemented");
  }

  /**
   * Elimina un jugador
   * @param {string|number} id - ID del jugador
   * @returns {Promise<boolean>} true si se eliminó correctamente
   */
  async delete(id) {
    throw new Error("Method delete() must be implemented");
  }

  /**
   * Verifica si existe un jugador con el número de dorsal dado
   * @param {number} numeroDorsal - Número de dorsal a verificar
   * @param {string|number} excludeId - ID a excluir de la búsqueda (opcional)
   * @returns {Promise<boolean>} true si existe
   */
  async existsByNumeroDorsal(numeroDorsal, excludeId = null) {
    throw new Error("Method existsByNumeroDorsal() must be implemented");
  }

  /**
   * Cuenta el total de jugadores
   * @param {Object} filters - Filtros opcionales
   * @returns {Promise<number>} Cantidad de jugadores
   */
  async count(filters = {}) {
    throw new Error("Method count() must be implemented");
  }

  /**
   * Obtiene jugadores con perfil completo
   * @returns {Promise<Jugador[]>} Lista de jugadores con todos los datos
   */
  async findWithCompleteProfile() {
    throw new Error("Method findWithCompleteProfile() must be implemented");
  }

  /**
   * Obtiene jugadores con perfil incompleto
   * @returns {Promise<Jugador[]>} Lista de jugadores sin todos los datos
   */
  async findWithIncompleteProfile() {
    throw new Error("Method findWithIncompleteProfile() must be implemented");
  }

  /**
   * Obtiene estadísticas por posición
   * @returns {Promise<Array<{posicion: string, cantidad: number}>>} Estadísticas
   */
  async getStatsByPosicion() {
    throw new Error("Method getStatsByPosicion() must be implemented");
  }
}
