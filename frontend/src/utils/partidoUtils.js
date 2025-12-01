/**
 * Utilidades para gestión de partidos
 */

/**
 * Formatea segundos a formato mm:ss
 * @param {number} segundos - Tiempo en segundos
 * @returns {string} Tiempo formateado (ej: "05:30")
 */
export const formatearTiempo = (segundos) => {
  const mins = Math.floor(segundos / 60);
  const segs = Math.floor(segundos % 60);
  return `${String(mins).padStart(2, "0")}:${String(segs).padStart(2, "0")}`;
};

/**
 * Verifica si un jugador es del equipo visitante
 * @param {string|number} jugadorId - ID del jugador
 * @returns {boolean}
 */
export const esJugadorVisitante = (jugadorId) => {
  if (!jugadorId) return false;
  const id = jugadorId.toString();
  return id.startsWith("visitante-") || id.includes("-visitante-");
};

/**
 * Verifica si un jugador es staff
 * @param {string|number} jugadorId - ID del jugador
 * @returns {boolean}
 */
export const esStaff = (jugadorId) => {
  if (!jugadorId) return false;
  return jugadorId.toString().startsWith("staff-");
};

/**
 * Calcula el tiempo actual del cronómetro
 * @param {number} tiempoAcumulado - Tiempo acumulado en segundos
 * @param {boolean} activo - Si el cronómetro está activo
 * @param {number|null} timestampInicio - Timestamp de inicio
 * @returns {number} Tiempo total en segundos
 */
export const calcularTiempoActual = (
  tiempoAcumulado,
  activo,
  timestampInicio
) => {
  if (activo && timestampInicio) {
    return tiempoAcumulado + (Date.now() - timestampInicio) / 1000;
  }
  return tiempoAcumulado;
};
