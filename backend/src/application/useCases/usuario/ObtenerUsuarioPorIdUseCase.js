import { ValidationError } from "../../../domain/errors/index.js";

/**
 * Caso de Uso: Obtener Usuario por ID
 *
 * Responsabilidad: Recuperar un usuario específico por su identificador.
 *
 * Flujo:
 * 1. Buscar el usuario por ID
 * 2. Validar que existe
 * 3. Retornar el usuario (sin contraseña)
 */
export class ObtenerUsuarioPorIdUseCase {
  /**
   * @param {IUsuarioRepository} usuarioRepository - Repositorio de usuarios
   */
  constructor(usuarioRepository) {
    if (!usuarioRepository) {
      throw new Error("usuarioRepository is required");
    }
    this.usuarioRepository = usuarioRepository;
  }

  /**
   * Ejecuta el caso de uso
   *
   * @param {string|number} id - ID del usuario a buscar
   * @returns {Promise<Object>} Usuario encontrado (sin contraseña)
   * @throws {ValidationError} Si el usuario no existe
   */
  async execute(id) {
    if (!id) {
      throw new ValidationError("El ID del usuario es requerido");
    }

    const usuario = await this.usuarioRepository.findById(id);

    if (!usuario) {
      throw new ValidationError("Usuario no encontrado");
    }

    return usuario.toSafeObject();
  }
}
