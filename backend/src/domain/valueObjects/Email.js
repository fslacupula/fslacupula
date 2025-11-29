import { ValidationError } from "../errors/index.js";

/**
 * Value Object: Email
 * Representa una dirección de email válida e inmutable
 *
 * Reglas de negocio:
 * - Debe tener formato válido (usuario@dominio.ext)
 * - No puede estar vacío
 * - Se normaliza a minúsculas
 * - Es inmutable
 */
export class Email {
  #value;

  /**
   * @param {string} value - Dirección de email
   * @throws {ValidationError} Si el email no es válido
   */
  constructor(value) {
    if (typeof value !== "string") {
      throw new ValidationError(
        "El email es requerido y debe ser una cadena de texto"
      );
    }

    const trimmedValue = value.trim();

    if (trimmedValue.length === 0) {
      throw new ValidationError("El email no puede estar vacío");
    }

    if (!Email.esValido(trimmedValue)) {
      throw new ValidationError("El formato del email no es válido");
    }

    // Normalizar a minúsculas
    this.#value = trimmedValue.toLowerCase();
    Object.freeze(this);
  }

  /**
   * Obtiene el valor del email
   * @returns {string}
   */
  getValue() {
    return this.#value;
  }

  /**
   * Obtiene el dominio del email
   * @returns {string}
   */
  getDominio() {
    return this.#value.split("@")[1];
  }

  /**
   * Obtiene el usuario (parte local) del email
   * @returns {string}
   */
  getUsuario() {
    return this.#value.split("@")[0];
  }

  /**
   * Compara si dos emails son iguales
   * @param {Email} otroEmail - Email a comparar
   * @returns {boolean}
   */
  equals(otroEmail) {
    if (!(otroEmail instanceof Email)) {
      return false;
    }
    return this.#value === otroEmail.#value;
  }

  /**
   * Representación en string
   * @returns {string}
   */
  toString() {
    return this.#value;
  }

  /**
   * Serialización para JSON
   * @returns {string}
   */
  toJSON() {
    return this.#value;
  }

  /**
   * Valida si un string es un email válido
   * @param {string} value - Valor a validar
   * @returns {boolean}
   */
  static esValido(value) {
    if (!value || typeof value !== "string") {
      return false;
    }

    // Regex robusto para emails
    // Permite: letras, números, puntos, guiones, guiones bajos en usuario
    // Requiere @ y dominio con al menos un punto
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailRegex.test(value)) {
      return false;
    }

    // Validaciones adicionales
    const [usuario, dominio] = value.split("@");

    // Usuario no puede empezar o terminar con punto
    if (usuario.startsWith(".") || usuario.endsWith(".")) {
      return false;
    }

    // No puede tener puntos consecutivos
    if (usuario.includes("..") || dominio.includes("..")) {
      return false;
    }

    // Dominio debe tener al menos un punto
    if (!dominio.includes(".")) {
      return false;
    }

    // Longitud razonable
    if (value.length > 254) {
      // Límite RFC 5321
      return false;
    }

    return true;
  }

  /**
   * Crea un Email desde un valor string (factory method)
   * @param {string} value - Valor del email
   * @returns {Email}
   */
  static from(value) {
    return new Email(value);
  }
}
