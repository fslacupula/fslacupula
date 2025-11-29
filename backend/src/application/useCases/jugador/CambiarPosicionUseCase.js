import { ValidationError } from "../../../domain/errors/index.js";

/**
 * Caso de Uso: Cambiar Posición de Jugador
 *
 * Responsabilidad: Cambiar la posición de un jugador en el campo.
 *
 * Flujo:
 * 1. Buscar el jugador por ID
 * 2. Validar que existe
 * 3. Cambiar la posición (la validación está en la entidad)
 * 4. Persistir los cambios
 * 5. Retornar el jugador actualizado
 */
export class CambiarPosicionUseCase {
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
   * @param {string|number} jugadorId - ID del jugador
   * @param {number} nuevaPosicionId - ID de la nueva posición del jugador
   * @returns {Promise<Object>} Jugador actualizado
   * @throws {ValidationError} Si el jugador no existe o la posición es inválida
   */
  async execute(jugadorId, nuevaPosicionId) {
    if (!jugadorId) {
      throw new ValidationError("El ID del jugador es requerido");
    }

    if (!nuevaPosicionId) {
      throw new ValidationError("El ID de la posición es requerido");
    }

    // Buscar el jugador
    const jugador = await this.jugadorRepository.findById(jugadorId);
    if (!jugador) {
      throw new ValidationError("Jugador no encontrado");
    }

    // Cambiar la posición
    jugador.cambiarPosicion(nuevaPosicionId);

    // Persistir los cambios
    const jugadorActualizado = await this.jugadorRepository.update(
      jugadorId,
      jugador
    );

    return jugadorActualizado.toObject();
  }
}
