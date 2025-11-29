/**
 * Caso de uso: Obtener Partido por ID
 * Obtiene un partido específico con sus asistencias y datos completos de jugadores
 */

export class ObtenerPartidoPorIdUseCase {
  constructor(partidoRepository) {
    this.partidoRepository = partidoRepository;
  }

  async execute(id) {
    const partido = await this.partidoRepository.findByIdWithPlayerData(id);
    return partido;
  }
}
