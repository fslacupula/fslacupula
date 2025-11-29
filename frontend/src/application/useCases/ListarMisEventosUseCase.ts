import { Entrenamiento, Partido } from "@domain";
import type { IEventoRepository, FiltrosEvento } from "../repositories";

/**
 * Resultado de listar eventos
 */
export interface MisEventosResult {
  entrenamientos: Entrenamiento[];
  partidos: Partido[];
  total: number;
}

/**
 * Caso de uso: Listar Mis Eventos
 *
 * Permite a un jugador ver todos sus próximos entrenamientos y partidos.
 * Ordena los eventos cronológicamente y permite filtrar por fechas.
 */
export class ListarMisEventosUseCase {
  constructor(private readonly eventoRepository: IEventoRepository) {}

  /**
   * Ejecuta el caso de uso
   * @param filtros Filtros opcionales (fechas, paginación)
   * @returns Promise con entrenamientos y partidos
   */
  async execute(filtros?: FiltrosEvento): Promise<MisEventosResult> {
    // Obtener entrenamientos y partidos en paralelo
    const [entrenamientos, partidos] = await Promise.all([
      this.eventoRepository.listarEntrenamientos(filtros),
      this.eventoRepository.listarPartidos(filtros),
    ]);

    return {
      entrenamientos,
      partidos,
      total: entrenamientos.length + partidos.length,
    };
  }

  /**
   * Lista solo eventos futuros (desde hoy)
   * @returns Promise con eventos futuros
   */
  async listarProximos(): Promise<MisEventosResult> {
    const hoy = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    return await this.execute({
      fechaDesde: hoy,
    });
  }

  /**
   * Lista eventos en un rango de fechas
   * @param fechaDesde Fecha desde (YYYY-MM-DD)
   * @param fechaHasta Fecha hasta (YYYY-MM-DD)
   * @returns Promise con eventos en el rango
   */
  async listarPorRango(
    fechaDesde: string,
    fechaHasta: string
  ): Promise<MisEventosResult> {
    return await this.execute({
      fechaDesde,
      fechaHasta,
    });
  }

  /**
   * Lista eventos del mes actual
   * @returns Promise con eventos del mes
   */
  async listarEsteMes(): Promise<MisEventosResult> {
    const hoy = new Date();
    const primerDia = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const ultimoDia = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);

    return await this.execute({
      fechaDesde: primerDia.toISOString().split("T")[0],
      fechaHasta: ultimoDia.toISOString().split("T")[0],
    });
  }
}
