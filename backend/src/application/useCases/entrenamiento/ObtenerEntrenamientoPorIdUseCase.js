/**
 * Caso de uso: Obtener Entrenamiento por ID
 * Obtiene un entrenamiento específico con sus asistencias
 */

export class ObtenerEntrenamientoPorIdUseCase {
  constructor(entrenamientoRepository) {
    this.entrenamientoRepository = entrenamientoRepository;
  }

  async execute(id) {
    const entrenamiento =
      await this.entrenamientoRepository.findByIdWithPlayerData(id);
    return entrenamiento;
  }
}
