import { Entrenamiento, Partido } from "@domain";
import type {
  IEventoRepository,
  CrearEntrenamientoDTO,
  CrearPartidoDTO,
} from "../repositories";

/**
 * Caso de uso: Crear Evento
 *
 * Permite a un gestor crear nuevos entrenamientos o partidos.
 * Valida que los datos sean correctos antes de crear.
 */
export class CrearEventoUseCase {
  constructor(private readonly eventoRepository: IEventoRepository) {}

  /**
   * Crea un nuevo entrenamiento
   * @param datos Datos del entrenamiento
   * @returns Promise con el entrenamiento creado
   * @throws Error si faltan datos obligatorios o son inválidos
   */
  async crearEntrenamiento(
    datos: CrearEntrenamientoDTO
  ): Promise<Entrenamiento> {
    // Validaciones de negocio
    this.validarFecha(datos.fecha);
    this.validarHora(datos.hora);
    this.validarUbicacion(datos.ubicacion);

    if (datos.duracionMinutos && datos.duracionMinutos <= 0) {
      throw new Error("La duración debe ser mayor a 0 minutos");
    }

    // Delegar al repositorio
    return await this.eventoRepository.crearEntrenamiento(datos);
  }

  /**
   * Crea un nuevo partido
   * @param datos Datos del partido
   * @returns Promise con el partido creado
   * @throws Error si faltan datos obligatorios o son inválidos
   */
  async crearPartido(datos: CrearPartidoDTO): Promise<Partido> {
    // Validaciones de negocio
    this.validarFecha(datos.fecha);
    this.validarHora(datos.hora);
    this.validarUbicacion(datos.ubicacion);
    this.validarRival(datos.rival);
    this.validarTipoPartido(datos.tipo);

    // Delegar al repositorio
    return await this.eventoRepository.crearPartido(datos);
  }

  // ==================== VALIDACIONES ====================

  private validarFecha(fecha: string): void {
    // Validar formato YYYY-MM-DD
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(fecha)) {
      throw new Error("Formato de fecha inválido. Usa YYYY-MM-DD");
    }

    // Validar que sea una fecha válida
    const date = new Date(fecha);
    if (isNaN(date.getTime())) {
      throw new Error("Fecha inválida");
    }

    // Opcional: Validar que no sea muy antigua (por ejemplo, no más de 1 año atrás)
    const unAñoAtras = new Date();
    unAñoAtras.setFullYear(unAñoAtras.getFullYear() - 1);
    if (date < unAñoAtras) {
      throw new Error("La fecha no puede ser más antigua de 1 año");
    }
  }

  private validarHora(hora: string): void {
    // Validar formato HH:MM
    const regex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!regex.test(hora)) {
      throw new Error("Formato de hora inválido. Usa HH:MM");
    }
  }

  private validarUbicacion(ubicacion: string): void {
    if (!ubicacion || ubicacion.trim().length === 0) {
      throw new Error("La ubicación es obligatoria");
    }

    if (ubicacion.trim().length < 3) {
      throw new Error("La ubicación debe tener al menos 3 caracteres");
    }
  }

  private validarRival(rival: string): void {
    if (!rival || rival.trim().length === 0) {
      throw new Error("El rival es obligatorio");
    }

    if (rival.trim().length < 2) {
      throw new Error("El nombre del rival debe tener al menos 2 caracteres");
    }
  }

  private validarTipoPartido(
    tipo: "amistoso" | "liga" | "copa" | "torneo"
  ): void {
    const tiposValidos = ["amistoso", "liga", "copa", "torneo"];
    if (!tiposValidos.includes(tipo)) {
      throw new Error(
        `Tipo de partido inválido. Usa: ${tiposValidos.join(", ")}`
      );
    }
  }
}
