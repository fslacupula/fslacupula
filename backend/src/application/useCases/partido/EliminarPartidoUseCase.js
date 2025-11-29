/**
 * Caso de uso: Eliminar Partido
 * Elimina un partido y todas sus asistencias asociadas
 */

export class EliminarPartidoUseCase {
  constructor(partidoRepository) {
    this.partidoRepository = partidoRepository;
  }

  async execute(id) {
    await this.partidoRepository.delete(id);
    return { message: "Partido eliminado exitosamente" };
  }
}
