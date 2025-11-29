import { ValidationError } from "../errors/index.js";

/**
 * Value Object: Password
 * Representa una contraseña con reglas de seguridad
 *
 * Reglas de negocio:
 * - Mínimo 8 caracteres
 * - Al menos una letra minúscula
 * - Al menos una letra mayúscula
 * - Al menos un número
 * - Es inmutable
 * - Se puede almacenar en formato hasheado
 */
export class Password {
  #value;
  #isHashed;

  /**
   * @param {string} value - Contraseña en texto plano o hasheada
   * @param {boolean} isHashed - Indica si la contraseña ya está hasheada
   * @throws {ValidationError} Si la contraseña no cumple los requisitos
   */
  constructor(value, isHashed = false) {
    if (typeof value !== "string") {
      throw new ValidationError(
        "La contraseña es requerida y debe ser una cadena de texto"
      );
    }

    if (value.trim().length === 0) {
      throw new ValidationError("La contraseña no puede estar vacía");
    }

    // Si ya está hasheada, no validar complejidad
    if (isHashed) {
      this.#value = value;
      this.#isHashed = true;
    } else {
      // Validar contraseña en texto plano
      if (!Password.esValida(value)) {
        throw new ValidationError(
          "La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas y números"
        );
      }
      this.#value = value;
      this.#isHashed = false;
    }

    Object.freeze(this);
  }

  /**
   * Obtiene el valor de la contraseña
   * @returns {string}
   */
  getValue() {
    return this.#value;
  }

  /**
   * Indica si la contraseña está hasheada
   * @returns {boolean}
   */
  isHashed() {
    return this.#isHashed;
  }

  /**
   * Obtiene la longitud de la contraseña
   * @returns {number}
   */
  getLength() {
    return this.#value.length;
  }

  /**
   * Compara si dos contraseñas son iguales
   * Solo compara si ambas están en el mismo formato (hasheada o no)
   * @param {Password} otraPassword - Contraseña a comparar
   * @returns {boolean}
   */
  equals(otraPassword) {
    if (!(otraPassword instanceof Password)) {
      return false;
    }

    // Solo se pueden comparar si están en el mismo formato
    if (this.#isHashed !== otraPassword.#isHashed) {
      return false;
    }

    return this.#value === otraPassword.#value;
  }

  /**
   * Representación segura (oculta la contraseña)
   * @returns {string}
   */
  toString() {
    return "********";
  }

  /**
   * Serialización segura para JSON
   * @returns {string}
   */
  toJSON() {
    return "********";
  }

  /**
   * Valida si una contraseña cumple con los requisitos de seguridad
   * @param {string} value - Contraseña a validar
   * @returns {boolean}
   */
  static esValida(value) {
    if (!value || typeof value !== "string") {
      return false;
    }

    // Longitud mínima
    if (value.length < 8) {
      return false;
    }

    // Longitud máxima razonable
    if (value.length > 128) {
      return false;
    }

    // Al menos una minúscula
    if (!/[a-z]/.test(value)) {
      return false;
    }

    // Al menos una mayúscula
    if (!/[A-Z]/.test(value)) {
      return false;
    }

    // Al menos un número
    if (!/[0-9]/.test(value)) {
      return false;
    }

    return true;
  }

  /**
   * Valida la fortaleza de una contraseña
   * @param {string} value - Contraseña a evaluar
   * @returns {string} 'debil', 'media', 'fuerte'
   */
  static evaluarFortaleza(value) {
    if (!Password.esValida(value)) {
      return "debil";
    }

    let puntos = 0;

    // Longitud
    if (value.length >= 12) puntos += 2;
    else if (value.length >= 10) puntos += 1;

    // Caracteres especiales
    if (/[!@#$%^&*(),.?":{}|<>]/.test(value)) puntos += 2;

    // Variedad de caracteres
    const tieneMinusculas = /[a-z]/.test(value);
    const tieneMayusculas = /[A-Z]/.test(value);
    const tieneNumeros = /[0-9]/.test(value);
    const caracteresUnicos = new Set(value).size;

    if (tieneMinusculas && tieneMayusculas && tieneNumeros) puntos += 1;
    if (caracteresUnicos > value.length * 0.6) puntos += 1;

    if (puntos >= 5) return "fuerte";
    if (puntos >= 3) return "media";
    return "debil";
  }

  /**
   * Crea una contraseña desde texto plano
   * @param {string} value - Contraseña en texto plano
   * @returns {Password}
   */
  static fromPlainText(value) {
    return new Password(value, false);
  }

  /**
   * Crea una contraseña desde un hash
   * @param {string} hash - Hash de la contraseña
   * @returns {Password}
   */
  static fromHash(hash) {
    if (!hash || typeof hash !== "string") {
      throw new ValidationError("El hash de contraseña es requerido");
    }
    return new Password(hash, true);
  }
}
