/**
 * @class ActualizarEstadoAsistenciaUseCase
 * @description Actualiza el estado de una asistencia existente
 */
export class ActualizarEstadoAsistenciaUseCase {
  constructor(asistenciaRepository) {
    if (!asistenciaRepository) {
      throw new Error("asistenciaRepository es requerido");
    }

    this.asistenciaRepository = asistenciaRepository;
  }

  /**
   * Actualiza el estado de una asistencia
   * @param {number} asistenciaId - ID de la asistencia
   * @param {Object} actualizaciones - Datos a actualizar
   * @param {string} [actualizaciones.estado] - Nuevo estado
   * @param {number} [actualizaciones.motivoAusenciaId] - Nuevo motivo (si ausente)
   * @param {string} [actualizaciones.comentario] - Nuevo comentario
   * @returns {Promise<Object>} La asistencia actualizada
   */
  async execute(asistenciaId, actualizaciones) {
    // Validar que se proporciona el ID
    if (!asistenciaId) {
      throw new Error("asistenciaId es requerido");
    }

    // Validar que se proporciona al menos un campo para actualizar
    if (
      actualizaciones.estado === undefined &&
      actualizaciones.motivoAusenciaId === undefined &&
      actualizaciones.comentario === undefined
    ) {
      throw new Error("Debe proporcionar al menos un campo para actualizar");
    }

    // Verificar que la asistencia existe
    const asistencia = await this.asistenciaRepository.findById(asistenciaId);
    if (!asistencia) {
      throw new Error(`Asistencia con ID ${asistenciaId} no encontrada`);
    }

    // Si se actualiza el estado, validarlo
    if (actualizaciones.estado !== undefined) {
      const estadosValidos = ["confirmado", "ausente", "pendiente"];
      if (!estadosValidos.includes(actualizaciones.estado)) {
        throw new Error(`estado debe ser uno de: ${estadosValidos.join(", ")}`);
      }

      // Si el nuevo estado es 'ausente', debe tener un motivo
      if (
        actualizaciones.estado === "ausente" &&
        !actualizaciones.motivoAusenciaId &&
        !asistencia.motivoAusenciaId
      ) {
        throw new Error(
          "motivoAusenciaId es requerido cuando el estado es 'ausente'"
        );
      }
    }

    // Si el estado actual es 'ausente' y se está cambiando a otro estado,
    // podemos limpiar el motivo de ausencia
    if (
      asistencia.estado === "ausente" &&
      actualizaciones.estado &&
      actualizaciones.estado !== "ausente" &&
      actualizaciones.motivoAusenciaId === undefined
    ) {
      actualizaciones.motivoAusenciaId = null;
    }

    // Actualizar la asistencia
    const asistenciaActualizada = await this.asistenciaRepository.actualizar(
      asistenciaId,
      actualizaciones
    );

    return asistenciaActualizada;
  }
}
