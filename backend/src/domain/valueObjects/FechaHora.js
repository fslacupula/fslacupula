import { ValidationError } from "../errors/index.js";

/**
 * Value Object: FechaHora
 * Representa una fecha y hora válida e inmutable
 *
 * Reglas de negocio:
 * - Debe ser una fecha válida
 * - Se almacena internamente como Date
 * - Es inmutable
 * - Soporta comparaciones
 * - Maneja zona horaria (Europe/Madrid por defecto)
 */
export class FechaHora {
  #date;

  /**
   * @param {Date|string|number} value - Fecha como Date, string ISO o timestamp
   * @throws {ValidationError} Si la fecha no es válida
   */
  constructor(value) {
    if (value === null || value === undefined) {
      throw new ValidationError("La fecha es requerida");
    }

    let date;

    if (value instanceof Date) {
      date = value;
    } else if (typeof value === "string") {
      date = new Date(value);
    } else if (typeof value === "number") {
      date = new Date(value);
    } else {
      throw new ValidationError("La fecha debe ser un Date, string o número");
    }

    if (isNaN(date.getTime())) {
      throw new ValidationError("La fecha proporcionada no es válida");
    }

    this.#date = new Date(date.getTime());
    Object.freeze(this);
  }

  /**
   * Obtiene el objeto Date
   * @returns {Date}
   */
  getValue() {
    return new Date(this.#date.getTime());
  }

  /**
   * Obtiene el timestamp en milisegundos
   * @returns {number}
   */
  getTimestamp() {
    return this.#date.getTime();
  }

  /**
   * Convierte a string ISO 8601
   * @returns {string}
   */
  toISOString() {
    return this.#date.toISOString();
  }

  /**
   * Convierte a formato legible en español
   * @returns {string}
   */
  toFormattedString() {
    const options = {
      timeZone: "Europe/Madrid",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    };
    return this.#date.toLocaleString("es-ES", options);
  }

  /**
   * Obtiene solo la fecha (sin hora)
   * @returns {string} Formato YYYY-MM-DD
   */
  toDateString() {
    const year = this.#date.getFullYear();
    const month = String(this.#date.getMonth() + 1).padStart(2, "0");
    const day = String(this.#date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  /**
   * Obtiene solo la hora
   * @returns {string} Formato HH:MM
   */
  toTimeString() {
    const hours = String(this.#date.getHours()).padStart(2, "0");
    const minutes = String(this.#date.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  }

  /**
   * Compara si dos fechas son iguales
   * @param {FechaHora} otraFecha - Fecha a comparar
   * @returns {boolean}
   */
  equals(otraFecha) {
    if (!(otraFecha instanceof FechaHora)) {
      return false;
    }
    return this.#date.getTime() === otraFecha.#date.getTime();
  }

  /**
   * Verifica si esta fecha es anterior a otra
   * @param {FechaHora} otraFecha - Fecha a comparar
   * @returns {boolean}
   */
  esAnteriorA(otraFecha) {
    if (!(otraFecha instanceof FechaHora)) {
      throw new ValidationError("Debe comparar con otra FechaHora");
    }
    return this.#date.getTime() < otraFecha.#date.getTime();
  }

  /**
   * Verifica si esta fecha es posterior a otra
   * @param {FechaHora} otraFecha - Fecha a comparar
   * @returns {boolean}
   */
  esPosteriorA(otraFecha) {
    if (!(otraFecha instanceof FechaHora)) {
      throw new ValidationError("Debe comparar con otra FechaHora");
    }
    return this.#date.getTime() > otraFecha.#date.getTime();
  }

  /**
   * Verifica si la fecha es futura
   * @returns {boolean}
   */
  esFutura() {
    return this.#date.getTime() > Date.now();
  }

  /**
   * Verifica si la fecha es pasada
   * @returns {boolean}
   */
  esPasada() {
    return this.#date.getTime() < Date.now();
  }

  /**
   * Verifica si la fecha es hoy
   * @returns {boolean}
   */
  esHoy() {
    const hoy = new Date();
    return (
      this.#date.getDate() === hoy.getDate() &&
      this.#date.getMonth() === hoy.getMonth() &&
      this.#date.getFullYear() === hoy.getFullYear()
    );
  }

  /**
   * Calcula la diferencia en días con otra fecha
   * @param {FechaHora} otraFecha - Fecha a comparar
   * @returns {number} Diferencia en días (puede ser negativo)
   */
  diferenciaEnDias(otraFecha) {
    if (!(otraFecha instanceof FechaHora)) {
      throw new ValidationError("Debe comparar con otra FechaHora");
    }
    const diff = this.#date.getTime() - otraFecha.#date.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  /**
   * Calcula la diferencia en horas con otra fecha
   * @param {FechaHora} otraFecha - Fecha a comparar
   * @returns {number} Diferencia en horas (puede ser negativo)
   */
  diferenciaEnHoras(otraFecha) {
    if (!(otraFecha instanceof FechaHora)) {
      throw new ValidationError("Debe comparar con otra FechaHora");
    }
    const diff = this.#date.getTime() - otraFecha.#date.getTime();
    return Math.floor(diff / (1000 * 60 * 60));
  }

  /**
   * Añade minutos a la fecha y retorna una nueva FechaHora
   * @param {number} minutos - Minutos a añadir
   * @returns {FechaHora}
   */
  agregarMinutos(minutos) {
    if (typeof minutos !== "number" || isNaN(minutos)) {
      throw new ValidationError("Los minutos deben ser un número válido");
    }
    const nuevaFecha = new Date(this.#date.getTime());
    nuevaFecha.setMinutes(nuevaFecha.getMinutes() + minutos);
    return new FechaHora(nuevaFecha);
  }

  /**
   * Representación en string
   * @returns {string}
   */
  toString() {
    return this.toISOString();
  }

  /**
   * Serialización para JSON
   * @returns {string}
   */
  toJSON() {
    return this.toISOString();
  }

  /**
   * Crea una FechaHora desde un string ISO
   * @param {string} isoString - String en formato ISO 8601
   * @returns {FechaHora}
   */
  static fromISO(isoString) {
    return new FechaHora(isoString);
  }

  /**
   * Crea una FechaHora desde un timestamp
   * @param {number} timestamp - Timestamp en milisegundos
   * @returns {FechaHora}
   */
  static fromTimestamp(timestamp) {
    return new FechaHora(timestamp);
  }

  /**
   * Crea una FechaHora con la fecha y hora actual
   * @returns {FechaHora}
   */
  static now() {
    return new FechaHora(new Date());
  }

  /**
   * Crea una FechaHora desde componentes individuales
   * @param {number} year - Año
   * @param {number} month - Mes (1-12)
   * @param {number} day - Día
   * @param {number} hour - Hora (0-23)
   * @param {number} minute - Minuto (0-59)
   * @returns {FechaHora}
   */
  static from(year, month, day, hour = 0, minute = 0) {
    const date = new Date(year, month - 1, day, hour, minute);
    return new FechaHora(date);
  }
}
