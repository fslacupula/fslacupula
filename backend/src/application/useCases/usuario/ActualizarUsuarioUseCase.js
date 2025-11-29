import { ValidationError } from "../../../domain/errors/index.js";

/**
 * Caso de Uso: Actualizar Usuario
 *
 * Responsabilidad: Orquestar la actualización de un usuario existente
 * validando reglas de negocio.
 *
 * Flujo:
 * 1. Buscar el usuario por ID
 * 2. Validar que existe
 * 3. Si cambia el email, validar que no esté en uso
 * 4. Actualizar los campos permitidos
 * 5. Persistir los cambios
 * 6. Retornar el usuario actualizado
 */
export class ActualizarUsuarioUseCase {
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
   * @param {string|number} id - ID del usuario a actualizar
   * @param {Object} datos - Datos a actualizar
   * @param {string} [datos.email] - Nuevo email (opcional)
   * @param {string} [datos.nombre] - Nuevo nombre (opcional)
   * @param {string} [datos.password] - Nueva contraseña (opcional)
   * @returns {Promise<Object>} Usuario actualizado (sin contraseña)
   * @throws {ValidationError} Si el usuario no existe o los datos son inválidos
   */
  async execute(id, datos) {
    // Buscar el usuario existente
    const usuario = await this.usuarioRepository.findById(id);

    if (!usuario) {
      throw new ValidationError("Usuario no encontrado");
    }

    // Si se actualiza el email, validar que no esté en uso
    if (datos.email && datos.email !== usuario.email) {
      const emailExiste = await this.usuarioRepository.existsByEmail(
        datos.email,
        id
      );
      if (emailExiste) {
        throw new ValidationError(
          "El email ya está registrado por otro usuario"
        );
      }
      usuario.cambiarEmail(datos.email);
    }

    // Actualizar nombre si se proporciona
    if (datos.nombre !== undefined) {
      usuario.cambiarNombre(datos.nombre);
    }

    // Actualizar password si se proporciona
    if (datos.password !== undefined) {
      usuario.cambiarPassword(datos.password);
    }

    // Persistir los cambios
    const usuarioActualizado = await this.usuarioRepository.update(id, usuario);

    // Retornar datos seguros (sin contraseña)
    return usuarioActualizado.toSafeObject();
  }
}
