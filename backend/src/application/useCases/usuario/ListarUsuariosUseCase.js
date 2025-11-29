/**
 * Caso de Uso: Listar Usuarios
 *
 * Responsabilidad: Recuperar una lista de usuarios con filtros opcionales
 * y paginación.
 *
 * Flujo:
 * 1. Aplicar filtros opcionales (rol, activo)
 * 2. Aplicar paginación si se especifica
 * 3. Retornar lista de usuarios (sin contraseñas)
 */
export class ListarUsuariosUseCase {
  /**
   * @param {IUsuarioRepository} usuarioRepository - Repositorio de usuarios
   */
  constructor(usuarioRepository) {
    if (!usuarioRepository) {
      throw new Error("usuarioRepository is required");
    }
    this.usuarioRepository = usuarioRepository;
  }

  /**
   * Ejecuta el caso de uso con paginación
   *
   * @param {Object} opciones - Opciones de búsqueda
   * @param {number} [opciones.page=1] - Número de página
   * @param {number} [opciones.limit=10] - Resultados por página
   * @param {string} [opciones.rol] - Filtrar por rol ('jugador', 'gestor')
   * @param {boolean} [opciones.activo] - Filtrar por estado activo
   * @returns {Promise<Object>} Resultado paginado con usuarios
   */
  async execute(opciones = {}) {
    const { page = 1, limit = 10, rol, activo } = opciones;

    // Construir filtros
    const filters = {};
    if (rol) filters.rol = rol;
    if (activo !== undefined) filters.activo = activo;

    // Obtener usuarios paginados
    const resultado = await this.usuarioRepository.findPaginated(
      page,
      limit,
      filters
    );

    // Convertir usuarios a objetos seguros (sin contraseña)
    return {
      data: resultado.data.map((usuario) => usuario.toSafeObject()),
      total: resultado.total,
      page: resultado.page,
      totalPages: resultado.totalPages,
    };
  }

  /**
   * Ejecuta el caso de uso sin paginación (todos los usuarios)
   *
   * @param {Object} filtros - Filtros opcionales
   * @param {string} [filtros.rol] - Filtrar por rol
   * @param {boolean} [filtros.activo] - Filtrar por estado activo
   * @returns {Promise<Array>} Lista de usuarios
   */
  async executeAll(filtros = {}) {
    const usuarios = await this.usuarioRepository.findAll(filtros);
    return usuarios.map((usuario) => usuario.toSafeObject());
  }
}
