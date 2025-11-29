import { describe, test, expect, beforeEach } from "@jest/globals";
import { ObtenerAsistenciasPorEventoUseCase } from "../../../src/application/useCases/asistencia/ObtenerAsistenciasPorEventoUseCase.js";

class MockAsistenciaRepository {
  constructor() {
    this.asistencias = [];
  }

  async findByPartidoId(partidoId) {
    return this.asistencias.filter((a) => a.partidoId === partidoId);
  }

  async findByEntrenamientoId(entrenamientoId) {
    return this.asistencias.filter(
      (a) => a.entrenamientoId === entrenamientoId
    );
  }

  async create(asistencia) {
    this.asistencias.push(asistencia);
    return asistencia;
  }
}

describe("ObtenerAsistenciasPorEventoUseCase", () => {
  let mockRepository;
  let useCase;

  beforeEach(async () => {
    mockRepository = new MockAsistenciaRepository();
    useCase = new ObtenerAsistenciasPorEventoUseCase(mockRepository);

    // Crear asistencias de prueba para partido 1
    await mockRepository.create({
      id: 1,
      jugadorId: 1,
      partidoId: 1,
      entrenamientoId: null,
      estado: "confirmado",
    });

    await mockRepository.create({
      id: 2,
      jugadorId: 2,
      partidoId: 1,
      entrenamientoId: null,
      estado: "ausente",
      motivoAusenciaId: 1,
    });

    await mockRepository.create({
      id: 3,
      jugadorId: 3,
      partidoId: 1,
      entrenamientoId: null,
      estado: "pendiente",
    });

    // Crear asistencias de prueba para entrenamiento 1
    await mockRepository.create({
      id: 4,
      jugadorId: 1,
      partidoId: null,
      entrenamientoId: 1,
      estado: "confirmado",
    });

    await mockRepository.create({
      id: 5,
      jugadorId: 2,
      partidoId: null,
      entrenamientoId: 1,
      estado: "confirmado",
    });
  });

  describe("constructor", () => {
    test("debe requerir asistenciaRepository", () => {
      expect(() => new ObtenerAsistenciasPorEventoUseCase()).toThrow(
        "asistenciaRepository es requerido"
      );
    });

    test("debe crear instancia correctamente", () => {
      expect(useCase).toBeInstanceOf(ObtenerAsistenciasPorEventoUseCase);
      expect(useCase.asistenciaRepository).toBe(mockRepository);
    });
  });

  describe("execute", () => {
    test("debe obtener asistencias de un partido", async () => {
      const resultado = await useCase.execute({ partidoId: 1 });

      expect(resultado).toHaveLength(3);
      expect(resultado.every((a) => a.partidoId === 1)).toBe(true);
    });

    test("debe obtener asistencias de un entrenamiento", async () => {
      const resultado = await useCase.execute({ entrenamientoId: 1 });

      expect(resultado).toHaveLength(2);
      expect(resultado.every((a) => a.entrenamientoId === 1)).toBe(true);
    });

    test("debe retornar array vacío si no hay asistencias", async () => {
      const resultado = await useCase.execute({ partidoId: 999 });

      expect(resultado).toHaveLength(0);
    });

    test("debe lanzar error si no se proporciona evento", async () => {
      await expect(useCase.execute({})).rejects.toThrow(
        "Debe proporcionar partidoId o entrenamientoId"
      );
    });

    test("debe lanzar error si se proporcionan ambos eventos", async () => {
      await expect(
        useCase.execute({ partidoId: 1, entrenamientoId: 1 })
      ).rejects.toThrow(
        "No puede proporcionar partidoId y entrenamientoId al mismo tiempo"
      );
    });
  });

  describe("executeAgrupadas", () => {
    test("debe agrupar asistencias por estado", async () => {
      const resultado = await useCase.executeAgrupadas({ partidoId: 1 });

      expect(resultado).toHaveProperty("confirmados");
      expect(resultado).toHaveProperty("ausentes");
      expect(resultado).toHaveProperty("pendientes");
      expect(resultado.confirmados).toHaveLength(1);
      expect(resultado.ausentes).toHaveLength(1);
      expect(resultado.pendientes).toHaveLength(1);
    });

    test("debe manejar evento sin asistencias", async () => {
      const resultado = await useCase.executeAgrupadas({ partidoId: 999 });

      expect(resultado.confirmados).toHaveLength(0);
      expect(resultado.ausentes).toHaveLength(0);
      expect(resultado.pendientes).toHaveLength(0);
    });

    test("debe agrupar asistencias de entrenamiento", async () => {
      const resultado = await useCase.executeAgrupadas({
        entrenamientoId: 1,
      });

      expect(resultado.confirmados).toHaveLength(2);
      expect(resultado.ausentes).toHaveLength(0);
      expect(resultado.pendientes).toHaveLength(0);
    });
  });

  describe("executeResumen", () => {
    test("debe calcular resumen de asistencias de partido", async () => {
      const resultado = await useCase.executeResumen({ partidoId: 1 });

      expect(resultado).toHaveProperty("total");
      expect(resultado).toHaveProperty("confirmados");
      expect(resultado).toHaveProperty("ausentes");
      expect(resultado).toHaveProperty("pendientes");
      expect(resultado).toHaveProperty("porcentajeAsistencia");
      expect(resultado.total).toBe(3);
      expect(resultado.confirmados).toBe(1);
      expect(resultado.ausentes).toBe(1);
      expect(resultado.pendientes).toBe(1);
      expect(resultado.porcentajeAsistencia).toBe(33);
    });

    test("debe calcular resumen de entrenamiento", async () => {
      const resultado = await useCase.executeResumen({ entrenamientoId: 1 });

      expect(resultado.total).toBe(2);
      expect(resultado.confirmados).toBe(2);
      expect(resultado.ausentes).toBe(0);
      expect(resultado.pendientes).toBe(0);
      expect(resultado.porcentajeAsistencia).toBe(100);
    });

    test("debe manejar evento sin asistencias", async () => {
      const resultado = await useCase.executeResumen({ partidoId: 999 });

      expect(resultado.total).toBe(0);
      expect(resultado.confirmados).toBe(0);
      expect(resultado.porcentajeAsistencia).toBe(0);
    });
  });
});
