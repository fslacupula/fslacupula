import { ValidationError } from "../../../domain/errors/index.js";

/**
 * Caso de Uso: Actualizar Partido
 *
 * Responsabilidad: Actualizar los datos de un partido existente.
 *
 * Flujo:
 * 1. Validar que partidoId es requerido
 * 2. Validar que se proporciona al menos un campo para actualizar
 * 3. Buscar el partido
 * 4. Validar que el partido existe
 * 5. Actualizar campos proporcionados
 * 6. Persistir los cambios
 * 7. Retornar el partido actualizado
 */
export class ActualizarPartidoUseCase {
  /**
   * @param {IPartidoRepository} partidoRepository - Repositorio de partidos
   */
  constructor(partidoRepository) {
    if (!partidoRepository) {
      throw new Error("partidoRepository es requerido");
    }
    this.partidoRepository = partidoRepository;
  }

  /**
   * Ejecuta el caso de uso
   *
   * @param {string|number} partidoId - ID del partido
   * @param {Object} datos - Datos a actualizar
   * @param {Date|string} [datos.fechaHora] - Nueva fecha y hora
   * @param {string} [datos.rival] - Nuevo rival
   * @param {string} [datos.lugar] - Nuevo lugar
   * @param {string} [datos.tipo] - Nuevo tipo
   * @param {boolean} [datos.esLocal] - Si es local o visitante
   * @param {string} [datos.observaciones] - Nuevas observaciones
   * @returns {Promise<Object>} Partido actualizado
   * @throws {ValidationError} Si el partido no existe o los datos son inválidos
   */
  async execute(partidoId, datos) {
    // Validar partidoId
    if (!partidoId) {
      throw new ValidationError("El ID del partido es requerido");
    }

    // Validar que se proporciona al menos un campo
    const camposActualizables = [
      "fechaHora",
      "rival",
      "lugar",
      "tipo",
      "esLocal",
      "observaciones",
    ];
    const hayAlgunCampo = camposActualizables.some(
      (campo) => datos[campo] !== undefined
    );

    if (!hayAlgunCampo) {
      throw new ValidationError(
        "Debe proporcionar al menos un campo para actualizar"
      );
    }

    // Buscar el partido
    const partido = await this.partidoRepository.findById(partidoId);
    if (!partido) {
      throw new ValidationError("Partido no encontrado");
    }

    // Actualizar fecha y hora si se proporciona
    if (datos.fechaHora !== undefined) {
      const fecha = new Date(datos.fechaHora);
      if (isNaN(fecha.getTime())) {
        throw new ValidationError("Fecha y hora inválidas");
      }
      partido._fechaHora = fecha;
    }

    // Actualizar rival si se proporciona
    if (datos.rival !== undefined) {
      if (
        !datos.rival ||
        typeof datos.rival !== "string" ||
        datos.rival.trim().length === 0
      ) {
        throw new ValidationError("El rival no puede estar vacío");
      }
      partido._rival = datos.rival.trim();
    }

    // Actualizar lugar si se proporciona
    if (datos.lugar !== undefined) {
      partido.cambiarLugar(datos.lugar);
    }

    // Actualizar tipo si se proporciona
    if (datos.tipo !== undefined) {
      const { Partido } = await import("../../../domain/entities/Partido.js");
      if (!Object.values(Partido.TIPOS).includes(datos.tipo)) {
        throw new ValidationError(
          `Tipo inválido. Debe ser uno de: ${Object.values(Partido.TIPOS).join(
            ", "
          )}`
        );
      }
      partido._tipo = datos.tipo;
    }

    // Actualizar esLocal si se proporciona
    if (datos.esLocal !== undefined) {
      partido._esLocal = datos.esLocal;
    }

    // Actualizar observaciones si se proporciona
    if (datos.observaciones !== undefined) {
      partido._observaciones = datos.observaciones;
    }

    // Persistir los cambios
    const partidoActualizado = await this.partidoRepository.update(
      partidoId,
      partido
    );

    return partidoActualizado.toObject();
  }
}
