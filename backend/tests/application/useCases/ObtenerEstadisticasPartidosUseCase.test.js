import { describe, test, expect, beforeEach } from "@jest/globals";
import { ObtenerEstadisticasPartidosUseCase } from "../../../src/application/useCases/partido/ObtenerEstadisticasPartidosUseCase.js";
import { Partido } from "../../../src/domain/entities/Partido.js";

class MockPartidoRepository {
  constructor() {
    this.partidos = [];
  }

  async getStats() {
    const total = this.partidos.filter((p) => p.resultado).length;
    let ganados = 0,
      empatados = 0,
      perdidos = 0;

    this.partidos.forEach((partido) => {
      if (!partido.resultado) return;

      const [golesNuestros, golesRival] = partido.resultado
        .split("-")
        .map(Number);
      if (golesNuestros > golesRival) ganados++;
      else if (golesNuestros === golesRival) empatados++;
      else perdidos++;
    });

    return { total, ganados, empatados, perdidos };
  }

  async getStatsByTipo() {
    const stats = [];

    Object.values(Partido.TIPOS).forEach((tipo) => {
      const partidosTipo = this.partidos.filter(
        (p) => p.tipo === tipo && p.resultado
      );
      const total = partidosTipo.length;
      let ganados = 0,
        empatados = 0,
        perdidos = 0;

      partidosTipo.forEach((partido) => {
        const [golesNuestros, golesRival] = partido.resultado
          .split("-")
          .map(Number);
        if (golesNuestros > golesRival) ganados++;
        else if (golesNuestros === golesRival) empatados++;
        else perdidos++;
      });

      stats.push({ tipo, total, ganados, empatados, perdidos });
    });

    return stats;
  }

  async create(partido) {
    const id = this.partidos.length + 1;
    const partidoObj = partido.toObject();
    const partidoConId = new Partido({
      ...partidoObj,
      id,
    });
    this.partidos.push(partidoConId);
    return partidoConId;
  }
}

