import { ValidationError } from "../../../domain/errors/index.js";

/**
 * Caso de Uso: Obtener Jugador por ID
 *
 * Responsabilidad: Recuperar un jugador específico por su identificador.
 *
 * Flujo:
 * 1. Validar ID proporcionado
 * 2. Buscar el jugador en el repositorio
 * 3. Validar que existe
 * 4. Retornar el jugador
 */
export class ObtenerJugadorPorIdUseCase {
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
   * Ejecuta el caso de uso
   *
   * @param {string|number} jugadorId - ID del jugador a buscar
   * @returns {Promise<Object>} Jugador encontrado
   * @throws {ValidationError} Si el jugador no existe
   */
  async execute(jugadorId) {
    if (!jugadorId) {
      throw new ValidationError("El ID del jugador es requerido");
    }

    const jugador = await this.jugadorRepository.findById(jugadorId);

    if (!jugador) {
      throw new ValidationError("Jugador no encontrado");
    }

    return jugador.toObject();
  }
}
