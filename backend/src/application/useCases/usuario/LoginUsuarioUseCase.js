/**
 * Caso de uso: Login de Usuario
 * Autentica un usuario y genera un token JWT
 */

export class LoginUsuarioUseCase {
  constructor(usuarioRepository, hashService, tokenService) {
    this.usuarioRepository = usuarioRepository;
    this.hashService = hashService;
    this.tokenService = tokenService;
  }

  async execute({ email, password }) {
    // Buscar usuario por email
    const usuario = await this.usuarioRepository.findByEmail(email);
    if (!usuario) {
      throw new Error("Credenciales inválidas");
    }

    // Obtener el hash del password (puede ser string o Password VO)
    const passwordHash =
      typeof usuario.password === "string"
        ? usuario.password
        : usuario.password.value;

    // Verificar contraseña
    const passwordValido = await this.hashService.compare(
      password,
      passwordHash
    );
    if (!passwordValido) {
      throw new Error("Credenciales inválidas");
    }

    // Verificar que el usuario esté activo
    if (!usuario.activo) {
      throw new Error("Usuario inactivo");
    }

    // Generar token JWT
    const token = this.tokenService.generate({
      id: usuario.id,
      email: usuario.email.value || usuario.email,
      rol: usuario.rol,
    });

    return {
      token,
      usuario: {
        id: usuario.id,
        email: usuario.email.value || usuario.email,
        nombre: usuario.nombre,
        rol: usuario.rol,
      },
    };
  }
}
