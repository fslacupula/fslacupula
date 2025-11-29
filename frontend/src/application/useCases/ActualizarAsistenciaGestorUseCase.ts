import { Asistencia, EstadoAsistencia } from "@domain";
import type {
  IAsistenciaRepository,
  RegistrarAsistenciaDTO,
} from "../repositories";

/**
 * Caso de uso: Actualizar Asistencia (Gestor)
 *
 * Permite a un gestor modificar la asistencia de cualquier jugador.
 * A diferencia del caso de uso de jugador, el gestor puede:
 * - Marcar asistencia sin que el jugador la haya confirmado
 * - Cambiar estados previamente registrados
 * - Marcar ausente sin motivo (opcional para gestor)
 */
export class ActualizarAsistenciaGestorUseCase {
  constructor(private readonly asistenciaRepository: IAsistenciaRepository) {}

  /**
   * Ejecuta el caso de uso con permisos de gestor
   * @param datos Datos de la asistencia a actualizar
   * @param permiteAusenteSinMotivo Si true, permite ausente sin motivo (por defecto false)
   * @returns Promise con la asistencia actualizada
   */
  async execute(
    datos: RegistrarAsistenciaDTO,
    permiteAusenteSinMotivo: boolean = false
  ): Promise<Asistencia> {
    // Validación menos estricta para gestor
    if (
      datos.estado === EstadoAsistencia.AUSENTE &&
      !datos.motivoAusenciaId &&
      !permiteAusenteSinMotivo
    ) {
      throw new Error(
        "Aunque eres gestor, es recomendable registrar el motivo de ausencia"
      );
    }

    // Delegar al repositorio
    return await this.asistenciaRepository.registrar(datos);
  }

  /**
   * Marca a un jugador como confirmado (gestor lo confirma manualmente)
   * @param jugadorId ID del jugador
   * @param eventoId ID del evento
   * @param tipoEvento Tipo de evento
   * @param comentario Comentario del gestor
   */
  async marcarComoConfirmado(
    jugadorId: number,
    eventoId: number,
    tipoEvento: "entrenamiento" | "partido",
    comentario?: string
  ): Promise<Asistencia> {
    return await this.execute({
      jugadorId,
      eventoId,
      tipoEvento,
      estado: EstadoAsistencia.CONFIRMADO,
      comentario,
    });
  }

  /**
   * Marca a un jugador como ausente
   * @param jugadorId ID del jugador
   * @param eventoId ID del evento
   * @param tipoEvento Tipo de evento
   * @param motivoAusenciaId ID del motivo (opcional para gestor)
   * @param comentario Comentario del gestor
   * @param permiteAusenteSinMotivo Si permite ausente sin motivo
   */
  async marcarComoAusente(
    jugadorId: number,
    eventoId: number,
    tipoEvento: "entrenamiento" | "partido",
    motivoAusenciaId?: number,
    comentario?: string,
    permiteAusenteSinMotivo: boolean = false
  ): Promise<Asistencia> {
    return await this.execute(
      {
        jugadorId,
        eventoId,
        tipoEvento,
        estado: EstadoAsistencia.AUSENTE,
        motivoAusenciaId,
        comentario,
      },
      permiteAusenteSinMotivo
    );
  }

  /**
   * Marca a un jugador como pendiente (resetea su asistencia)
   * @param jugadorId ID del jugador
   * @param eventoId ID del evento
   * @param tipoEvento Tipo de evento
   */
  async marcarComoPendiente(
    jugadorId: number,
    eventoId: number,
    tipoEvento: "entrenamiento" | "partido"
  ): Promise<Asistencia> {
    return await this.execute({
      jugadorId,
      eventoId,
      tipoEvento,
      estado: EstadoAsistencia.PENDIENTE,
    });
  }

  /**
   * Actualiza el comentario de una asistencia existente
   * @param jugadorId ID del jugador
   * @param eventoId ID del evento
   * @param tipoEvento Tipo de evento
   * @param comentario Nuevo comentario
   */
  async actualizarComentario(
    jugadorId: number,
    eventoId: number,
    tipoEvento: "entrenamiento" | "partido",
    comentario: string
  ): Promise<Asistencia> {
    // Primero obtener la asistencia actual para mantener el estado
    const asistenciaActual = await this.asistenciaRepository.obtenerAsistencia(
      jugadorId,
      eventoId,
      tipoEvento
    );

    if (!asistenciaActual) {
      throw new Error("No existe asistencia para actualizar");
    }

    return await this.execute({
      jugadorId,
      eventoId,
      tipoEvento,
      estado: asistenciaActual.estado.getValue() as
        | "confirmado"
        | "ausente"
        | "pendiente",
      motivoAusenciaId: asistenciaActual.motivoAusenciaId,
      comentario,
    });
  }
}
