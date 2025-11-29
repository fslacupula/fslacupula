/**
 * @class ObtenerEstadisticasAsistenciaUseCase
 * @description Obtiene estadísticas de asistencia de un jugador
 */
export class ObtenerEstadisticasAsistenciaUseCase {
  constructor(asistenciaRepository, jugadorRepository) {
    if (!asistenciaRepository) {
      throw new Error("asistenciaRepository es requerido");
    }
    if (!jugadorRepository) {
      throw new Error("jugadorRepository es requerido");
    }

    this.asistenciaRepository = asistenciaRepository;
    this.jugadorRepository = jugadorRepository;
  }

  /**
   * Obtiene estadísticas de asistencia de un jugador
   * @param {number} jugadorId - ID del jugador
   * @param {Object} [opciones] - Opciones de filtrado
   * @param {string} [opciones.tipo] - 'partido', 'entrenamiento' o undefined (ambos)
   * @param {Date} [opciones.fechaDesde] - Fecha desde
   * @param {Date} [opciones.fechaHasta] - Fecha hasta
   * @returns {Promise<Object>} Estadísticas del jugador
   */
  async execute(jugadorId, opciones = {}) {
    // Validar que se proporciona el jugadorId
    if (!jugadorId) {
      throw new Error("jugadorId es requerido");
    }

    // Verificar que el jugador existe
    const jugador = await this.jugadorRepository.findById(jugadorId);
    if (!jugador) {
      throw new Error(`Jugador con ID ${jugadorId} no encontrado`);
    }

    // Validar el tipo si se proporciona
    if (opciones.tipo !== undefined) {
      const tiposValidos = ["partido", "entrenamiento"];
      if (!tiposValidos.includes(opciones.tipo)) {
        throw new Error(`tipo debe ser uno de: ${tiposValidos.join(", ")}`);
      }
    }

    // Validar las fechas si se proporcionan
    if (opciones.fechaDesde && !(opciones.fechaDesde instanceof Date)) {
      throw new Error("fechaDesde debe ser una instancia de Date");
    }

    if (opciones.fechaHasta && !(opciones.fechaHasta instanceof Date)) {
      throw new Error("fechaHasta debe ser una instancia de Date");
    }

    if (
      opciones.fechaDesde &&
      opciones.fechaHasta &&
      opciones.fechaDesde > opciones.fechaHasta
    ) {
      throw new Error("fechaDesde no puede ser posterior a fechaHasta");
    }

    // Obtener estadísticas del repositorio
    const estadisticas =
      await this.asistenciaRepository.getEstadisticasByJugador(
        jugadorId,
        opciones
      );

    return estadisticas;
  }

  /**
   * Obtiene estadísticas comparativas entre partidos y entrenamientos
   * @param {number} jugadorId - ID del jugador
   * @param {Object} [opciones] - Opciones de filtrado
   * @param {Date} [opciones.fechaDesde] - Fecha desde
   * @param {Date} [opciones.fechaHasta] - Fecha hasta
   * @returns {Promise<Object>} Estadísticas comparativas { partidos: {...}, entrenamientos: {...}, global: {...} }
   */
  async executeComparativas(jugadorId, opciones = {}) {
    // Obtener estadísticas de partidos
    const estadisticasPartidos = await this.execute(jugadorId, {
      ...opciones,
      tipo: "partido",
    });

    // Obtener estadísticas de entrenamientos
    const estadisticasEntrenamientos = await this.execute(jugadorId, {
      ...opciones,
      tipo: "entrenamiento",
    });

    // Calcular estadísticas globales
    const totalGlobal =
      estadisticasPartidos.total + estadisticasEntrenamientos.total;
    const confirmadosGlobal =
      estadisticasPartidos.confirmados + estadisticasEntrenamientos.confirmados;
    const ausentesGlobal =
      estadisticasPartidos.ausentes + estadisticasEntrenamientos.ausentes;
    const pendientesGlobal =
      estadisticasPartidos.pendientes + estadisticasEntrenamientos.pendientes;

    const porcentajeAsistenciaGlobal =
      totalGlobal > 0 ? Math.round((confirmadosGlobal / totalGlobal) * 100) : 0;

    return {
      partidos: estadisticasPartidos,
      entrenamientos: estadisticasEntrenamientos,
      global: {
        total: totalGlobal,
        confirmados: confirmadosGlobal,
        ausentes: ausentesGlobal,
        pendientes: pendientesGlobal,
        porcentajeAsistencia: porcentajeAsistenciaGlobal,
      },
    };
  }

  /**
   * Obtiene el historial de asistencias de un jugador
   * @param {number} jugadorId - ID del jugador
   * @param {Object} [opciones] - Opciones de filtrado
   * @param {string} [opciones.tipo] - 'partido', 'entrenamiento' o undefined (ambos)
   * @param {Date} [opciones.fechaDesde] - Fecha desde
   * @param {Date} [opciones.fechaHasta] - Fecha hasta
   * @returns {Promise<Array>} Array de asistencias del jugador
   */
  async executeHistorial(jugadorId, opciones = {}) {
    // Validar que se proporciona el jugadorId
    if (!jugadorId) {
      throw new Error("jugadorId es requerido");
    }

    // Verificar que el jugador existe
    const jugador = await this.jugadorRepository.findById(jugadorId);
    if (!jugador) {
      throw new Error(`Jugador con ID ${jugadorId} no encontrado`);
    }

    // Validar el tipo si se proporciona
    if (opciones.tipo !== undefined) {
      const tiposValidos = ["partido", "entrenamiento"];
      if (!tiposValidos.includes(opciones.tipo)) {
        throw new Error(`tipo debe ser uno de: ${tiposValidos.join(", ")}`);
      }
    }

    // Obtener historial del repositorio
    const historial = await this.asistenciaRepository.findByJugadorId(
      jugadorId,
      opciones
    );

    return historial;
  }
}
