import { ValidationError } from "../../../domain/errors/index.js";

/**
 * Caso de Uso: Eliminar Usuario
 *
 * Responsabilidad: Gestionar la eliminación de un usuario (soft delete).
 *
 * Flujo:
 * 1. Buscar el usuario por ID
 * 2. Validar que existe
 * 3. Marcar como inactivo (soft delete)
 * 4. Persistir el cambio
 * 5. Retornar confirmación
 */
export class EliminarUsuarioUseCase {
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
   * Ejecuta el caso de uso (soft delete)
   *
   * @param {string|number} id - ID del usuario a eliminar
   * @returns {Promise<Object>} Confirmación de eliminación
   * @throws {ValidationError} Si el usuario no existe
   */
  async execute(id) {
    if (!id) {
      throw new ValidationError("El ID del usuario es requerido");
    }

    // Verificar que el usuario existe
    const usuario = await this.usuarioRepository.findById(id);

    if (!usuario) {
      throw new ValidationError("Usuario no encontrado");
    }

    // Soft delete - marcar como inactivo
    const eliminado = await this.usuarioRepository.delete(id);

    return {
      success: eliminado,
      message: "Usuario eliminado correctamente",
      id: id,
    };
  }

  /**
   * Ejecuta eliminación permanente (hard delete)
   * ⚠️ Usar con precaución - no se puede deshacer
   *
   * @param {string|number} id - ID del usuario a eliminar permanentemente
   * @returns {Promise<Object>} Confirmación de eliminación
   * @throws {ValidationError} Si el usuario no existe
   */
  async executeHard(id) {
    if (!id) {
      throw new ValidationError("El ID del usuario es requerido");
    }

    // Verificar que el usuario existe
    const usuario = await this.usuarioRepository.findById(id);

    if (!usuario) {
      throw new ValidationError("Usuario no encontrado");
    }

    // Hard delete - eliminación permanente
    const eliminado = await this.usuarioRepository.hardDelete(id);

    return {
      success: eliminado,
      message: "Usuario eliminado permanentemente",
      id: id,
    };
  }
}
