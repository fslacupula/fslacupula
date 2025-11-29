import { ValidationError } from "../../../domain/errors/index.js";

/**
 * Caso de Uso: Actualizar Entrenamiento
 *
 * Responsabilidad: Actualizar los datos de un entrenamiento existente.
 *
 * Flujo:
 * 1. Validar que entrenamientoId es requerido
 * 2. Validar que se proporciona al menos un campo para actualizar
 * 3. Buscar el entrenamiento
 * 4. Validar y actualizar cada campo proporcionado
 * 5. Persistir los cambios
 * 6. Retornar el entrenamiento actualizado
 */
export class ActualizarEntrenamientoUseCase {
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
   * @param {string|number} entrenamientoId - ID del entrenamiento
   * @param {Object} datos - Datos a actualizar
   * @param {Date|string} [datos.fechaHora] - Nueva fecha y hora
   * @param {string} [datos.lugar] - Nuevo lugar
   * @param {string} [datos.descripcion] - Nueva descripción
   * @param {number} [datos.duracionMinutos] - Nueva duración
   * @returns {Promise<Object>} Entrenamiento actualizado
   * @throws {ValidationError} Si el entrenamiento no existe o los datos son inválidos
   */
  async execute(entrenamientoId, datos) {
    // Validar entrenamientoId
    if (!entrenamientoId) {
      throw new ValidationError("El ID del entrenamiento es requerido");
    }

    // Validar que se proporciona al menos un campo
    const camposActualizables = [
      "fechaHora",
      "lugar",
      "descripcion",
      "duracionMinutos",
    ];
    const hayAlgunCampo = camposActualizables.some(
      (campo) => datos[campo] !== undefined
    );

    if (!hayAlgunCampo) {
      throw new ValidationError(
        "Debe proporcionar al menos un campo para actualizar"
      );
    }

    // Buscar el entrenamiento
    const entrenamiento = await this.entrenamientoRepository.findById(
      entrenamientoId
    );

    if (!entrenamiento) {
      throw new ValidationError("Entrenamiento no encontrado");
    }

    // Actualizar fechaHora si se proporciona
    if (datos.fechaHora !== undefined) {
      const fecha = new Date(datos.fechaHora);
      if (isNaN(fecha.getTime())) {
        throw new ValidationError("Fecha y hora inválidas");
      }
      entrenamiento._fechaHora = fecha;
    }

    // Actualizar lugar si se proporciona
    if (datos.lugar !== undefined) {
      entrenamiento.cambiarLugar(datos.lugar);
    }

    // Actualizar descripción si se proporciona
    if (datos.descripcion !== undefined) {
      entrenamiento.cambiarDescripcion(datos.descripcion);
    }

    // Actualizar duración si se proporciona
    if (datos.duracionMinutos !== undefined) {
      entrenamiento.cambiarDuracion(datos.duracionMinutos);
    }

    // Persistir los cambios
    const entrenamientoActualizado = await this.entrenamientoRepository.update(
      entrenamientoId,
      entrenamiento
    );

    return entrenamientoActualizado.toObject();
  }
}