describe("ObtenerEstadisticasPartidosUseCase", () => {
  let mockRepository;
  let useCase;

  beforeEach(() => {
    mockRepository = new MockPartidoRepository();
    useCase = new ObtenerEstadisticasPartidosUseCase(mockRepository);
  });

  describe("constructor", () => {
    test("debe requerir partidoRepository", () => {
      expect(() => new ObtenerEstadisticasPartidosUseCase()).toThrow(
        "partidoRepository es requerido"
      );
    });

    test("debe crear instancia correctamente", () => {
      const instance = new ObtenerEstadisticasPartidosUseCase(mockRepository);
      expect(instance).toBeInstanceOf(ObtenerEstadisticasPartidosUseCase);
    });
  });

  describe("execute", () => {
    test("debe retornar estadísticas con porcentajes correctos", async () => {
      // Crear partidos: 3 ganados, 1 empate, 1 perdido
      await mockRepository.create(
        new Partido({
          id: null,
          fechaHora: new Date(),
          rival: "Rival 1",
          lugar: "Campo",
          tipo: Partido.TIPOS.LIGA,
          esLocal: true,
          creadoPor: 1,
          resultado: "3-1",
        })
      );
      await mockRepository.create(
        new Partido({
          id: null,
          fechaHora: new Date(),
          rival: "Rival 2",
          lugar: "Campo",
          tipo: Partido.TIPOS.LIGA,
          esLocal: true,
          creadoPor: 1,
          resultado: "2-0",
        })
      );
      await mockRepository.create(
        new Partido({
          id: null,
          fechaHora: new Date(),
          rival: "Rival 3",
          lugar: "Campo",
          tipo: Partido.TIPOS.LIGA,
          esLocal: true,
          creadoPor: 1,
          resultado: "1-1",
        })
      );
      await mockRepository.create(
        new Partido({
          id: null,
          fechaHora: new Date(),
          rival: "Rival 4",
          lugar: "Campo",
          tipo: Partido.TIPOS.LIGA,
          esLocal: true,
          creadoPor: 1,
          resultado: "0-2",
        })
      );
      await mockRepository.create(
        new Partido({
          id: null,
          fechaHora: new Date(),
          rival: "Rival 5",
          lugar: "Campo",
          tipo: Partido.TIPOS.LIGA,
          esLocal: true,
          creadoPor: 1,
          resultado: "4-2",
        })
      );

      const stats = await useCase.execute();

      expect(stats.total).toBe(5);
      expect(stats.ganados).toBe(3);
      expect(stats.empatados).toBe(1);
      expect(stats.perdidos).toBe(1);
      expect(stats.porcentajeVictorias).toBe(60);
      expect(stats.porcentajeEmpates).toBe(20);
      expect(stats.porcentajeDerrotas).toBe(20);
    });

    test("debe retornar estadísticas vacías si no hay partidos", async () => {
      const stats = await useCase.execute();

      expect(stats.total).toBe(0);
      expect(stats.ganados).toBe(0);
      expect(stats.empatados).toBe(0);
      expect(stats.perdidos).toBe(0);
      expect(stats.porcentajeVictorias).toBe(0);
      expect(stats.porcentajeEmpates).toBe(0);
      expect(stats.porcentajeDerrotas).toBe(0);
    });

    test("debe redondear porcentajes correctamente", async () => {
      // 2 ganados, 1 empate (2/3 = 66.66%, 1/3 = 33.33%)
      await mockRepository.create(
        new Partido({
          id: null,
          fechaHora: new Date(),
          rival: "Rival 1",
          lugar: "Campo",
          tipo: Partido.TIPOS.LIGA,
          esLocal: true,
          creadoPor: 1,
          resultado: "2-0",
        })
      );
      await mockRepository.create(
        new Partido({
          id: null,
          fechaHora: new Date(),
          rival: "Rival 2",
          lugar: "Campo",
          tipo: Partido.TIPOS.LIGA,
          esLocal: true,
          creadoPor: 1,
          resultado: "3-1",
        })
      );
      await mockRepository.create(
        new Partido({
          id: null,
          fechaHora: new Date(),
          rival: "Rival 3",
          lugar: "Campo",
          tipo: Partido.TIPOS.LIGA,
          esLocal: true,
          creadoPor: 1,
          resultado: "1-1",
        })
      );

      const stats = await useCase.execute();

      expect(stats.porcentajeVictorias).toBe(67); // Redondeado
      expect(stats.porcentajeEmpates).toBe(33);
      expect(stats.porcentajeDerrotas).toBe(0);
    });

    test("debe ignorar partidos sin resultado", async () => {
      await mockRepository.create(
        new Partido({
          id: null,
          fechaHora: new Date(),
          rival: "Rival 1",
          lugar: "Campo",
          tipo: Partido.TIPOS.LIGA,
          esLocal: true,
          creadoPor: 1,
          resultado: "2-0",
        })
      );
      await mockRepository.create(
        new Partido({
          id: null,
          fechaHora: new Date(),
          rival: "Rival 2",
          lugar: "Campo",
          tipo: Partido.TIPOS.LIGA,
          esLocal: true,
          creadoPor: 1,
          resultado: null,
        })
      );
      await mockRepository.create(
        new Partido({
          id: null,
          fechaHora: new Date(),
          rival: "Rival 3",
          lugar: "Campo",
          tipo: Partido.TIPOS.LIGA,
          esLocal: true,
          creadoPor: 1,
          resultado: null,
        })
      );

      const stats = await useCase.execute();

      expect(stats.total).toBe(1); // Solo cuenta el que tiene resultado
      expect(stats.ganados).toBe(1);
    });
  });

  describe("executeByTipo", () => {
    test("debe retornar estadísticas agrupadas por tipo", async () => {
      // Liga: 2 ganados
      await mockRepository.create(
        new Partido({
          id: null,
          fechaHora: new Date(),
          rival: "Rival 1",
          lugar: "Campo",
          tipo: Partido.TIPOS.LIGA,
          esLocal: true,
          creadoPor: 1,
          resultado: "2-0",
        })
      );
      await mockRepository.create(
        new Partido({
          id: null,
          fechaHora: new Date(),
          rival: "Rival 2",
          lugar: "Campo",
          tipo: Partido.TIPOS.LIGA,
          esLocal: true,
          creadoPor: 1,
          resultado: "3-1",
        })
      );

      // Copa: 1 empate
      await mockRepository.create(
        new Partido({
          id: null,
          fechaHora: new Date(),
          rival: "Rival 3",
          lugar: "Campo",
          tipo: Partido.TIPOS.COPA,
          esLocal: true,
          creadoPor: 1,
          resultado: "1-1",
        })
      );

      // Amistoso: 1 perdido
      await mockRepository.create(
        new Partido({
          id: null,
          fechaHora: new Date(),
          rival: "Rival 4",
          lugar: "Campo",
          tipo: Partido.TIPOS.AMISTOSO,
          esLocal: true,
          creadoPor: 1,
          resultado: "0-2",
        })
      );

      const stats = await useCase.executeByTipo();

      expect(Array.isArray(stats)).toBe(true);
      expect(stats.length).toBe(4); // Todos los tipos

      const liga = stats.find((s) => s.tipo === Partido.TIPOS.LIGA);
      expect(liga.total).toBe(2);
      expect(liga.ganados).toBe(2);
      expect(liga.porcentajeVictorias).toBe(100);

      const copa = stats.find((s) => s.tipo === Partido.TIPOS.COPA);
      expect(copa.total).toBe(1);
      expect(copa.empatados).toBe(1);
      expect(copa.porcentajeEmpates).toBe(100);

      const amistoso = stats.find((s) => s.tipo === Partido.TIPOS.AMISTOSO);
      expect(amistoso.total).toBe(1);
      expect(amistoso.perdidos).toBe(1);
      expect(amistoso.porcentajeDerrotas).toBe(100);
    });

    test("debe incluir todos los tipos incluso sin partidos", async () => {
      await mockRepository.create(
        new Partido({
          id: null,
          fechaHora: new Date(),
          rival: "Rival 1",
          lugar: "Campo",
          tipo: Partido.TIPOS.LIGA,
          esLocal: true,
          creadoPor: 1,
          resultado: "2-0",
        })
      );

      const stats = await useCase.executeByTipo();

      expect(Array.isArray(stats)).toBe(true);
      expect(stats.length).toBe(4); // Todos los tipos

      const liga = stats.find((s) => s.tipo === Partido.TIPOS.LIGA);
      expect(liga.total).toBe(1);

      const copa = stats.find((s) => s.tipo === Partido.TIPOS.COPA);
      expect(copa.total).toBe(0);

      const amistoso = stats.find((s) => s.tipo === Partido.TIPOS.AMISTOSO);
      expect(amistoso.total).toBe(0);

      const torneo = stats.find((s) => s.tipo === Partido.TIPOS.TORNEO);
      expect(torneo.total).toBe(0);
    });
  });

  describe("executeResumen", () => {
    test("debe retornar resumen completo con estadísticas generales y por tipo", async () => {
      await mockRepository.create(
        new Partido({
          id: null,
          fechaHora: new Date(),
          rival: "Rival 1",
          lugar: "Campo",
          tipo: Partido.TIPOS.LIGA,
          esLocal: true,
          creadoPor: 1,
          resultado: "2-0",
        })
      );
      await mockRepository.create(
        new Partido({
          id: null,
          fechaHora: new Date(),
          rival: "Rival 2",
          lugar: "Campo",
          tipo: Partido.TIPOS.COPA,
          esLocal: true,
          creadoPor: 1,
          resultado: "1-1",
        })
      );

      const resumen = await useCase.executeResumen();

      expect(resumen.general).toBeDefined();
      expect(resumen.general.total).toBe(2);
      expect(resumen.general.ganados).toBe(1);
      expect(resumen.general.empatados).toBe(1);

      expect(resumen.porTipo).toBeDefined();
      expect(Array.isArray(resumen.porTipo)).toBe(true);
      expect(resumen.porTipo.length).toBe(4);
    });
  });
});
