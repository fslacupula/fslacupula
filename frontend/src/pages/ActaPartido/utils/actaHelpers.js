/**
 * Formatea una fecha ISO a formato español con hora
 */
export const formatearFecha = (fechaISO) => {
  const fecha = new Date(fechaISO);
  return fecha.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Convierte segundos a formato de minutos (e.g., "45'")
 */
export const formatearTiempo = (segundos) => {
  const minutos = Math.floor((segundos || 0) / 60);
  return `${minutos}'`;
};

/**
 * Retorna el emoji correspondiente a cada tipo de acción
 */
export const obtenerIconoAccion = (accion) => {
  switch (accion) {
    case "gol":
      return "⚽";
    case "asistencia":
      return "👟";
    case "amarilla":
      return "🟨";
    case "roja":
      return "🟥";
    case "falta":
      return "🚫";
    case "parada":
      return "🧤";
    case "tiempo_muerto":
      return "⏸️";
    default:
      return "•";
  }
};

/**
 * Cuenta tarjetas del historial por equipo y tipo
 */
export const contarTarjetasHistorial = (historial, equipo, tipoTarjeta) => {
  return historial.filter(
    (accion) => accion.equipo === equipo && accion.accion === tipoTarjeta
  ).length;
};
