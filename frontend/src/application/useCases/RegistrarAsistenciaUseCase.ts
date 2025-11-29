import { Asistencia, EstadoAsistencia } from "@domain";
import type {
  IAsistenciaRepository,
  RegistrarAsistenciaDTO,
} from "../repositories";

/**
 * Caso de uso: Registrar Asistencia
 *
 * Permite a un jugador confirmar o declinar su asistencia a un evento.
 * Valida que si el jugador marca ausencia, debe proporcionar un motivo.
 */
export class RegistrarAsistenciaUseCase {
  constructor(private readonly asistenciaRepository: IAsistenciaRepository) {}

  /**
   * Ejecuta el caso de uso
   * @param datos Datos de la asistencia a registrar
   * @returns Promise con la asistencia registrada
   * @throws Error si falta el motivo de ausencia cuando el estado es 'ausente'
   */
  async execute(datos: RegistrarAsistenciaDTO): Promise<Asistencia> {
    // Validación de negocio: ausente requiere motivo
    if (datos.estado === EstadoAsistencia.AUSENTE && !datos.motivoAusenciaId) {
      throw new Error("Debes seleccionar un motivo de ausencia");
    }

    // Validación: pendiente no debería tener motivo
    if (datos.estado === EstadoAsistencia.PENDIENTE && datos.motivoAusenciaId) {
      throw new Error("Un estado pendiente no puede tener motivo de ausencia");
    }

    // Delegar al repositorio
    return await this.asistenciaRepository.registrar(datos);
  }

  /**
   * Confirma asistencia de un jugador
   * @param jugadorId ID del jugador
   * @param eventoId ID del evento
   * @param tipoEvento Tipo de evento
   * @param comentario Comentario opcional
   */
  async confirmar(
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
   * Declina asistencia de un jugador
   * @param jugadorId ID del jugador
   * @param eventoId ID del evento
   * @param tipoEvento Tipo de evento
   * @param motivoAusenciaId ID del motivo de ausencia (OBLIGATORIO)
   * @param comentario Comentario opcional
   */
  async declinar(
    jugadorId: number,
    eventoId: number,
    tipoEvento: "entrenamiento" | "partido",
    motivoAusenciaId: number,
    comentario?: string
  ): Promise<Asistencia> {
    return await this.execute({
      jugadorId,
      eventoId,
      tipoEvento,
      estado: EstadoAsistencia.AUSENTE,
      motivoAusenciaId,
      comentario,
    });
  }
}
