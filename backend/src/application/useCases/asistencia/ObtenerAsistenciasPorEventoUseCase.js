/**
 * @class ObtenerAsistenciasPorEventoUseCase
 * @description Obtiene todas las asistencias de un evento específico (partido o entrenamiento)
 */
export class ObtenerAsistenciasPorEventoUseCase {
  constructor(asistenciaRepository) {
    if (!asistenciaRepository) {
      throw new Error("asistenciaRepository es requerido");
    }

    this.asistenciaRepository = asistenciaRepository;
  }

  /**
   * Obtiene todas las asistencias de un evento
   * @param {Object} opciones - Opciones de búsqueda
   * @param {number} [opciones.partidoId] - ID del partido
   * @param {number} [opciones.entrenamientoId] - ID del entrenamiento
   * @returns {Promise<Array>} Array de asistencias
   */
  async execute(opciones = {}) {
    // Validar que se proporciona al menos un evento
    if (!opciones.partidoId && !opciones.entrenamientoId) {
      throw new Error("Debe proporcionar partidoId o entrenamientoId");
    }

    // Validar que no se proporcionan ambos eventos
    if (opciones.partidoId && opciones.entrenamientoId) {
      throw new Error(
        "No puede proporcionar partidoId y entrenamientoId al mismo tiempo"
      );
    }

    let asistencias;

    if (opciones.partidoId) {
      asistencias = await this.asistenciaRepository.findByPartidoId(
        opciones.partidoId
      );
    } else {
      asistencias = await this.asistenciaRepository.findByEntrenamientoId(
        opciones.entrenamientoId
      );
    }

    return asistencias;
  }

  /**
   * Obtiene las asistencias agrupadas por estado
   * @param {Object} opciones - Opciones de búsqueda
   * @param {number} [opciones.partidoId] - ID del partido
   * @param {number} [opciones.entrenamientoId] - ID del entrenamiento
   * @returns {Promise<Object>} Objeto con asistencias agrupadas { confirmados: [], ausentes: [], pendientes: [] }
   */
  async executeAgrupadas(opciones = {}) {
    const asistencias = await this.execute(opciones);

    const agrupadas = {
      confirmados: asistencias.filter((a) => a.estado === "confirmado"),
      ausentes: asistencias.filter((a) => a.estado === "ausente"),
      pendientes: asistencias.filter((a) => a.estado === "pendiente"),
    };

    return agrupadas;
  }

  /**
   * Obtiene un resumen de asistencias del evento
   * @param {Object} opciones - Opciones de búsqueda
   * @param {number} [opciones.partidoId] - ID del partido
   * @param {number} [opciones.entrenamientoId] - ID del entrenamiento
   * @returns {Promise<Object>} Resumen { total, confirmados, ausentes, pendientes, porcentajeAsistencia }
   */
  async executeResumen(opciones = {}) {
    const asistencias = await this.execute(opciones);

    const total = asistencias.length;
    const confirmados = asistencias.filter(
      (a) => a.estado === "confirmado"
    ).length;
    const ausentes = asistencias.filter((a) => a.estado === "ausente").length;
    const pendientes = asistencias.filter(
      (a) => a.estado === "pendiente"
    ).length;

    const porcentajeAsistencia =
      total > 0 ? Math.round((confirmados / total) * 100) : 0;

    return {
      total,
      confirmados,
      ausentes,
      pendientes,
      porcentajeAsistencia,
    };
  }
}
