import { Asistencia } from "@domain";

/**
 * Datos para registrar/actualizar asistencia
 */
export interface RegistrarAsistenciaDTO {
  jugadorId: number;
  eventoId: number;
  tipoEvento: "entrenamiento" | "partido";
  estado: "confirmado" | "ausente" | "pendiente";
  motivoAusenciaId?: number;
  comentario?: string;
}

/**
 * Interfaz del repositorio de asistencias
 * Define las operaciones para gestionar asistencias a eventos
 */
export interface IAsistenciaRepository {
  /**
   * Registra o actualiza la asistencia de un jugador a un evento
   * @param datos Datos de la asistencia
   * @returns Promise con la asistencia creada/actualizada
   */
  registrar(datos: RegistrarAsistenciaDTO): Promise<Asistencia>;

  /**
   * Obtiene la asistencia de un jugador a un evento específico
   * @param jugadorId ID del jugador
   * @param eventoId ID del evento
   * @param tipoEvento Tipo de evento
   * @returns Promise con la asistencia o null si no existe
   */
  obtenerAsistencia(
    jugadorId: number,
    eventoId: number,
    tipoEvento: "entrenamiento" | "partido"
  ): Promise<Asistencia | null>;

  /**
   * Obtiene todas las asistencias de un evento
   * @param eventoId ID del evento
   * @param tipoEvento Tipo de evento
   * @returns Promise con array de asistencias
   */
  obtenerAsistenciasEvento(
    eventoId: number,
    tipoEvento: "entrenamiento" | "partido"
  ): Promise<Asistencia[]>;

  /**
   * Obtiene todas las asistencias de un jugador
   * @param jugadorId ID del jugador
   * @param fechaDesde Fecha desde (opcional)
   * @param fechaHasta Fecha hasta (opcional)
   * @returns Promise con array de asistencias
   */
  obtenerAsistenciasJugador(
    jugadorId: number,
    fechaDesde?: string,
    fechaHasta?: string
  ): Promise<Asistencia[]>;

  /**
   * Elimina una asistencia (solo para gestores)
   * @param jugadorId ID del jugador
   * @param eventoId ID del evento
   * @param tipoEvento Tipo de evento
   * @returns Promise que se resuelve cuando se elimina
   */
  eliminar(
    jugadorId: number,
    eventoId: number,
    tipoEvento: "entrenamiento" | "partido"
  ): Promise<void>;
}
