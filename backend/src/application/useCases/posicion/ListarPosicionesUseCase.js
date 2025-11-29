/**
 * Caso de uso: Listar todas las posiciones disponibles
 */
export class ListarPosicionesUseCase {
  constructor(posicionRepository) {
    this.posicionRepository = posicionRepository;
  }

  /**
   * Ejecuta el caso de uso
   * @returns {Promise<Array>} Lista de posiciones
   */
  async execute() {
    return await this.posicionRepository.findAll();
  }
}
