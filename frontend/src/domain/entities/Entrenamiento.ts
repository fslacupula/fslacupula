import { FechaHora } from "../valueObjects/FechaHora";
import { Evento, AsistenciaJugador, AsistenciaJugadorDTO } from "./Evento";

export interface EntrenamientoDTO {
  id: number;
  fecha: string;
  hora: string;
  ubicacion: string;
  descripcion?: string;
  duracion_minutos?: number;
  estado?: string;
  asistencias?: AsistenciaJugadorDTO[];
}

export class Entrenamiento extends Evento {
  constructor(
    id: number,
    fechaHora: FechaHora,
    hora: string,
    ubicacion: string,
    public readonly descripcion?: string,
    public readonly duracionMinutos?: number,
    public readonly estado?: string,
    asistencias: AsistenciaJugador[] = []
  ) {
    super(id, fechaHora, hora, ubicacion, asistencias);
  }

  getTipo(): "entrenamiento" {
    return "entrenamiento";
  }

  tieneDuracion(): boolean {
    return !!this.duracionMinutos && this.duracionMinutos > 0;
  }

  // Factory method para crear desde DTO
  static fromDTO(dto: EntrenamientoDTO): Entrenamiento {
    const fechaHora = new FechaHora(dto.fecha, dto.hora);
    const asistencias = Evento.mapAsistencias(dto.asistencias);

    return new Entrenamiento(
      dto.id,
      fechaHora,
      dto.hora,
      dto.ubicacion,
      dto.descripcion,
      dto.duracion_minutos,
      dto.estado,
      asistencias
    );
  }

  // Método para convertir a DTO (para enviar al backend)
  toDTO(): Partial<EntrenamientoDTO> {
    return {
      fecha: this.fechaHora.getFechaString(),
      hora: this.hora,
      ubicacion: this.ubicacion,
      descripcion: this.descripcion,
      duracion_minutos: this.duracionMinutos,
    };
  }
}
