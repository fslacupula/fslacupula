/**
 * Helpers de fechas compartidos
 * Utilidades para manipular y formatear fechas sin conversión de zona horaria
 */

/**
 * Extrae la fecha en formato YYYY-MM-DD sin conversión de zona horaria
 */
export function getFechaString(fecha: string | Date): string {
  if (!fecha) return "";
  if (typeof fecha === "string") {
    return fecha.split("T")[0];
  }
  return "";
}

/**
 * Compara dos fechas sin conversión de zona horaria
 * @returns número negativo si fecha1 < fecha2, 0 si son iguales, positivo si fecha1 > fecha2
 */
export function compararFechas(fechaStr1: string, fechaStr2: string): number {
  const f1 = getFechaString(fechaStr1);
  const f2 = getFechaString(fechaStr2);
  return f1.localeCompare(f2);
}

/**
 * Formatea una fecha en formato legible en español
 */
export function formatearFechaLarga(fecha: string): string {
  const fechaStr = getFechaString(fecha);
  const [year, month, day] = fechaStr.split("-");
  const fechaObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  return fechaObj.toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Obtiene los días de un mes para renderizar un calendario
 * @returns Array con fechas del mes (o null para días vacíos al inicio)
 */
export function getDiasDelMes(fecha: Date): (Date | null)[] {
  const year = fecha.getFullYear();
  const month = fecha.getMonth();
  const primerDia = new Date(year, month, 1);
  const diasEnMes = new Date(year, month + 1, 0).getDate();
  let primerDiaSemana = primerDia.getDay();

  // Ajustar para que lunes sea 0 (domingo es 6)
  primerDiaSemana = primerDiaSemana === 0 ? 6 : primerDiaSemana - 1;

  const dias: (Date | null)[] = [];
  // Días vacíos al inicio
  for (let i = 0; i < primerDiaSemana; i++) {
    dias.push(null);
  }
  // Días del mes
  for (let i = 1; i <= diasEnMes; i++) {
    dias.push(new Date(year, month, i));
  }
  return dias;
}

/**
 * Verifica si una fecha es hoy
 */
export function esHoy(fecha: Date): boolean {
  return fecha.toDateString() === new Date().toDateString();
}

/**
 * Obtiene una fecha en formato YYYY-MM-DD desde un objeto Date
 */
export function getFechaFromDate(fecha: Date): string {
  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, "0");
  const day = String(fecha.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
