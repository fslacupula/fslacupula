// Value Object para Estado de Asistencia
export enum EstadoAsistencia {
  CONFIRMADO = "confirmado",
  AUSENTE = "ausente",
  PENDIENTE = "pendiente",
}

export class EstadoAsistenciaVO {
  private readonly value: EstadoAsistencia;

  constructor(estado: string) {
    this.validate(estado);
    this.value = estado as EstadoAsistencia;
  }

  private validate(estado: string): void {
    const validStates = Object.values(EstadoAsistencia);
    if (!validStates.includes(estado as EstadoAsistencia)) {
      throw new Error(
        `Estado inválido: ${estado}. Debe ser uno de: ${validStates.join(", ")}`
      );
    }
  }

  getValue(): EstadoAsistencia {
    return this.value;
  }

  toString(): string {
    return this.value;
  }

  equals(other: EstadoAsistenciaVO): boolean {
    return this.value === other.value;
  }

  esConfirmado(): boolean {
    return this.value === EstadoAsistencia.CONFIRMADO;
  }

  esAusente(): boolean {
    return this.value === EstadoAsistencia.AUSENTE;
  }

  esPendiente(): boolean {
    return this.value === EstadoAsistencia.PENDIENTE;
  }
}
