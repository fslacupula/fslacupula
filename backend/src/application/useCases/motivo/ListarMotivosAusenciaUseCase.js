/**
 * Caso de uso: Listar todos los motivos de ausencia
 */
export class ListarMotivosAusenciaUseCase {
  constructor(motivoRepository) {
    this.motivoRepository = motivoRepository;
  }

  /**
   * Ejecuta el caso de uso
   * @returns {Promise<Array>} Lista de motivos de ausencia
   */
  async execute() {
    return await this.motivoRepository.findAll();
  }
}
