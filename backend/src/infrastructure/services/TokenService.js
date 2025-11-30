import jwt from "jsonwebtoken";

/**
 * @class TokenService
 * @description Servicio para gestión de JSON Web Tokens (JWT)
 */
export class TokenService {
  constructor(secretKey = null, options = {}) {
    this.secretKey =
      secretKey || process.env.JWT_SECRET || "secret-key-default";

    // Opciones por defecto
    this.defaultOptions = {
      expiresIn: options.expiresIn || "30d",
      issuer: options.issuer || "futbol-club-app",
      audience: options.audience || "futbol-club-users",
    };

    if (!secretKey && !process.env.JWT_SECRET) {
      console.warn(
        "⚠️ TokenService: Usando secretKey por defecto. Configura JWT_SECRET en producción."
      );
    }
  }

  /**
   * Genera un nuevo token JWT
   * @param {Object} payload - Datos a incluir en el token
   * @param {Object} [customOptions] - Opciones personalizadas de JWT
   * @returns {string} Token JWT generado
   * @throws {Error} Si el payload es inválido o hay error al generar
   */
  generate(payload, customOptions = {}) {
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      throw new Error("El payload debe ser un objeto válido");
    }

    // No permitir campos reservados en el payload
    const reservedFields = ["iat", "exp", "iss", "aud", "sub", "jti"];
    const hasReservedField = reservedFields.some((field) =>
      Object.prototype.hasOwnProperty.call(payload, field)
    );

    if (hasReservedField) {
      throw new Error(
        `El payload no debe contener campos reservados: ${reservedFields.join(
          ", "
        )}`
      );
    }

    try {
      const options = { ...this.defaultOptions, ...customOptions };
      return jwt.sign(payload, this.secretKey, options);
    } catch (error) {
      throw new Error(`Error al generar el token: ${error.message}`);
    }
  }

  /**
   * Verifica y decodifica un token JWT
   * @param {string} token - Token a verificar
   * @param {Object} [customOptions] - Opciones personalizadas de verificación
   * @returns {Object} Payload decodificado del token
   * @throws {Error} Si el token es inválido o ha expirado
   */
  verify(token, customOptions = {}) {
    if (!token || typeof token !== "string") {
      throw new Error("El token debe ser una cadena de texto válida");
    }

    try {
      const options = {
        issuer: customOptions.issuer || this.defaultOptions.issuer,
        audience: customOptions.audience || this.defaultOptions.audience,
        ...customOptions,
      };

      return jwt.verify(token, this.secretKey, options);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        throw new Error("El token ha expirado");
      }
      if (error.name === "JsonWebTokenError") {
        throw new Error("Token inválido");
      }
      if (error.name === "NotBeforeError") {
        throw new Error("El token aún no es válido");
      }
      throw new Error(`Error al verificar el token: ${error.message}`);
    }
  }

  /**
   * Decodifica un token sin verificar su firma (NO USAR EN PRODUCCIÓN para autenticación)
   * @param {string} token - Token a decodificar
   * @returns {Object|null} Payload decodificado o null si es inválido
   */
  decode(token) {
    if (!token || typeof token !== "string") {
      return null;
    }

    try {
      return jwt.decode(token, { complete: false });
    } catch (error) {
      return null;
    }
  }

  /**
   * Decodifica un token y devuelve la información completa (header, payload, signature)
   * @param {string} token - Token a decodificar
   * @returns {Object|null} Objeto con header, payload y signature o null
   */
  decodeComplete(token) {
    if (!token || typeof token !== "string") {
      return null;
    }

    try {
      return jwt.decode(token, { complete: true });
    } catch (error) {
      return null;
    }
  }

  /**
   * Verifica si un token ha expirado (sin verificar la firma)
   * @param {string} token - Token a verificar
   * @returns {boolean} true si ha expirado, false en caso contrario
   */
  isExpired(token) {
    const decoded = this.decode(token);

    if (!decoded || !decoded.exp) {
      return true;
    }

    const currentTimestamp = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTimestamp;
  }

  /**
   * Obtiene el tiempo restante de validez del token en segundos
   * @param {string} token - Token a verificar
   * @returns {number} Segundos restantes de validez (0 si expirado o inválido)
   */
  getTimeToExpire(token) {
    const decoded = this.decode(token);

    if (!decoded || !decoded.exp) {
      return 0;
    }

    const currentTimestamp = Math.floor(Date.now() / 1000);
    const timeRemaining = decoded.exp - currentTimestamp;

    return timeRemaining > 0 ? timeRemaining : 0;
  }

  /**
   * Refresca un token generando uno nuevo con el mismo payload
   * @param {string} token - Token a refrescar
   * @param {Object} [customOptions] - Opciones personalizadas
   * @returns {string} Nuevo token JWT
   * @throws {Error} Si el token es inválido
   */
  refresh(token, customOptions = {}) {
    const decoded = this.verify(token);

    // Remover campos automáticos de JWT
    const { iat, exp, iss, aud, nbf, jti, ...payload } = decoded;

    return this.generate(payload, customOptions);
  }

  /**
   * Genera un token de corta duración (útil para operaciones sensibles)
   * @param {Object} payload - Datos a incluir en el token
   * @param {string} [expiresIn='15m'] - Tiempo de expiración
   * @returns {string} Token JWT de corta duración
   */
  generateShortLived(payload, expiresIn = "15m") {
    return this.generate(payload, { expiresIn });
  }

  /**
   * Genera un token de larga duración (útil para "remember me")
   * @param {Object} payload - Datos a incluir en el token
   * @param {string} [expiresIn='30d'] - Tiempo de expiración
   * @returns {string} Token JWT de larga duración
   */
  generateLongLived(payload, expiresIn = "30d") {
    return this.generate(payload, { expiresIn });
  }

  /**
   * Configura una nueva secret key (solo para testing)
   * @param {string} newSecretKey - Nueva clave secreta
   * @throws {Error} Si la clave es inválida
   */
  setSecretKey(newSecretKey) {
    if (!newSecretKey || typeof newSecretKey !== "string") {
      throw new Error("La secret key debe ser una cadena de texto válida");
    }
    this.secretKey = newSecretKey;
  }

  /**
   * Obtiene la configuración actual de opciones por defecto
   * @returns {Object} Opciones por defecto
   */
  getDefaultOptions() {
    return { ...this.defaultOptions };
  }
}
