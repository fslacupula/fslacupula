/**
 * @class RegistrarAsistenciaUseCase
 * @description Registra la asistencia de un jugador a un evento (partido o entrenamiento)
 */
export class RegistrarAsistenciaUseCase {
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
   * Registra una asistencia para un evento
   * @param {Object} datos - Datos de la asistencia
   * @param {number} datos.jugadorId - ID del jugador
   * @param {number} [datos.partidoId] - ID del partido (si aplica)
   * @param {number} [datos.entrenamientoId] - ID del entrenamiento (si aplica)
   * @param {string} datos.estado - Estado: 'confirmado', 'ausente', 'pendiente'
   * @param {number} [datos.motivoAusenciaId] - ID del motivo (si ausente)
   * @param {string} [datos.comentario] - Comentario opcional
   * @returns {Promise<Object>} La asistencia creada
   */
  async execute(datos) {
    // Validar que se proporciona el jugadorId
    if (!datos.jugadorId) {
      throw new Error("jugadorId es requerido");
    }

    // Validar que se proporciona al menos un evento (partido o entrenamiento)
    if (!datos.partidoId && !datos.entrenamientoId) {
      throw new Error("Debe proporcionar partidoId o entrenamientoId");
    }

    // Validar que no se proporcionan ambos eventos
    if (datos.partidoId && datos.entrenamientoId) {
      throw new Error(
        "No puede proporcionar partidoId y entrenamientoId al mismo tiempo"
      );
    }

    // Validar el estado
    if (!datos.estado) {
      throw new Error("estado es requerido");
    }

    const estadosValidos = ["confirmado", "ausente", "pendiente"];
    if (!estadosValidos.includes(datos.estado)) {
      throw new Error(`estado debe ser uno de: ${estadosValidos.join(", ")}`);
    }

    // Validar que el jugador existe (jugadorId puede ser el ID del jugador o el usuarioId)
    // Intentar primero por usuarioId ya que es más común desde el frontend
    let jugador = await this.jugadorRepository.findByUsuarioId(datos.jugadorId);
    if (!jugador) {
      // Si no se encuentra por usuarioId, intentar por ID de jugador
      jugador = await this.jugadorRepository.findById(datos.jugadorId);
    }
    if (!jugador) {
      throw new Error(`Jugador con ID ${datos.jugadorId} no encontrado`);
    }

    // Validar que si el estado es 'ausente', se proporciona un motivo
    if (datos.estado === "ausente" && !datos.motivoAusenciaId) {
      throw new Error(
        "motivoAusenciaId es requerido cuando el estado es 'ausente'"
      );
    }

    // Verificar que no exista ya una asistencia para este jugador y evento
    const asistenciaExistente =
      await this.asistenciaRepository.findByJugadorYEvento(
        datos.jugadorId,
        datos.partidoId,
        datos.entrenamientoId
      );

    if (asistenciaExistente) {
      throw new Error("Ya existe una asistencia para este jugador y evento");
    }

    // Registrar la asistencia
    const asistencia = await this.asistenciaRepository.registrar({
      jugadorId: datos.jugadorId,
      partidoId: datos.partidoId || null,
      entrenamientoId: datos.entrenamientoId || null,
      estado: datos.estado,
      motivoAusenciaId: datos.motivoAusenciaId || null,
      comentario: datos.comentario || null,
    });

    return asistencia;
  }
}
