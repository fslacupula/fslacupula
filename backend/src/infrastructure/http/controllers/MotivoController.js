/**
 * Controller de Motivos de Ausencia
 */

export class MotivoController {
  constructor(container) {
    this.listarMotivosAusenciaUseCase = container.getUseCase(
      "listarMotivosAusenciaUseCase"
    );
  }

  async listarMotivos(req, res, next) {
    try {
      const motivos = await this.listarMotivosAusenciaUseCase.execute();
      res.json({ motivos });
    } catch (error) {
      next(error);
    }
  }
}

export function createMotivoController(container) {
  const controller = new MotivoController(container);

  return {
    listarMotivos: (req, res, next) => controller.listarMotivos(req, res, next),
  };
}
