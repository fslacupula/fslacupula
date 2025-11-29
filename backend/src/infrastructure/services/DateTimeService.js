/**
 * @class DateTimeService
 * @description Servicio para manipulación y formateo de fechas.
 * Centraliza la lógica de manejo de fechas en la aplicación.
 */
export class DateTimeService {
  constructor(timezone = "Europe/Madrid") {
    this.timezone = timezone;
  }

  /**
   * Obtiene la fecha y hora actual
   * @returns {Date} Fecha actual
   */
  now() {
    return new Date();
  }

  /**
   * Formatea una fecha según el formato especificado
   * @param {Date|string} date - Fecha a formatear
   * @param {string} [format='yyyy-MM-dd HH:mm:ss'] - Formato de salida
   * @returns {string} Fecha formateada
   */
  format(date, format = "yyyy-MM-dd HH:mm:ss") {
    const d = this._ensureDate(date);

    if (!d || isNaN(d.getTime())) {
      throw new Error("Fecha inválida");
    }

    const pad = (num, size = 2) => String(num).padStart(size, "0");

    const replacements = {
      yyyy: d.getFullYear(),
      yy: String(d.getFullYear()).slice(-2),
      MM: pad(d.getMonth() + 1),
      M: d.getMonth() + 1,
      dd: pad(d.getDate()),
      d: d.getDate(),
      HH: pad(d.getHours()),
      H: d.getHours(),
      mm: pad(d.getMinutes()),
      m: d.getMinutes(),
      ss: pad(d.getSeconds()),
      s: d.getSeconds(),
      SSS: pad(d.getMilliseconds(), 3),
    };

    let formatted = format;
    Object.keys(replacements).forEach((key) => {
      formatted = formatted.replace(new RegExp(key, "g"), replacements[key]);
    });

    return formatted;
  }

  /**
   * Parsea un string a fecha
   * @param {string} dateString - String de fecha
   * @returns {Date} Fecha parseada
   * @throws {Error} Si el string no es una fecha válida
   */
  parse(dateString) {
    if (!dateString || typeof dateString !== "string") {
      throw new Error("El string de fecha debe ser válido");
    }

    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      throw new Error(`No se pudo parsear la fecha: ${dateString}`);
    }

