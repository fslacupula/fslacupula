import { ValidationError } from "../../../domain/errors/index.js";
import { Jugador } from "../../../domain/entities/index.js";

/**
 * Caso de Uso: Crear Perfil de Jugador
 *
 * Responsabilidad: Crear el perfil de jugador asociado a un usuario existente.
 *
 * Flujo:
 * 1. Validar que el usuario existe
 * 2. Validar que el usuario es tipo 'jugador'
 * 3. Validar que el usuario no tiene ya un perfil de jugador
 * 4. Crear la entidad Jugador
 * 5. Persistir en el repositorio
 * 6. Retornar el jugador creado
 */
export class CrearPerfilJugadorUseCase {
  /**
   * @param {IUsuarioRepository} usuarioRepository - Repositorio de usuarios
   * @param {IJugadorRepository} jugadorRepository - Repositorio de jugadores
   */
  constructor(usuarioRepository, jugadorRepository) {
    if (!usuarioRepository) {
      throw new Error("usuarioRepository is required");
    }
    if (!jugadorRepository) {
      throw new Error("jugadorRepository is required");
    }
    this.usuarioRepository = usuarioRepository;
    this.jugadorRepository = jugadorRepository;
  }

  /**
   * Ejecuta el caso de uso
   *
   * @param {Object} datos - Datos del perfil de jugador
   * @param {string|number} datos.usuarioId - ID del usuario
   * @param {number} [datos.numeroDorsal] - Número de dorsal (opcional, 0-99)
   * @param {number} [datos.posicionId] - ID de la posición (opcional)
   * @param {string} [datos.telefono] - Teléfono en formato internacional (opcional)
   * @param {Date} [datos.fechaNacimiento] - Fecha de nacimiento (opcional)
   * @param {string} [datos.alias] - Alias del jugador (opcional)
   * @param {string} [datos.fotoUrl] - URL de la foto del jugador (opcional)
   * @returns {Promise<Object>} Jugador creado
   * @throws {ValidationError} Si el usuario no existe, no es jugador o ya tiene perfil
   */
  async execute(datos) {
    const {
      usuarioId,
      numeroDorsal,
      posicionId,
      telefono,
      fechaNacimiento,
      alias,
      fotoUrl,
    } = datos;

    // Validar que el usuario existe
    const usuario = await this.usuarioRepository.findById(usuarioId);
    if (!usuario) {
      throw new ValidationError("Usuario no encontrado");
    }

    // Validar que el usuario es jugador
    if (!usuario.esJugador()) {
      throw new ValidationError("El usuario no tiene rol de jugador");
    }

    // Validar que no existe ya un perfil de jugador para este usuario
    const perfilExistente = await this.jugadorRepository.findByUsuarioId(
      usuarioId
    );
    if (perfilExistente) {
      throw new ValidationError("El usuario ya tiene un perfil de jugador");
    }

    // Validar que el dorsal no esté en uso (si se proporciona)
    if (numeroDorsal) {
      const dorsalEnUso = await this.jugadorRepository.existsByNumeroDorsal(
        numeroDorsal
      );
      if (dorsalEnUso) {
        throw new ValidationError(`El dorsal ${numeroDorsal} ya está en uso`);
      }
    }

    // Crear la entidad Jugador
    const jugador = new Jugador({
      id: null, // se asignará en el repositorio
      usuarioId,
      numeroDorsal: numeroDorsal !== undefined ? numeroDorsal : null,
      posicionId: posicionId !== undefined ? posicionId : null,
      telefono: telefono !== undefined ? telefono : null,
      fechaNacimiento: fechaNacimiento !== undefined ? fechaNacimiento : null,
      alias: alias !== undefined ? alias : null,
      fotoUrl: fotoUrl !== undefined ? fotoUrl : null,
    });

    // Persistir en el repositorio
    const jugadorCreado = await this.jugadorRepository.create(jugador);

    // Retornar el jugador creado
    return jugadorCreado.toObject();
  }
}
