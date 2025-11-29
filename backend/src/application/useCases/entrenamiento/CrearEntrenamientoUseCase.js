import { ValidationError } from "../../../domain/errors/index.js";

/**
 * Caso de Uso: Crear Entrenamiento
 *
 * Responsabilidad: Crear un nuevo entrenamiento validando todos los campos requeridos.
 *
 * Flujo:
 * 1. Validar que todos los campos requeridos están presentes
 * 2. Crear la entidad Entrenamiento con las validaciones del dominio
 * 3. Persistir el entrenamiento en el repositorio
 * 4. Retornar el entrenamiento creado
 */
export class CrearEntrenamientoUseCase {
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
   * @param {Object} datos - Datos del entrenamiento
   * @param {Date|string} datos.fechaHora - Fecha y hora del entrenamiento
   * @param {string} datos.lugar - Lugar del entrenamiento
   * @param {string} [datos.descripcion] - Descripción opcional
   * @param {number} [datos.duracionMinutos] - Duración en minutos (por defecto 90)
   * @param {number} datos.creadoPor - ID del usuario que crea
   * @returns {Promise<Object>} Entrenamiento creado
   * @throws {ValidationError} Si los datos son inválidos
   */
  async execute({ fechaHora, lugar, descripcion, duracionMinutos, creadoPor }) {
    // Validaciones de campos requeridos
    if (!fechaHora) {
      throw new ValidationError("fechaHora es requerido");
    }

    if (!lugar) {
      throw new ValidationError("lugar es requerido");
    }

    if (!creadoPor) {
      throw new ValidationError("creadoPor es requerido");
    }

    // Importar la entidad
    const { Entrenamiento } = await import(
      "../../../domain/entities/Entrenamiento.js"
    );

    // Crear entidad (las validaciones del dominio se ejecutan en el constructor)
    const entrenamiento = new Entrenamiento({
      id: null,
      fechaHora,
      lugar,
      descripcion: descripcion || null,
      duracionMinutos: duracionMinutos || Entrenamiento.DEFAULT_DURACION,
      creadoPor,
    });

    // Persistir
    const entrenamientoCreado = await this.entrenamientoRepository.create(
      entrenamiento
    );

    return entrenamientoCreado.toObject();
  }
}
