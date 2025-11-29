import { ValidationError } from "../../../domain/errors/index.js";

/**
 * Caso de Uso: Asignar Dorsal a Jugador
 *
 * Responsabilidad: Asignar un número de dorsal único a un jugador.
 *
 * Flujo:
 * 1. Buscar el jugador por ID
 * 2. Validar que existe
 * 3. Validar que el dorsal no esté en uso por otro jugador
 * 4. Asignar el nuevo dorsal
 * 5. Persistir los cambios
 * 6. Retornar el jugador actualizado
 */
export class AsignarDorsalUseCase {
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
   * @param {string|number} numeroDorsal - Número de dorsal a asignar
   * @returns {Promise<Object>} Jugador actualizado
   * @throws {ValidationError} Si el jugador no existe o el dorsal está en uso
   */
  async execute(jugadorId, numeroDorsal) {
    if (!jugadorId) {
      throw new ValidationError("El ID del jugador es requerido");
    }

    if (!numeroDorsal) {
      throw new ValidationError("El número de dorsal es requerido");
    }

    // Buscar el jugador
    const jugador = await this.jugadorRepository.findById(jugadorId);
    if (!jugador) {
      throw new ValidationError("Jugador no encontrado");
    }

    // Validar que el dorsal no esté en uso por otro jugador
    const dorsalEnUso = await this.jugadorRepository.existsByNumeroDorsal(
      numeroDorsal,
      jugadorId
    );
    if (dorsalEnUso) {
      throw new ValidationError(
        `El dorsal ${numeroDorsal} ya está en uso por otro jugador`
      );
    }

    // Asignar el nuevo dorsal
    jugador.cambiarNumeroDorsal(numeroDorsal);

    // Persistir los cambios
    const jugadorActualizado = await this.jugadorRepository.update(
      jugadorId,
      jugador
    );

    return jugadorActualizado.toObject();
  }
}
