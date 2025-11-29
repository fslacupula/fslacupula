// Value Object para manejo de fechas y horas
export class FechaHora {
  private readonly fecha: Date;

  constructor(fechaString: string, hora?: string) {
    if (hora) {
      // Combinar fecha y hora sin conversión de zona horaria
      const [year, month, day] = fechaString.split("-").map(Number);
      const [hours, minutes] = hora.split(":").map(Number);
      this.fecha = new Date(year, month - 1, day, hours, minutes);
    } else {
      // Si solo viene fecha o fecha con hora ISO
      const [datePart] = fechaString.split("T");
      const [year, month, day] = datePart.split("-").map(Number);
      this.fecha = new Date(year, month - 1, day);
    }
  }

  getFecha(): Date {
    return new Date(this.fecha);
  }

  getFechaString(): string {
    const year = this.fecha.getFullYear();
    const month = String(this.fecha.getMonth() + 1).padStart(2, "0");
    const day = String(this.fecha.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  getHoraString(): string {
    const hours = String(this.fecha.getHours()).padStart(2, "0");
    const minutes = String(this.fecha.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  }

  formatearLargo(): string {
    return this.fecha.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  esAntesDe(otra: FechaHora): boolean {
    return this.fecha < otra.fecha;
  }

  esDespuesDe(otra: FechaHora): boolean {
    return this.fecha > otra.fecha;
  }

  static hoy(): FechaHora {
    const ahora = new Date();
    const year = ahora.getFullYear();
    const month = String(ahora.getMonth() + 1).padStart(2, "0");
    const day = String(ahora.getDate()).padStart(2, "0");
    return new FechaHora(`${year}-${month}-${day}`);
  }
}
