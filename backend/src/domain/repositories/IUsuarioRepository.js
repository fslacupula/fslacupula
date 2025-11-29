/**
 * Interface: IUsuarioRepository
 *
 * Define el contrato para el repositorio de Usuarios.
 * Esta interfaz pertenece a la capa de dominio y debe ser implementada
 * por la capa de infraestructura.
 *
 * Principio de Inversión de Dependencias (DIP):
 * - El dominio define la interfaz
 * - La infraestructura la implementa
 * - Los casos de uso dependen de la interfaz, no de la implementación
 */
export class IUsuarioRepository {
  /**
   * Busca un usuario por su ID
   * @param {string|number} id - ID del usuario
   * @returns {Promise<Usuario|null>} Usuario encontrado o null
   */
  async findById(id) {
    throw new Error("Method findById() must be implemented");
  }

  /**
   * Busca un usuario por su email
   * @param {string} email - Email del usuario
   * @returns {Promise<Usuario|null>} Usuario encontrado o null
   */
  async findByEmail(email) {
    throw new Error("Method findByEmail() must be implemented");
  }

  /**
   * Obtiene todos los usuarios
   * @param {Object} filters - Filtros opcionales
   * @param {string} filters.rol - Filtrar por rol ('jugador', 'gestor')
   * @param {boolean} filters.activo - Filtrar por estado activo
   * @returns {Promise<Usuario[]>} Lista de usuarios
   */
  async findAll(filters = {}) {
    throw new Error("Method findAll() must be implemented");
  }

  /**
   * Obtiene usuarios con paginación
   * @param {number} page - Número de página (empezando en 1)
   * @param {number} limit - Cantidad de resultados por página
   * @param {Object} filters - Filtros opcionales
   * @returns {Promise<{data: Usuario[], total: number, page: number, totalPages: number}>}
   */
  async findPaginated(page, limit, filters = {}) {
    throw new Error("Method findPaginated() must be implemented");
  }

  /**
   * Crea un nuevo usuario
   * @param {Usuario} usuario - Entidad Usuario a crear
   * @returns {Promise<Usuario>} Usuario creado con ID asignado
   */
  async create(usuario) {
    throw new Error("Method create() must be implemented");
  }

  /**
   * Actualiza un usuario existente
   * @param {string|number} id - ID del usuario
   * @param {Usuario} usuario - Entidad Usuario con datos actualizados
   * @returns {Promise<Usuario>} Usuario actualizado
   */
  async update(id, usuario) {
    throw new Error("Method update() must be implemented");
  }

  /**
   * Elimina un usuario (soft delete - marca como inactivo)
   * @param {string|number} id - ID del usuario
   * @returns {Promise<boolean>} true si se eliminó correctamente
   */
  async delete(id) {
    throw new Error("Method delete() must be implemented");
  }

  /**
   * Elimina permanentemente un usuario (hard delete)
   * @param {string|number} id - ID del usuario
   * @returns {Promise<boolean>} true si se eliminó correctamente
   */
  async hardDelete(id) {
    throw new Error("Method hardDelete() must be implemented");
  }

  /**
   * Verifica si existe un usuario con el email dado
   * @param {string} email - Email a verificar
   * @param {string|number} excludeId - ID a excluir de la búsqueda (opcional, para updates)
   * @returns {Promise<boolean>} true si existe
   */
  async existsByEmail(email, excludeId = null) {
    throw new Error("Method existsByEmail() must be implemented");
  }

  /**
   * Cuenta el total de usuarios
   * @param {Object} filters - Filtros opcionales
   * @returns {Promise<number>} Cantidad de usuarios
   */
  async count(filters = {}) {
    throw new Error("Method count() must be implemented");
  }

  /**
   * Obtiene todos los usuarios con rol 'jugador'
   * @returns {Promise<Usuario[]>} Lista de jugadores
   */
  async findAllJugadores() {
    throw new Error("Method findAllJugadores() must be implemented");
  }

  /**
   * Obtiene todos los usuarios con rol 'gestor'
   * @returns {Promise<Usuario[]>} Lista de gestores
   */
  async findAllGestores() {
    throw new Error("Method findAllGestores() must be implemented");
  }

  /**
   * Obtiene usuarios activos
   * @returns {Promise<Usuario[]>} Lista de usuarios activos
   */
  async findActivos() {
    throw new Error("Method findActivos() must be implemented");
  }
}
