import { ValidationError } from "../../../domain/errors/index.js";

/**
 * Caso de Uso: Obtener Próximos Entrenamientos
 *
 * Responsabilidad: Recuperar entrenamientos futuros con filtros opcionales.
 *
 * Flujo:
 * 1. Validar parámetros si se proporcionan
 * 2. Consultar entrenamientos futuros en el repositorio
 * 3. Aplicar límite si se especifica
 * 4. Retornar lista de entrenamientos ordenados por fecha
 */
export class ObtenerProximosEntrenamientosUseCase {
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
   * Ejecuta el caso de uso - obtiene lista de entrenamientos futuros
   *
   * @param {Object} [opciones] - Opciones de búsqueda
   * @param {number} [opciones.limit] - Límite de resultados (1-100)
   * @returns {Promise<Array<Object>>} Lista de entrenamientos
   * @throws {ValidationError} Si los parámetros son inválidos
   */
  async execute(opciones = {}) {
    const { limit } = opciones;

    // Validar limit si se proporciona
    if (limit !== undefined) {
      if (typeof limit !== "number" || limit < 1 || limit > 100) {
        throw new ValidationError("El límite debe estar entre 1 y 100");
      }
    }

    // Obtener entrenamientos futuros
    const entrenamientos = await this.entrenamientoRepository.findUpcoming(
      limit
    );

    return entrenamientos.map((e) => e.toObject());
  }

  /**
   * Obtiene el próximo entrenamiento
   *
   * @returns {Promise<Object|null>} Próximo entrenamiento o null
   */
  async executeNext() {
    const entrenamiento = await this.entrenamientoRepository.getNext();
    return entrenamiento ? entrenamiento.toObject() : null;
  }

  /**
   * Obtiene entrenamientos de hoy
   *
   * @returns {Promise<Array<Object>>} Lista de entrenamientos de hoy
   */
  async executeToday() {
    const entrenamientos = await this.entrenamientoRepository.findToday();
    return entrenamientos.map((e) => e.toObject());
  }

  /**
   * Obtiene entrenamientos de esta semana
   *
   * @returns {Promise<Array<Object>>} Lista de entrenamientos de la semana
   */
  async executeThisWeek() {
    const entrenamientos = await this.entrenamientoRepository.findThisWeek();
    return entrenamientos.map((e) => e.toObject());
  }
}
