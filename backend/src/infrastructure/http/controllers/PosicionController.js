/**
 * Controller de Posiciones
 */

export class PosicionController {
  constructor(container) {
    this.listarPosicionesUseCase = container.getUseCase(
      "listarPosicionesUseCase"
    );
  }

  async listarPosiciones(req, res, next) {
    try {
      const posiciones = await this.listarPosicionesUseCase.execute();
      res.json({ posiciones });
    } catch (error) {
      next(error);
    }
  }
}

export function createPosicionController(container) {
  const controller = new PosicionController(container);

  return {
    listarPosiciones: (req, res, next) =>
      controller.listarPosiciones(req, res, next),
  };
}
