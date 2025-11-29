import { ValidationError } from "../errors/index.js";

/**
 * Value Object: EstadoAsistencia
 * Representa el estado de asistencia de un jugador a un evento
 *
 * Estados posibles:
 * - PENDIENTE: Aún no ha confirmado
 * - CONFIRMADO: Confirmó su asistencia
 * - NO_ASISTE: Confirmó que no asistirá
 */
export class EstadoAsistencia {
  // Estados válidos como constantes
  static PENDIENTE = "pendiente";
  static CONFIRMADO = "confirmado";
  static NO_ASISTE = "no_asiste";

  static #ESTADOS_VALIDOS = [
    EstadoAsistencia.PENDIENTE,
    EstadoAsistencia.CONFIRMADO,
    EstadoAsistencia.NO_ASISTE,
  ];

  #value;

  /**
   * @param {string} value - Estado de asistencia
   * @throws {ValidationError} Si el estado no es válido
   */
  constructor(value) {
    if (!value || typeof value !== "string") {
      throw new ValidationError(
        "El estado de asistencia es requerido y debe ser una cadena de texto"
      );
    }

    const normalizedValue = value.toLowerCase().trim();

    if (!EstadoAsistencia.#ESTADOS_VALIDOS.includes(normalizedValue)) {
      throw new ValidationError(
        `El estado "${value}" no es válido. Debe ser: ${EstadoAsistencia.#ESTADOS_VALIDOS.join(
          ", "
        )}`
      );
    }

    this.#value = normalizedValue;
    Object.freeze(this);
  }

  /**
   * Obtiene el valor del estado
   * @returns {string}
   */
  getValue() {
    return this.#value;
  }

  /**
   * Verifica si el estado es PENDIENTE
   * @returns {boolean}
   */
  esPendiente() {
    return this.#value === EstadoAsistencia.PENDIENTE;
  }

  /**
   * Verifica si el estado es CONFIRMADO
   * @returns {boolean}
   */
  esConfirmado() {
    return this.#value === EstadoAsistencia.CONFIRMADO;
  }

  /**
   * Verifica si el estado es NO_ASISTE
   * @returns {boolean}
   */
  esNoAsiste() {
    return this.#value === EstadoAsistencia.NO_ASISTE;
  }

  /**
   * Verifica si el jugador tiene respuesta definida (no está pendiente)
   * @returns {boolean}
   */
  tieneRespuesta() {
    return this.#value !== EstadoAsistencia.PENDIENTE;
  }

  /**
   * Compara si dos estados son iguales
   * @param {EstadoAsistencia} otroEstado - Estado a comparar
   * @returns {boolean}
   */
  equals(otroEstado) {
    if (!(otroEstado instanceof EstadoAsistencia)) {
      return false;
    }
    return this.#value === otroEstado.#value;
  }

  /**
   * Obtiene el color asociado al estado (para UI)
   * @returns {string}
   */
  getColor() {
    switch (this.#value) {
      case EstadoAsistencia.CONFIRMADO:
        return "green";
      case EstadoAsistencia.NO_ASISTE:
        return "red";
      case EstadoAsistencia.PENDIENTE:
      default:
        return "gray";
    }
  }

  /**
   * Obtiene la etiqueta legible del estado
   * @returns {string}
   */
  getLabel() {
    switch (this.#value) {
      case EstadoAsistencia.CONFIRMADO:
        return "Confirmado";
      case EstadoAsistencia.NO_ASISTE:
        return "No asiste";
      case EstadoAsistencia.PENDIENTE:
      default:
        return "Pendiente";
    }
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
   * Valida si un valor es un estado válido
   * @param {string} value - Valor a validar
   * @returns {boolean}
   */
  static esValido(value) {
    if (!value || typeof value !== "string") {
      return false;
    }
    return EstadoAsistencia.#ESTADOS_VALIDOS.includes(
      value.toLowerCase().trim()
    );
  }

  /**
   * Obtiene todos los estados válidos
   * @returns {string[]}
   */
  static getEstadosValidos() {
    return [...EstadoAsistencia.#ESTADOS_VALIDOS];
  }

  /**
   * Crea un estado PENDIENTE
   * @returns {EstadoAsistencia}
   */
  static pendiente() {
    return new EstadoAsistencia(EstadoAsistencia.PENDIENTE);
  }

  /**
   * Crea un estado CONFIRMADO
   * @returns {EstadoAsistencia}
   */
  static confirmado() {
    return new EstadoAsistencia(EstadoAsistencia.CONFIRMADO);
  }

  /**
   * Crea un estado NO_ASISTE
   * @returns {EstadoAsistencia}
   */
  static noAsiste() {
    return new EstadoAsistencia(EstadoAsistencia.NO_ASISTE);
  }
}
