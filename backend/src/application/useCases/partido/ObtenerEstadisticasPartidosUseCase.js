/**
 * Caso de Uso: Obtener Estadísticas de Partidos
 *
 * Responsabilidad: Recuperar estadísticas generales y por tipo de los partidos.
 *
 * Flujo:
 * 1. Consultar estadísticas generales en el repositorio
 * 2. Consultar estadísticas por tipo
 * 3. Calcular métricas adicionales
 * 4. Retornar estadísticas completas
 */
export class ObtenerEstadisticasPartidosUseCase {
  /**
   * @param {IPartidoRepository} partidoRepository - Repositorio de partidos
   */
  constructor(partidoRepository) {
    if (!partidoRepository) {
      throw new Error("partidoRepository es requerido");
    }
    this.partidoRepository = partidoRepository;
  }

  /**
   * Ejecuta el caso de uso - estadísticas generales
   *
   * @returns {Promise<Object>} Estadísticas de partidos
   */
  async execute() {
    const stats = await this.partidoRepository.getStats();

    // Calcular porcentajes si hay partidos con resultado
    const partidosJugados = stats.ganados + stats.empatados + stats.perdidos;

    if (partidosJugados > 0) {
      stats.porcentajeVictorias = Math.round(
        (stats.ganados / partidosJugados) * 100
      );
      stats.porcentajeEmpates = Math.round(
        (stats.empatados / partidosJugados) * 100
      );
      stats.porcentajeDerrotas = Math.round(
        (stats.perdidos / partidosJugados) * 100
      );
    } else {
      stats.porcentajeVictorias = 0;
      stats.porcentajeEmpates = 0;
      stats.porcentajeDerrotas = 0;
    }

    stats.partidosJugados = partidosJugados;

    return stats;
  }

  /**
   * Obtiene estadísticas por tipo de partido
   *
   * @returns {Promise<Array>} Estadísticas agrupadas por tipo
   */
  async executeByTipo() {
    const statsByTipo = await this.partidoRepository.getStatsByTipo();

    // Calcular porcentajes para cada tipo
    return statsByTipo.map((stat) => {
      const jugados = stat.ganados + stat.empatados + stat.perdidos;

      return {
        ...stat,
        partidosJugados: jugados,
        porcentajeVictorias:
          jugados > 0 ? Math.round((stat.ganados / jugados) * 100) : 0,
        porcentajeEmpates:
          jugados > 0 ? Math.round((stat.empatados / jugados) * 100) : 0,
        porcentajeDerrotas:
          jugados > 0 ? Math.round((stat.perdidos / jugados) * 100) : 0,
      };
    });
  }

  /**
   * Obtiene un resumen completo de estadísticas
   *
   * @returns {Promise<Object>} Resumen completo
   */
  async executeResumen() {
    const [general, porTipo] = await Promise.all([
      this.execute(),
      this.executeByTipo(),
    ]);

    return {
      general,
      porTipo,
    };
  }
}
