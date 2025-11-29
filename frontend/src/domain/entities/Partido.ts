import { FechaHora } from "../valueObjects/FechaHora";
import { Evento, AsistenciaJugador, AsistenciaJugadorDTO } from "./Evento";

export type TipoPartido = "amistoso" | "liga" | "copa" | "torneo";

export interface PartidoDTO {
  id: number;
  fecha: string;
  hora: string;
  ubicacion: string;
  rival: string;
  tipo: TipoPartido;
  es_local: boolean;
  resultado?: string;
  estado?: string;
  asistencias?: AsistenciaJugadorDTO[];
}

export class Partido extends Evento {
  constructor(
    id: number,
    fechaHora: FechaHora,
    hora: string,
    ubicacion: string,
    public readonly rival: string,
    public readonly tipo: TipoPartido,
    public readonly esLocal: boolean,
    public readonly resultado?: string,
    public readonly estado?: string,
    asistencias: AsistenciaJugador[] = []
  ) {
    super(id, fechaHora, hora, ubicacion, asistencias);
    this.validatePartido();
  }

  private validatePartido(): void {
    if (!this.rival || this.rival.trim().length === 0) {
      throw new Error("El rival es requerido");
    }
    const tiposValidos: TipoPartido[] = ["amistoso", "liga", "copa", "torneo"];
    if (!tiposValidos.includes(this.tipo)) {
      throw new Error("Tipo de partido inválido");
    }
  }

  getTipo(): "partido" {
    return "partido";
  }

  esPartidoLocal(): boolean {
    return this.esLocal;
  }

  esPartidoVisitante(): boolean {
    return !this.esLocal;
  }

  tieneResultado(): boolean {
    return !!this.resultado && this.resultado.trim().length > 0;
  }

  esAmistoso(): boolean {
    return this.tipo === "amistoso";
  }

  esLiga(): boolean {
    return this.tipo === "liga";
  }

  // Factory method para crear desde DTO
  static fromDTO(dto: PartidoDTO): Partido {
    const fechaHora = new FechaHora(dto.fecha, dto.hora);
    const asistencias = Evento.mapAsistencias(dto.asistencias);

    return new Partido(
      dto.id,
      fechaHora,
      dto.hora,
      dto.ubicacion,
      dto.rival,
      dto.tipo,
      dto.es_local,
      dto.resultado,
      dto.estado,
      asistencias
    );
  }

  // Método para convertir a DTO (para enviar al backend)
  toDTO(): Partial<PartidoDTO> {
    return {
      fecha: this.fechaHora.getFechaString(),
      hora: this.hora,
      ubicacion: this.ubicacion,
      rival: this.rival,
      tipo: this.tipo,
      es_local: this.esLocal,
      resultado: this.resultado,
    };
  }
}
