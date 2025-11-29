/**
 * Entidad Usuario - Dominio
 * Representa un usuario del sistema (jugador o gestor)
 *
 * Responsabilidades:
 * - Validar datos del usuario
 * - Encapsular lógica de negocio del usuario
 * - Garantizar la integridad de los datos
 */
import { ValidationError } from "../errors/index.js";

export class Usuario {
  // Roles válidos en el sistema
  static ROLES = {
    JUGADOR: "jugador",
    GESTOR: "gestor",
  };

  // Regex para validación de email
  static EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  constructor({
    id,
    email,
    password,
    nombre,
    rol,
    activo = true,
    createdAt = null,
  }) {
    // Validaciones
    this.#validateEmail(email);
    this.#validateNombre(nombre);
    this.#validateRol(rol);

    // Asignación de propiedades
    this._id = id;
    this._email = email;
    this._password = password;
    this._nombre = nombre;
    this._rol = rol;
    this._activo = activo;
    this._createdAt = createdAt || new Date();
  }

  // Getters (propiedades de solo lectura)
  get id() {
    return this._id;
  }

  get email() {
    return this._email;
  }

  get password() {
    return this._password;
  }

  get nombre() {
    return this._nombre;
  }

  get rol() {
    return this._rol;
  }

  get activo() {
    return this._activo;
  }

  get createdAt() {
    return this._createdAt;
  }

  // Setters controlados (para testing y casos específicos)
  set activo(valor) {
    this._activo = valor;
  }

  // Métodos de validación privados
  #validateEmail(email) {
    if (!email) {
      throw new ValidationError("Email es requerido", "email");
    }

    if (!Usuario.esEmailValido(email)) {
      throw new ValidationError("Email inválido", "email");
    }
  }

  #validateNombre(nombre) {
    if (!nombre) {
      throw new ValidationError("Nombre es requerido", "nombre");
    }

    if (nombre.trim().length < 2) {
      throw new ValidationError(
        "Nombre debe tener al menos 2 caracteres",
        "nombre"
      );
    }

    if (nombre.trim().length > 100) {
      throw new ValidationError(
        "Nombre no puede exceder 100 caracteres",
        "nombre"
      );
    }
  }

  #validateRol(rol) {
    if (!rol) {
      throw new ValidationError("Rol es requerido", "rol");
    }

    if (!Usuario.esRolValido(rol)) {
      throw new ValidationError(
        `Rol inválido. Debe ser uno de: ${Object.values(Usuario.ROLES).join(
          ", "
        )}`,
        "rol"
      );
    }
  }

  // Métodos de negocio

  /**
   * Activa el usuario
   */
  activar() {
    this._activo = true;
  }

  /**
   * Desactiva el usuario
   */
  desactivar() {
    this._activo = false;
  }

  /**
   * Verifica si el usuario es jugador
   */
  esJugador() {
    return this._rol === Usuario.ROLES.JUGADOR;
  }

  /**
   * Verifica si el usuario es gestor
   */
  esGestor() {
    return this._rol === Usuario.ROLES.GESTOR;
  }

  /**
   * Cambia el email del usuario (con validación)
   */
  cambiarEmail(nuevoEmail) {
    this.#validateEmail(nuevoEmail);
    this._email = nuevoEmail;
  }

  /**
   * Cambia el nombre del usuario (con validación)
   */
  cambiarNombre(nuevoNombre) {
    this.#validateNombre(nuevoNombre);
    this._nombre = nuevoNombre;
  }

  /**
   * Cambia el password del usuario
   * Nota: En producción, el password debe ser hasheado antes de llamar este método
   */
  cambiarPassword(nuevoPassword) {
    if (!nuevoPassword) {
      throw new ValidationError("Password es requerido", "password");
    }
    this._password = nuevoPassword;
  }

  /**
   * Retorna los datos del usuario sin el password (para respuestas API)
   */
  toSafeObject() {
    return {
      id: this._id,
      email: this._email,
      nombre: this._nombre,
      rol: this._rol,
      activo: this._activo,
      createdAt: this._createdAt,
    };
  }

  /**
   * Retorna todos los datos del usuario (incluyendo password)
   */
  toObject() {
    return {
      id: this._id,
      email: this._email,
      password: this._password,
      nombre: this._nombre,
      rol: this._rol,
      activo: this._activo,
      createdAt: this._createdAt,
    };
  }

  // Métodos estáticos de validación

  /**
   * Valida formato de email
   */
  static esEmailValido(email) {
    if (!email || typeof email !== "string") {
      return false;
    }
    return Usuario.EMAIL_REGEX.test(email);
  }

  /**
   * Valida si un rol es válido
   */
  static esRolValido(rol) {
    return Object.values(Usuario.ROLES).includes(rol);
  }

  /**
   * Crea un usuario desde datos de base de datos
   */
  static fromDatabase(data) {
    return new Usuario({
      id: data.id,
      email: data.email,
      password: data.password,
      nombre: data.nombre,
      rol: data.rol,
      activo: data.activo,
      createdAt: data.created_at ? new Date(data.created_at) : null,
    });
  }
}
