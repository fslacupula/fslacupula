import { ValidationError } from "../../../domain/errors/index.js";

/**
 * Caso de Uso: Eliminar Entrenamiento
 *
 * Responsabilidad: Eliminar un entrenamiento existente del sistema.
 *
 * Flujo:
 * 1. Validar que entrenamientoId es requerido
 * 2. Verificar que el entrenamiento existe
 * 3. Eliminar el entrenamiento del repositorio
 * 4. Retornar confirmación
 */
export class EliminarEntrenamientoUseCase {
  /**
   * @param {IEntrenamientoRepository} entrenamientoRepository - Repositorio de entrenamientos
   */
  constructor(entrenamientoRepository) {
    if (!entrenamientoRepository) {
      throw new Error("entrenamientoRepository es requerido");
    }
    this.entrenamientoRepository = entrenamientoRepository;
  }

  /**
   * Ejecuta el caso de uso
   *
   * @param {string|number} entrenamientoId - ID del entrenamiento a eliminar
   * @returns {Promise<{success: boolean, message: string}>}
   * @throws {ValidationError} Si el entrenamiento no existe o el ID es inválido
   */
  async execute(entrenamientoId) {
    // Validar entrenamientoId
    if (!entrenamientoId) {
      throw new ValidationError("El ID del entrenamiento es requerido");
    }

    // Verificar que existe
    const entrenamiento = await this.entrenamientoRepository.findById(
      entrenamientoId
    );

    if (!entrenamiento) {
      throw new ValidationError("Entrenamiento no encontrado");
    }

    // Eliminar
    await this.entrenamientoRepository.delete(entrenamientoId);

    return {
      success: true,
      message: "Entrenamiento eliminado correctamente",
    };
  }
}
