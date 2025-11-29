import bcrypt from "bcrypt";

/**
 * @class HashService
 * @description Servicio para gestión de hashing de contraseñas usando bcrypt
 */
export class HashService {
  constructor() {
    this.saltRounds = 10; // Número de rondas de salt para bcrypt
  }

  /**
   * Hashea una contraseña en texto plano
   * @param {string} password - Contraseña en texto plano
   * @returns {Promise<string>} Hash de la contraseña
   * @throws {Error} Si la contraseña es inválida
   */
  async hash(password) {
    if (!password || typeof password !== "string") {
      throw new Error("La contraseña debe ser una cadena de texto válida");
    }

    if (password.trim().length === 0) {
      throw new Error("La contraseña no puede estar vacía");
    }

    try {
      return await bcrypt.hash(password, this.saltRounds);
    } catch (error) {
      throw new Error(`Error al hashear la contraseña: ${error.message}`);
    }
  }

  /**
   * Compara una contraseña en texto plano con un hash
   * @param {string} password - Contraseña en texto plano
   * @param {string} hash - Hash de la contraseña
   * @returns {Promise<boolean>} true si coinciden, false en caso contrario
   * @throws {Error} Si los parámetros son inválidos
   */
  async compare(password, hash) {
    if (!password || typeof password !== "string") {
      throw new Error("La contraseña debe ser una cadena de texto válida");
    }

    if (!hash || typeof hash !== "string") {
      throw new Error("El hash debe ser una cadena de texto válida");
    }

    try {
      return await bcrypt.compare(password, hash);
    } catch (error) {
      throw new Error(`Error al comparar la contraseña: ${error.message}`);
    }
  }

  /**
   * Verifica si un string es un hash bcrypt válido
   * @param {string} hash - String a verificar
   * @returns {boolean} true si es un hash bcrypt válido
   */
  isValidHash(hash) {
    if (!hash || typeof hash !== "string") {
      return false;
    }

    // Los hashes bcrypt comienzan con $2a$, $2b$ o $2y$
    const bcryptPattern = /^\$2[aby]\$\d{1,2}\$.{53}$/;
    return bcryptPattern.test(hash);
  }

  /**
   * Obtiene el número de rondas de salt configuradas
   * @returns {number} Número de rondas de salt
   */
  getSaltRounds() {
    return this.saltRounds;
  }

  /**
   * Configura el número de rondas de salt (solo para testing)
   * @param {number} rounds - Número de rondas (entre 4 y 31)
   * @throws {Error} Si el número de rondas es inválido
   */
  setSaltRounds(rounds) {
    if (typeof rounds !== "number" || rounds < 4 || rounds > 31) {
      throw new Error("El número de rondas debe estar entre 4 y 31");
    }
    this.saltRounds = rounds;
  }
}
