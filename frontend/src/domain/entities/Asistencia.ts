import {
  EstadoAsistenciaVO,
  EstadoAsistencia,
} from "../valueObjects/EstadoAsistencia";

export interface AsistenciaDTO {
  jugador_id: number;
  evento_id: number;
  tipo_evento: "entrenamiento" | "partido";
  estado: string;
  motivo_ausencia_id?: number;
  comentario?: string;
}

export class Asistencia {
  constructor(
    public readonly jugadorId: number,
    public readonly eventoId: number,
    public readonly tipoEvento: "entrenamiento" | "partido",
    public readonly estado: EstadoAsistenciaVO,
    public readonly motivoAusenciaId?: number,
    public readonly comentario?: string
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.jugadorId || this.jugadorId <= 0) {
      throw new Error("ID de jugador inválido");
    }
    if (!this.eventoId || this.eventoId <= 0) {
      throw new Error("ID de evento inválido");
    }
    if (!["entrenamiento", "partido"].includes(this.tipoEvento)) {
      throw new Error("Tipo de evento inválido");
    }
    // Si está ausente, debe tener motivo
    if (this.estado.esAusente() && !this.motivoAusenciaId) {
      throw new Error("El motivo de ausencia es requerido cuando no se asiste");
    }
  }

  esConfirmado(): boolean {
    return this.estado.esConfirmado();
  }

  esAusente(): boolean {
    return this.estado.esAusente();
  }

  esPendiente(): boolean {
    return this.estado.esPendiente();
  }

  tieneComentario(): boolean {
    return !!this.comentario && this.comentario.trim().length > 0;
  }

  // Factory method para crear desde DTO
  static fromDTO(dto: AsistenciaDTO): Asistencia {
    return new Asistencia(
      dto.jugador_id,
      dto.evento_id,
      dto.tipo_evento,
      new EstadoAsistenciaVO(dto.estado),
      dto.motivo_ausencia_id,
      dto.comentario
    );
  }

  // Método para convertir a DTO (para enviar al backend)
  toDTO(): Partial<AsistenciaDTO> {
    const dto: Partial<AsistenciaDTO> = {
      estado: this.estado.getValue(),
    };

    if (this.motivoAusenciaId) {
      dto.motivo_ausencia_id = this.motivoAusenciaId;
    }

    if (this.comentario) {
      dto.comentario = this.comentario;
    }

    return dto;
  }

  // Helper para crear asistencia confirmada
  static crearConfirmada(
    jugadorId: number,
    eventoId: number,
    tipoEvento: "entrenamiento" | "partido",
    comentario?: string
  ): Asistencia {
    return new Asistencia(
      jugadorId,
      eventoId,
      tipoEvento,
      new EstadoAsistenciaVO(EstadoAsistencia.CONFIRMADO),
      undefined,
      comentario
    );
  }

  // Helper para crear asistencia ausente
  static crearAusente(
    jugadorId: number,
    eventoId: number,
    tipoEvento: "entrenamiento" | "partido",
    motivoAusenciaId: number,
    comentario?: string
  ): Asistencia {
    return new Asistencia(
      jugadorId,
      eventoId,
      tipoEvento,
      new EstadoAsistenciaVO(EstadoAsistencia.AUSENTE),
      motivoAusenciaId,
      comentario
    );
  }
}
