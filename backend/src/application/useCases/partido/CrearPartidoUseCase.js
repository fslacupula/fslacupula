import { Partido } from "../../../domain/entities/Partido.js";
import { ValidationError } from "../../../domain/errors/index.js";

/**
 * Caso de Uso: Crear Partido
 *
 * Responsabilidad: Crear un nuevo partido validando todos los datos requeridos.
 *
 * Flujo:
 * 1. Validar datos requeridos
 * 2. Validar tipo de partido
 * 3. Crear entidad Partido
 * 4. Persistir en el repositorio
 * 5. Retornar el partido creado
 */
export class CrearPartidoUseCase {
  /**
   * @param {IPartidoRepository} partidoRepository - Repositorio de partidos
   */
  constructor(partidoRepository) {
    if (!partidoRepository) {
      throw new Error("partidoRepository is required");
    }
    this.partidoRepository = partidoRepository;
  }

  /**
   * Ejecuta el caso de uso
   *
   * @param {Object} datos - Datos del partido
   * @param {Date|string} datos.fechaHora - Fecha y hora del partido
   * @param {string} datos.rival - Nombre del rival
   * @param {string} datos.lugar - Lugar del partido
   * @param {string} datos.tipo - Tipo de partido (liga, amistoso, copa, torneo)
   * @param {boolean} datos.esLocal - Si el partido es local o visitante
   * @param {number} datos.creadoPor - ID del usuario que crea el partido
   * @param {string} [datos.observaciones] - Observaciones opcionales
   * @returns {Promise<Object>} Partido creado
   * @throws {ValidationError} Si los datos son inválidos
   */
  async execute(datos) {
    // Validar datos requeridos
    if (!datos.fechaHora) {
      throw new ValidationError("La fecha y hora del partido son requeridas");
    }

    if (!datos.rival) {
      throw new ValidationError("El rival es requerido");
    }

    if (!datos.lugar) {
      throw new ValidationError("El lugar es requerido");
    }

    if (!datos.tipo) {
      throw new ValidationError("El tipo de partido es requerido");
    }

    if (datos.esLocal === undefined || datos.esLocal === null) {
      throw new ValidationError(
        "Debe indicar si el partido es local o visitante"
      );
    }

    if (!datos.creadoPor) {
      throw new ValidationError("El ID del usuario creador es requerido");
    }

    // Validar tipo de partido
    if (!Object.values(Partido.TIPOS).includes(datos.tipo)) {
      throw new ValidationError(
        `Tipo de partido inválido. Debe ser uno de: ${Object.values(
          Partido.TIPOS
        ).join(", ")}`
      );
    }

    // Crear entidad Partido
    const partido = new Partido({
      id: null,
      fechaHora: datos.fechaHora,
      rival: datos.rival,
      lugar: datos.lugar,
      tipo: datos.tipo,
      esLocal: datos.esLocal,
      creadoPor: datos.creadoPor,
      resultado: null,
      observaciones: datos.observaciones || null,
    });

    // Persistir
    const partidoCreado = await this.partidoRepository.create(partido);

    return partidoCreado.toObject();
  }
}
