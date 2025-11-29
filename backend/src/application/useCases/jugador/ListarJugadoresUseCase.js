/**
 * Caso de Uso: Listar Jugadores
 *
 * Responsabilidad: Recuperar una lista de jugadores con filtros opcionales
 * y paginación.
 *
 * Flujo:
 * 1. Aplicar filtros opcionales (posición, perfilCompleto)
 * 2. Aplicar paginación si se especifica
 * 3. Retornar lista de jugadores
 */
export class ListarJugadoresUseCase {
  /**
   * @param {IJugadorRepository} jugadorRepository - Repositorio de jugadores
   */
  constructor(jugadorRepository) {
    if (!jugadorRepository) {
      throw new Error("jugadorRepository is required");
    }
    this.jugadorRepository = jugadorRepository;
  }

  /**
   * Ejecuta el caso de uso con paginación
   *
   * @param {Object} opciones - Opciones de búsqueda
   * @param {number} [opciones.page=1] - Número de página
   * @param {number} [opciones.limit=10] - Resultados por página
   * @param {number} [opciones.posicionId] - Filtrar por ID de posición
   * @param {boolean} [opciones.perfilCompleto] - Filtrar por perfil completo/incompleto
   * @returns {Promise<Object>} Resultado paginado con jugadores
   */
  async execute(opciones = {}) {
    const { page = 1, limit = 10, posicionId, perfilCompleto } = opciones;

    // Validar parámetros de paginación
    const { ValidationError } = await import("../../../domain/errors/index.js");

    if (page < 1) {
      throw new ValidationError(
        "El número de página debe ser mayor o igual a 1"
      );
    }

    if (limit < 1 || limit > 100) {
      throw new ValidationError("El límite debe estar entre 1 y 100");
    }

    // Construir filtros
    const filters = {};
    if (posicionId) filters.posicionId = posicionId;
    if (perfilCompleto !== undefined) filters.perfilCompleto = perfilCompleto;

    // Obtener jugadores paginados
    const resultado = await this.jugadorRepository.findAll({
      ...filters,
      page,
      limit,
    });

    // Si el repositorio retorna un array simple, convertirlo al formato esperado
    if (Array.isArray(resultado)) {
      return {
        jugadores: resultado.map((jugador) =>
          typeof jugador.toObject === "function" ? jugador.toObject() : jugador
        ),
        total: resultado.length,
        page: page,
        totalPages: Math.ceil(resultado.length / limit),
      };
    }

    // Si ya viene en formato objeto con propiedades
    return {
      jugadores: resultado.jugadores.map((jugador) =>
        typeof jugador.toObject === "function" ? jugador.toObject() : jugador
      ),
      total: resultado.total,
      page: resultado.page,
      totalPages: resultado.totalPages,
    };
  }

  /**
   * Ejecuta el caso de uso sin paginación (todos los jugadores)
   *
   * @param {Object} filtros - Filtros opcionales
   * @param {number} [filtros.posicionId] - Filtrar por ID de posición
   * @param {boolean} [filtros.perfilCompleto] - Filtrar por perfil completo
   * @returns {Promise<Array>} Lista de jugadores
   */
  async executeAll(filtros = {}) {
    const resultado = await this.jugadorRepository.findAll(filtros);
    const jugadores = Array.isArray(resultado)
      ? resultado
      : resultado.jugadores;
    return {
      jugadores: jugadores.map((jugador) =>
        typeof jugador.toObject === "function" ? jugador.toObject() : jugador
      ),
      total: jugadores.length,
    };
  }

  /**
   * Obtiene jugadores por posición específica
   *
   * @param {number} posicionId - ID de la posición a filtrar
   * @returns {Promise<Array>} Lista de jugadores en esa posición
   */
  async executeByPosicion(posicionId) {
    const { ValidationError } = await import("../../../domain/errors/index.js");

    if (!posicionId) {
      throw new ValidationError("El ID de posición es requerido");
    }

    const jugadores = await this.jugadorRepository.findByPosicion(posicionId);
    return jugadores.map((jugador) => jugador.toObject());
  }
}
