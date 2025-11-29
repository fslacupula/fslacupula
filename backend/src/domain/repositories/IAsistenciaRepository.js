/**
 * @interface IAsistenciaRepository
 * @description Define el contrato para el repositorio de asistencias.
 * Gestiona tanto asistencias a partidos como a entrenamientos.
 */
export class IAsistenciaRepository {
  constructor() {
    if (this.constructor === IAsistenciaRepository) {
      throw new Error(
        "IAsistenciaRepository es una interfaz y no puede ser instanciada directamente"
      );
    }
  }

  /**
   * Registra una asistencia para un evento (partido o entrenamiento)
   * @param {Object} asistenciaData - Datos de la asistencia
   * @param {number} asistenciaData.jugadorId - ID del jugador
   * @param {number} [asistenciaData.partidoId] - ID del partido (si aplica)
   * @param {number} [asistenciaData.entrenamientoId] - ID del entrenamiento (si aplica)
   * @param {string} asistenciaData.estado - Estado: 'confirmado', 'ausente', 'pendiente'
   * @param {number} [asistenciaData.motivoAusenciaId] - ID del motivo (si ausente)
   * @param {string} [asistenciaData.comentario] - Comentario opcional
   * @returns {Promise<Object>} La asistencia creada
   */
  async registrar(asistenciaData) {
    throw new Error("Método registrar() debe ser implementado");
  }

  /**
   * Actualiza el estado de una asistencia existente
   * @param {number} id - ID de la asistencia
   * @param {Object} actualizaciones - Datos a actualizar
   * @param {string} [actualizaciones.estado] - Nuevo estado
   * @param {number} [actualizaciones.motivoAusenciaId] - Nuevo motivo
   * @param {string} [actualizaciones.comentario] - Nuevo comentario
   * @returns {Promise<Object>} La asistencia actualizada
   */
  async actualizar(id, actualizaciones) {
    throw new Error("Método actualizar() debe ser implementado");
  }

  /**
   * Busca una asistencia por ID
   * @param {number} id - ID de la asistencia
   * @returns {Promise<Object|null>} La asistencia o null
   */
  async findById(id) {
    throw new Error("Método findById() debe ser implementado");
  }

  /**
   * Busca una asistencia específica de un jugador a un evento
   * @param {number} jugadorId - ID del jugador
   * @param {number} [partidoId] - ID del partido
   * @param {number} [entrenamientoId] - ID del entrenamiento
   * @returns {Promise<Object|null>} La asistencia o null
   */
  async findByJugadorYEvento(
    jugadorId,
    partidoId = null,
    entrenamientoId = null
  ) {
    throw new Error("Método findByJugadorYEvento() debe ser implementado");
  }

  /**
   * Obtiene todas las asistencias de un partido
   * @param {number} partidoId - ID del partido
   * @returns {Promise<Array>} Array de asistencias
   */
  async findByPartidoId(partidoId) {
    throw new Error("Método findByPartidoId() debe ser implementado");
  }

  /**
   * Obtiene todas las asistencias de un entrenamiento
   * @param {number} entrenamientoId - ID del entrenamiento
   * @returns {Promise<Array>} Array de asistencias
   */
  async findByEntrenamientoId(entrenamientoId) {
    throw new Error("Método findByEntrenamientoId() debe ser implementado");
  }

  /**
   * Obtiene todas las asistencias de un jugador
   * @param {number} jugadorId - ID del jugador
   * @param {Object} [opciones] - Opciones de filtrado
   * @param {string} [opciones.tipo] - 'partido' o 'entrenamiento'
   * @param {Date} [opciones.fechaDesde] - Fecha desde
   * @param {Date} [opciones.fechaHasta] - Fecha hasta
   * @returns {Promise<Array>} Array de asistencias
   */
  async findByJugadorId(jugadorId, opciones = {}) {
    throw new Error("Método findByJugadorId() debe ser implementado");
  }

  /**
   * Obtiene estadísticas de asistencia de un jugador
   * @param {number} jugadorId - ID del jugador
   * @param {Object} [opciones] - Opciones de filtrado
   * @param {string} [opciones.tipo] - 'partido' o 'entrenamiento'
   * @param {Date} [opciones.fechaDesde] - Fecha desde
   * @param {Date} [opciones.fechaHasta] - Fecha hasta
   * @returns {Promise<Object>} Estadísticas { total, confirmados, ausentes, pendientes, porcentajeAsistencia }
   */
  async getEstadisticasByJugador(jugadorId, opciones = {}) {
    throw new Error("Método getEstadisticasByJugador() debe ser implementado");
  }

  /**
   * Obtiene estadísticas de asistencia de un evento
   * @param {number} [partidoId] - ID del partido
   * @param {number} [entrenamientoId] - ID del entrenamiento
   * @returns {Promise<Object>} Estadísticas { total, confirmados, ausentes, pendientes, porcentajeAsistencia }
   */
  async getEstadisticasByEvento(partidoId = null, entrenamientoId = null) {
    throw new Error("Método getEstadisticasByEvento() debe ser implementado");
  }

  /**
   * Elimina una asistencia
   * @param {number} id - ID de la asistencia
   * @returns {Promise<boolean>} true si se eliminó correctamente
   */
  async delete(id) {
    throw new Error("Método delete() debe ser implementado");
  }

  /**
   * Registra asistencias para múltiples jugadores a un evento
   * @param {Array<Object>} asistencias - Array de datos de asistencias
   * @returns {Promise<Array>} Array de asistencias creadas
   */
  async registrarMasivo(asistencias) {
    throw new Error("Método registrarMasivo() debe ser implementado");
  }

  /**
   * Verifica si existe una asistencia para un jugador en un evento
   * @param {number} jugadorId - ID del jugador
   * @param {number} [partidoId] - ID del partido
   * @param {number} [entrenamientoId] - ID del entrenamiento
   * @returns {Promise<boolean>} true si existe
   */
  async existe(jugadorId, partidoId = null, entrenamientoId = null) {
    throw new Error("Método existe() debe ser implementado");
  }
}
