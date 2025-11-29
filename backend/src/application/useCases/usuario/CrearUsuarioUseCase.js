import { ValidationError } from "../../../domain/errors/index.js";
import { Usuario } from "../../../domain/entities/index.js";

/**
 * Caso de Uso: Crear Usuario
 *
 * Responsabilidad: Orquestar la creación de un nuevo usuario
 * validando reglas de negocio y persistiendo en el repositorio.
 *
 * Flujo:
 * 1. Validar que el email no esté en uso
 * 2. Crear la entidad Usuario (con validaciones propias)
 * 3. Persistir en el repositorio
 * 4. Retornar el usuario creado
 */
export class CrearUsuarioUseCase {
  /**
   * @param {IUsuarioRepository} usuarioRepository - Repositorio de usuarios
   * @param {IHashService} hashService - Servicio de hash de passwords
   */
  constructor(usuarioRepository, hashService) {
    if (!usuarioRepository) {
      throw new Error("usuarioRepository is required");
    }
    if (!hashService) {
      throw new Error("hashService is required");
    }
    this.usuarioRepository = usuarioRepository;
    this.hashService = hashService;
  }

  /**
   * Ejecuta el caso de uso
   *
   * @param {Object} datos - Datos del nuevo usuario
   * @param {string} datos.email - Email del usuario
   * @param {string} datos.password - Contraseña del usuario
   * @param {string} datos.nombre - Nombre completo del usuario
   * @param {string} datos.rol - Rol del usuario ('jugador' o 'gestor')
   * @returns {Promise<Object>} Usuario creado (sin contraseña)
   * @throws {ValidationError} Si los datos son inválidos o el email ya existe
   */
  async execute(datos) {
    const { email, password, nombre, rol } = datos;

    // Validar que el email no esté en uso
    const emailExiste = await this.usuarioRepository.existsByEmail(email);
    if (emailExiste) {
      throw new ValidationError("El email ya está registrado");
    }

    // Hashear el password antes de crear el usuario
    const hashedPassword = await this.hashService.hash(password);

    // Crear la entidad Usuario (las validaciones se ejecutan en el constructor)
    const usuario = new Usuario({
      id: null, // id se asignará en el repositorio
      email,
      password: hashedPassword,
      nombre,
      rol,
      activo: true, // activo por defecto
    });

    // Persistir en el repositorio
    const usuarioCreado = await this.usuarioRepository.create(usuario);

    // Retornar datos seguros (sin contraseña)
    return usuarioCreado.toSafeObject();
  }
}
