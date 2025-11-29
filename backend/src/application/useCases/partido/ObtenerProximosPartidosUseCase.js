import { ValidationError } from "../../../domain/errors/index.js";

/**
 * Caso de Uso: Obtener Próximos Partidos
 *
 * Responsabilidad: Recuperar la lista de partidos futuros ordenados por fecha.
 *
 * Flujo:
 * 1. Validar parámetros opcionales
 * 2. Consultar partidos próximos en el repositorio
 * 3. Retornar lista ordenada por fecha ascendente
 */
export class ObtenerProximosPartidosUseCase {
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
   * @param {Object} opciones - Opciones de consulta
   * @param {number} [opciones.limit] - Cantidad máxima de resultados
   * @param {string} [opciones.tipo] - Filtrar por tipo de partido
   * @returns {Promise<Array>} Lista de próximos partidos
   * @throws {ValidationError} Si los parámetros son inválidos
   */
  async execute(opciones = {}) {
    const { limit, tipo } = opciones;

    // Validar limit si se proporciona
    if (limit !== undefined && limit !== null) {
      if (typeof limit !== "number" || limit < 1 || limit > 100) {
        throw new ValidationError("El límite debe ser un número entre 1 y 100");
      }
    }

    // Validar tipo si se proporciona
    if (tipo !== undefined && tipo !== null) {
      const { Partido } = await import("../../../domain/entities/Partido.js");
      if (!Object.values(Partido.TIPOS).includes(tipo)) {
        throw new ValidationError(
          `Tipo inválido. Debe ser uno de: ${Object.values(Partido.TIPOS).join(
            ", "
          )}`
        );
      }
    }

    // Obtener partidos próximos
    let partidos = await this.partidoRepository.findUpcoming(limit);

    // Filtrar por tipo si se especificó
    if (tipo) {
      partidos = partidos.filter((partido) => partido.tipo === tipo);
    }

    // Convertir a objetos planos
    return partidos.map((partido) => partido.toObject());
  }

  /**
   * Obtiene solo el próximo partido
   *
   * @returns {Promise<Object|null>} Próximo partido o null si no hay
   */
  async executeNext() {
    const partido = await this.partidoRepository.getNext();
    return partido ? partido.toObject() : null;
  }
}