    return date;
  }

  /**
   * Añade días a una fecha
   * @param {Date|string} date - Fecha base
   * @param {number} days - Número de días a añadir (puede ser negativo)
   * @returns {Date} Nueva fecha
   */
  addDays(date, days) {
    const d = this._ensureDate(date);
    const result = new Date(d);
    result.setDate(result.getDate() + days);
    return result;
  }

  /**
   * Añade horas a una fecha
   * @param {Date|string} date - Fecha base
   * @param {number} hours - Número de horas a añadir (puede ser negativo)
   * @returns {Date} Nueva fecha
   */
  addHours(date, hours) {
    const d = this._ensureDate(date);
    const result = new Date(d);
    result.setHours(result.getHours() + hours);
    return result;
  }

  /**
   * Añade minutos a una fecha
   * @param {Date|string} date - Fecha base
   * @param {number} minutes - Número de minutos a añadir (puede ser negativo)
   * @returns {Date} Nueva fecha
   */
  addMinutes(date, minutes) {
    const d = this._ensureDate(date);
    const result = new Date(d);
    result.setMinutes(result.getMinutes() + minutes);
    return result;
  }

  /**
   * Añade meses a una fecha
   * @param {Date|string} date - Fecha base
   * @param {number} months - Número de meses a añadir (puede ser negativo)
   * @returns {Date} Nueva fecha
   */
  addMonths(date, months) {
    const d = this._ensureDate(date);
    const result = new Date(d);
    result.setMonth(result.getMonth() + months);
    return result;
  }

  /**
   * Añade años a una fecha
   * @param {Date|string} date - Fecha base
   * @param {number} years - Número de años a añadir (puede ser negativo)
   * @returns {Date} Nueva fecha
   */
  addYears(date, years) {
    const d = this._ensureDate(date);
    const result = new Date(d);
    result.setFullYear(result.getFullYear() + years);
    return result;
  }

  /**
   * Obtiene el inicio del día (00:00:00.000)
   * @param {Date|string} date - Fecha base
   * @returns {Date} Inicio del día
   */
  startOfDay(date) {
    const d = this._ensureDate(date);
    const result = new Date(d);
    result.setHours(0, 0, 0, 0);
    return result;
  }

  /**
   * Obtiene el fin del día (23:59:59.999)
   * @param {Date|string} date - Fecha base
   * @returns {Date} Fin del día
   */
  endOfDay(date) {
    const d = this._ensureDate(date);
    const result = new Date(d);
    result.setHours(23, 59, 59, 999);
    return result;
  }

  /**
   * Obtiene el inicio de la semana (lunes 00:00:00.000)
   * @param {Date|string} date - Fecha base
   * @returns {Date} Inicio de la semana
   */
  startOfWeek(date) {
    const d = this._ensureDate(date);
    const result = new Date(d);
    const day = result.getDay();
    const diff = day === 0 ? -6 : 1 - day; // Ajustar para que lunes sea el primer día
    result.setDate(result.getDate() + diff);
    result.setHours(0, 0, 0, 0);
    return result;
  }

  /**
   * Obtiene el fin de la semana (domingo 23:59:59.999)
   * @param {Date|string} date - Fecha base
   * @returns {Date} Fin de la semana
   */
  endOfWeek(date) {
    const start = this.startOfWeek(date);
    const result = new Date(start);
    result.setDate(result.getDate() + 6);
    result.setHours(23, 59, 59, 999);
    return result;
  }

  /**
   * Obtiene el inicio del mes (día 1 a las 00:00:00.000)
   * @param {Date|string} date - Fecha base
   * @returns {Date} Inicio del mes
   */
  startOfMonth(date) {
    const d = this._ensureDate(date);
    const result = new Date(d);
    result.setDate(1);
    result.setHours(0, 0, 0, 0);
    return result;
  }

  /**
   * Obtiene el fin del mes (último día a las 23:59:59.999)
   * @param {Date|string} date - Fecha base
   * @returns {Date} Fin del mes
   */
  endOfMonth(date) {
    const d = this._ensureDate(date);
    const result = new Date(d);
    result.setMonth(result.getMonth() + 1);
    result.setDate(0);
    result.setHours(23, 59, 59, 999);
    return result;
  }

  /**
   * Calcula la diferencia en días entre dos fechas
   * @param {Date|string} date1 - Primera fecha
   * @param {Date|string} date2 - Segunda fecha
   * @returns {number} Diferencia en días (puede ser negativo)
   */
  diffInDays(date1, date2) {
    const d1 = this._ensureDate(date1);
    const d2 = this._ensureDate(date2);
    const diffTime = d2.getTime() - d1.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Calcula la diferencia en horas entre dos fechas
   * @param {Date|string} date1 - Primera fecha
   * @param {Date|string} date2 - Segunda fecha
   * @returns {number} Diferencia en horas (puede ser negativo)
   */
  diffInHours(date1, date2) {
    const d1 = this._ensureDate(date1);
    const d2 = this._ensureDate(date2);
    const diffTime = d2.getTime() - d1.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60));
  }

  /**
   * Calcula la diferencia en minutos entre dos fechas
   * @param {Date|string} date1 - Primera fecha
   * @param {Date|string} date2 - Segunda fecha
   * @returns {number} Diferencia en minutos (puede ser negativo)
   */
  diffInMinutes(date1, date2) {
    const d1 = this._ensureDate(date1);
    const d2 = this._ensureDate(date2);
    const diffTime = d2.getTime() - d1.getTime();
    return Math.floor(diffTime / (1000 * 60));
  }

  /**
   * Verifica si una fecha es hoy
   * @param {Date|string} date - Fecha a verificar
   * @returns {boolean} true si es hoy
   */
  isToday(date) {
    const d = this._ensureDate(date);
    const today = new Date();
    return (
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear()
    );
  }

  /**
   * Verifica si una fecha es pasada
   * @param {Date|string} date - Fecha a verificar
   * @returns {boolean} true si es pasada
   */
  isPast(date) {
    const d = this._ensureDate(date);
    return d.getTime() < Date.now();
  }

  /**
   * Verifica si una fecha es futura
   * @param {Date|string} date - Fecha a verificar
   * @returns {boolean} true si es futura
   */
  isFuture(date) {
    const d = this._ensureDate(date);
    return d.getTime() > Date.now();
  }

  /**
   * Verifica si una fecha está dentro de un rango
   * @param {Date|string} date - Fecha a verificar
   * @param {Date|string} start - Inicio del rango
   * @param {Date|string} end - Fin del rango
   * @returns {boolean} true si está en el rango
   */
  isBetween(date, start, end) {
    const d = this._ensureDate(date);
    const s = this._ensureDate(start);
    const e = this._ensureDate(end);
    return d.getTime() >= s.getTime() && d.getTime() <= e.getTime();
  }

  /**
   * Verifica si dos fechas son el mismo día
   * @param {Date|string} date1 - Primera fecha
   * @param {Date|string} date2 - Segunda fecha
   * @returns {boolean} true si son el mismo día
   */
  isSameDay(date1, date2) {
    const d1 = this._ensureDate(date1);
    const d2 = this._ensureDate(date2);
    return (
      d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear()
    );
  }

  /**
   * Obtiene el nombre del día de la semana
   * @param {Date|string} date - Fecha
   * @param {string} [locale='es-ES'] - Locale para el nombre
   * @returns {string} Nombre del día
   */
  getDayName(date, locale = "es-ES") {
    const d = this._ensureDate(date);
    return d.toLocaleDateString(locale, { weekday: "long" });
  }

  /**
   * Obtiene el nombre del mes
   * @param {Date|string} date - Fecha
   * @param {string} [locale='es-ES'] - Locale para el nombre
   * @returns {string} Nombre del mes
   */
  getMonthName(date, locale = "es-ES") {
    const d = this._ensureDate(date);
    return d.toLocaleDateString(locale, { month: "long" });
  }

  /**
   * Formatea una fecha en formato ISO 8601
   * @param {Date|string} date - Fecha a formatear
   * @returns {string} Fecha en formato ISO
   */
  toISO(date) {
    const d = this._ensureDate(date);
    return d.toISOString();
  }

  /**
   * Formatea una fecha en formato SQL (YYYY-MM-DD HH:mm:ss)
   * @param {Date|string} date - Fecha a formatear
   * @returns {string} Fecha en formato SQL
   */
  toSQL(date) {
    return this.format(date, "yyyy-MM-dd HH:mm:ss");
  }

  /**
   * Formatea una fecha en formato de solo fecha (YYYY-MM-DD)
   * @param {Date|string} date - Fecha a formatear
   * @returns {string} Fecha en formato YYYY-MM-DD
   */
  toDateOnly(date) {
    return this.format(date, "yyyy-MM-dd");
  }

  /**
   * Formatea una fecha en formato de solo hora (HH:mm:ss)
   * @param {Date|string} date - Fecha a formatear
   * @returns {string} Hora en formato HH:mm:ss
   */
  toTimeOnly(date) {
    return this.format(date, "HH:mm:ss");
  }

  /**
   * Obtiene la zona horaria configurada
   * @returns {string} Zona horaria
   */
  getTimezone() {
    return this.timezone;
  }

  /**
   * Configura la zona horaria (solo para testing)
   * @param {string} timezone - Nueva zona horaria
   */
  setTimezone(timezone) {
    if (!timezone || typeof timezone !== "string") {
      throw new Error("La zona horaria debe ser una cadena válida");
    }
    this.timezone = timezone;
  }

  /**
   * Asegura que el valor sea un objeto Date válido
   * @private
   * @param {Date|string} date - Valor a convertir
   * @returns {Date} Objeto Date
   * @throws {Error} Si no se puede convertir a fecha válida
   */
  _ensureDate(date) {
    if (date instanceof Date) {
      if (isNaN(date.getTime())) {
        throw new Error("Fecha inválida");
      }
      return date;
    }

    if (typeof date === "string" || typeof date === "number") {
      const d = new Date(date);
      if (isNaN(d.getTime())) {
        throw new Error(`No se pudo convertir a fecha: ${date}`);
      }
      return d;
    }

    throw new Error("El valor debe ser Date, string o number");
  }
}
