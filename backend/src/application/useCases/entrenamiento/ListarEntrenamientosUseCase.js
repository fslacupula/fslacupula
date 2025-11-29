import { ValidationError } from "../../../domain/errors/index.js";

/**
 * Caso de Uso: Listar Entrenamientos
 *
 * Responsabilidad: Listar entrenamientos con paginación y filtros opcionales.
 *
 * Flujo:
 * 1. Validar parámetros de paginación
 * 2. Validar filtros si se proporcionan
 * 3. Consultar entrenamientos con paginación
 * 4. Retornar resultados paginados
 */
export class ListarEntrenamientosUseCase {
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
   * Ejecuta el caso de uso - lista con paginación
   *
   * @param {Object} opciones - Opciones de paginación y filtros
   * @param {number} [opciones.page=1] - Número de página
   * @param {number} [opciones.limit=10] - Resultados por página
   * @param {Date} [opciones.fechaDesde] - Filtrar desde fecha
   * @param {Date} [opciones.fechaHasta] - Filtrar hasta fecha
   * @param {string} [opciones.lugar] - Filtrar por lugar
   * @returns {Promise<{data: Array<Object>, total: number, page: number, totalPages: number}>}
   * @throws {ValidationError} Si los parámetros son inválidos
   */
  async execute(opciones = {}) {
    const { page = 1, limit = 10, fechaDesde, fechaHasta, lugar } = opciones;

    // Validar paginación
    if (typeof page !== "number" || page < 1) {
      throw new ValidationError("La página debe ser un número mayor a 0");
    }

    if (typeof limit !== "number" || limit < 1 || limit > 100) {
      throw new ValidationError("El límite debe estar entre 1 y 100");
    }

    // Validar fechas si se proporcionan
    if (fechaDesde && isNaN(new Date(fechaDesde).getTime())) {
      throw new ValidationError("fechaDesde inválida");
    }

    if (fechaHasta && isNaN(new Date(fechaHasta).getTime())) {
      throw new ValidationError("fechaHasta inválida");
    }

    // Preparar filtros
    const filters = {};
    if (fechaDesde) filters.fechaDesde = new Date(fechaDesde);
    if (fechaHasta) filters.fechaHasta = new Date(fechaHasta);
    if (lugar) filters.lugar = lugar;

    // Consultar con paginación
    const resultado = await this.entrenamientoRepository.findPaginated(
      page,
      limit,
      filters
    );

    return {
      data: resultado.data.map((e) => e.toObject()),
      total: resultado.total,
      page: resultado.page,
      totalPages: resultado.totalPages,
    };
  }

  /**
   * Ejecuta el caso de uso - lista todos sin paginación
   *
   * @param {Object} [filters] - Filtros opcionales
   * @returns {Promise<Array<Object>>} Lista de entrenamientos
   */
  async executeAll(filters = {}) {
    const entrenamientos = await this.entrenamientoRepository.findAll(filters);
    return entrenamientos.map((e) => e.toObject());
  }

  /**
   * Obtiene entrenamientos por rango de fechas
   *
   * @param {Date|string} fechaInicio - Fecha de inicio
   * @param {Date|string} fechaFin - Fecha de fin
   * @returns {Promise<Array<Object>>} Lista de entrenamientos
   * @throws {ValidationError} Si las fechas son inválidas
   */
  async executeByDateRange(fechaInicio, fechaFin) {
    if (!fechaInicio || !fechaFin) {
      throw new ValidationError("fechaInicio y fechaFin son requeridas");
    }

    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);

    if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
      throw new ValidationError("Fechas inválidas");
    }

    if (inicio > fin) {
      throw new ValidationError(
        "fechaInicio no puede ser posterior a fechaFin"
      );
    }

    const entrenamientos = await this.entrenamientoRepository.findByDateRange(
      inicio,
      fin
    );

    return entrenamientos.map((e) => e.toObject());
  }
}
