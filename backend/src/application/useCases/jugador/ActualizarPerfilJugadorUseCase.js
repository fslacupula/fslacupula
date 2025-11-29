import { ValidationError } from "../../../domain/errors/index.js";

/**
 * Caso de Uso: Actualizar Perfil de Jugador
 *
 * Responsabilidad: Actualizar los datos del perfil de un jugador.
 *
 * Flujo:
 * 1. Buscar el jugador por ID
 * 2. Validar que existe
 * 3. Actualizar los campos proporcionados
 * 4. Persistir los cambios
 * 5. Retornar el jugador actualizado
 */
export class ActualizarPerfilJugadorUseCase {
  /**
   * @param {IJugadorRepository} jugadorRepository - Repositorio de jugadores
   */
  constructor(jugadorRepository) {
    if (!jugadorRepository) {
      throw new Error("jugadorRepository is required");
    }
    this.jugadorRepository = jugadorRepository;
  }

  /**
   * Ejecuta el caso de uso
   *
   * @param {string|number} jugadorId - ID del jugador
   * @param {Object} datos - Datos a actualizar
   * @param {string} [datos.telefono] - Nuevo teléfono
   * @param {Date} [datos.fechaNacimiento] - Nueva fecha de nacimiento
   * @param {string} [datos.alias] - Nuevo alias
   * @param {string} [datos.fotoUrl] - Nueva URL de foto
   * @returns {Promise<Object>} Jugador actualizado
   * @throws {ValidationError} Si el jugador no existe o los datos son inválidos
   */
  async execute(jugadorId, datos) {
    if (!jugadorId) {
      throw new ValidationError("El ID del jugador es requerido");
    }

    // Validar que se proporciona al menos un campo para actualizar
    const camposActualizables = [
      "telefono",
      "fechaNacimiento",
      "alias",
      "fotoUrl",
    ];
    const hayAlgunCampo = camposActualizables.some(
      (campo) => datos[campo] !== undefined
    );

    if (!hayAlgunCampo) {
      throw new ValidationError(
        "Debe proporcionar al menos un campo para actualizar"
      );
    }

    // Buscar el jugador
    const jugador = await this.jugadorRepository.findById(jugadorId);
    if (!jugador) {
      throw new ValidationError("Jugador no encontrado");
    }

    // Actualizar teléfono si se proporciona
    if (datos.telefono !== undefined) {
      jugador.cambiarTelefono(datos.telefono);
    }

    // Actualizar fecha de nacimiento si se proporciona
    if (datos.fechaNacimiento !== undefined) {
      jugador._fechaNacimiento = datos.fechaNacimiento;
    }

    // Actualizar alias si se proporciona
    if (datos.alias !== undefined) {
      jugador.cambiarAlias(datos.alias);
    }

    // Actualizar foto si se proporciona
    if (datos.fotoUrl !== undefined) {
      jugador.cambiarFoto(datos.fotoUrl);
    }

    // Persistir los cambios
    const jugadorActualizado = await this.jugadorRepository.update(
      jugadorId,
      jugador
    );

    return jugadorActualizado.toObject();
  }
}
