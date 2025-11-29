/**
 * Caso de uso: Listar Partidos
 * Lista partidos con filtros opcionales de fecha
 */

export class ListarPartidosUseCase {
  constructor(partidoRepository) {
    this.partidoRepository = partidoRepository;
  }

  async execute({ fechaDesde, fechaHasta } = {}) {
    const partidos = await this.partidoRepository.findAll({
      fechaDesde,
      fechaHasta,
    });
    return partidos;
  }
}
