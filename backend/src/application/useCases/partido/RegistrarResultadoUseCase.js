import { ValidationError } from "../../../domain/errors/index.js";

/**
 * Caso de Uso: Registrar Resultado de Partido
 *
 * Responsabilidad: Registrar el resultado de un partido finalizado.
 *
 * Flujo:
 * 1. Validar que partidoId es requerido
 * 2. Validar que resultado es requerido
 * 3. Buscar el partido
 * 4. Validar que el partido existe
 * 5. Registrar el resultado
 * 6. Persistir los cambios
 * 7. Retornar el partido actualizado
 */
export class RegistrarResultadoUseCase {
  /**
   * @param {IPartidoRepository} partidoRepository - Repositorio de partidos
   */
  constructor(partidoRepository) {
    if (!partidoRepository) {
      throw new Error("partidoRepository is required");
    }
    this.partidoRepository = partidoRepository;
  }

  /**
   * Ejecuta el caso de uso
   *
   * @param {string|number} partidoId - ID del partido
   * @param {string} resultado - Resultado del partido (ej: "3-2", "1-1")
   * @returns {Promise<Object>} Partido actualizado
   * @throws {ValidationError} Si el partido no existe o los datos son inválidos
   */
  async execute(partidoId, resultado) {
    // Validaciones
    if (!partidoId) {
      throw new ValidationError("El ID del partido es requerido");
    }

    if (
      !resultado ||
      typeof resultado !== "string" ||
      resultado.trim().length === 0
    ) {
      throw new ValidationError("El resultado es requerido");
    }

    // Validar formato del resultado (ej: "3-2", "0-0")
    const formatoValido = /^\d+-\d+$/.test(resultado.trim());
    if (!formatoValido) {
      throw new ValidationError(
        'El resultado debe tener el formato "X-Y" (ej: "3-2")'
      );
    }

    // Buscar el partido
    const partido = await this.partidoRepository.findById(partidoId);
    if (!partido) {
      throw new ValidationError("Partido no encontrado");
    }

    // Registrar el resultado
    partido.registrarResultado(resultado.trim());

    // Persistir los cambios
    const partidoActualizado = await this.partidoRepository.update(
      partidoId,
      partido
    );

    return partidoActualizado.toObject();
  }
}
