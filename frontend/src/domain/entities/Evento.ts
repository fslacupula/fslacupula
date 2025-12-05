import { FechaHora } from "../valueObjects/FechaHora";

export interface AsistenciaJugadorDTO {
  jugador_id: number;
  jugador_nombre: string;
  estado: string;
  motivo_ausencia_id?: number;
  motivo_nombre?: string;
  comentarios?: string;
}

export interface AsistenciaJugador {
  jugadorId: number;
  jugadorNombre: string;
  estado: string;
  motivoAusenciaId?: number;
  motivoNombre?: string;
  comentarios?: string;
}

// Clase base abstracta para eventos
export abstract class Evento {
  constructor(
    public readonly id: number,
    public readonly fechaHora: FechaHora,
    public readonly hora: string,
    public readonly ubicacion: string,
    public readonly asistencias: AsistenciaJugador[] = []
  ) {
    this.validate();
  }

  protected validate(): void {
    if (!this.ubicacion || this.ubicacion.trim().length === 0) {
      throw new Error("La ubicación es requerida");
    }
    if (!this.hora || !/^\d{2}:\d{2}$/.test(this.hora)) {
      throw new Error("La hora debe estar en formato HH:MM");
    }
  }

  abstract getTipo(): "entrenamiento" | "partido";

  obtenerAsistenciasConfirmadas(): AsistenciaJugador[] {
    return this.asistencias.filter((a) => a.estado === "confirmado");
  }

  obtenerAsistenciasAusentes(): AsistenciaJugador[] {
    return this.asistencias.filter((a) => a.estado === "no_asiste");
  }

  obtenerAsistenciasPendientes(): AsistenciaJugador[] {
    return this.asistencias.filter((a) => a.estado === "pendiente");
  }

  contarAsistencias(): {
    confirmados: number;
    ausentes: number;
    pendientes: number;
  } {
    return {
      confirmados: this.obtenerAsistenciasConfirmadas().length,
      ausentes: this.obtenerAsistenciasAusentes().length,
      pendientes: this.obtenerAsistenciasPendientes().length,
    };
  }

  protected static mapAsistencias(
    asistencias?: AsistenciaJugadorDTO[]
  ): AsistenciaJugador[] {
    if (!asistencias) return [];
    return asistencias.map((a) => ({
      jugadorId: a.jugador_id,
      jugadorNombre: a.jugador_nombre,
      estado: a.estado,
      motivoAusenciaId: a.motivo_ausencia_id,
      motivoNombre: a.motivo_nombre,
      comentarios: a.comentarios,
    }));
  }
}
