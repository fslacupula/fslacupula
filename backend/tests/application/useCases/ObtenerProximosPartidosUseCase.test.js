import { describe, test, expect, beforeEach } from "@jest/globals";
import { ObtenerProximosPartidosUseCase } from "../../../src/application/useCases/partido/ObtenerProximosPartidosUseCase.js";
import { Partido } from "../../../src/domain/entities/Partido.js";
import { ValidationError } from "../../../src/domain/errors/index.js";

/**
 * Mock del Repositorio de Partidos
 */
class MockPartidoRepository {
  constructor() {
    this.partidos = [];
    this.nextId = 1;
  }

  async findUpcoming(limit = null) {
    const ahora = new Date();
    let proximos = this.partidos
      .filter((p) => new Date(p.fechaHora) > ahora)
      .sort((a, b) => new Date(a.fechaHora) - new Date(b.fechaHora));

    if (limit) {
      proximos = proximos.slice(0, limit);
    }

    return proximos;
  }

  async getNext() {
    const proximos = await this.findUpcoming(1);
    return proximos.length > 0 ? proximos[0] : null;
  }

  async create(partido) {
    const partidoConId = new Partido({
      id: this.nextId++,
      fechaHora: partido.fechaHora,
      rival: partido.rival,
      lugar: partido.lugar,
      tipo: partido.tipo,
      esLocal: partido.esLocal,
      creadoPor: partido.creadoPor,
      resultado: partido.resultado,
      observaciones: partido.observaciones,
    });
    this.partidos.push(partidoConId);
    return partidoConId;
  }

  reset() {
    this.partidos = [];
    this.nextId = 1;
  }
}

describe("ObtenerProximosPartidosUseCase", () => {
  let mockRepository;
  let useCase;

  beforeEach(() => {
    mockRepository = new MockPartidoRepository();
    useCase = new ObtenerProximosPartidosUseCase(mockRepository);
  });

  describe("constructor", () => {
    test("debe requerir partidoRepository", () => {
      expect(() => new ObtenerProximosPartidosUseCase(null)).toThrow(
        "partidoRepository is required"
      );
    });

    test("debe crear instancia correctamente", () => {
      expect(useCase.partidoRepository).toBe(mockRepository);
    });
  });

  describe("execute", () => {
    test("debe obtener partidos futuros ordenados por fecha", async () => {
      const futuro1 = new Date();
      futuro1.setDate(futuro1.getDate() + 5);

      const futuro2 = new Date();
      futuro2.setDate(futuro2.getDate() + 10);

      const futuro3 = new Date();
      futuro3.setDate(futuro3.getDate() + 2);

      await mockRepository.create(
        new Partido({
          id: null,
          fechaHora: futuro1,
          rival: "Rival 1",
          lugar: "Estadio 1",
          tipo: "liga",
          esLocal: true,
          creadoPor: 1,
          resultado: null,
          observaciones: null,
        })
      );

      await mockRepository.create(
        new Partido({
          id: null,
          fechaHora: futuro2,
          rival: "Rival 2",
          lugar: "Estadio 2",
          tipo: "copa",
          esLocal: false,
          creadoPor: 1,
          resultado: null,
          observaciones: null,
        })
      );

      await mockRepository.create(
        new Partido({
          id: null,
          fechaHora: futuro3,
          rival: "Rival 3",
          lugar: "Estadio 3",
          tipo: "amistoso",
          esLocal: true,
          creadoPor: 1,
          resultado: null,
          observaciones: null,
        })
      );

      const resultado = await useCase.execute();

      expect(resultado).toHaveLength(3);
      expect(resultado[0].rival).toBe("Rival 3"); // Más cercano
      expect(resultado[1].rival).toBe("Rival 1");
      expect(resultado[2].rival).toBe("Rival 2"); // Más lejano
    });

    test("debe retornar array vacío si no hay partidos futuros", async () => {
      const pasado = new Date();
      pasado.setDate(pasado.getDate() - 5);

      await mockRepository.create(
        new Partido({
          id: null,
          fechaHora: pasado,
          rival: "Rival Pasado",
          lugar: "Estadio",
          tipo: "liga",
          esLocal: true,
          creadoPor: 1,
          resultado: "3-2",
          observaciones: null,
        })
      );

      const resultado = await useCase.execute();

      expect(resultado).toHaveLength(0);
    });

    test("debe aplicar límite correctamente", async () => {
      for (let i = 1; i <= 5; i++) {
        const futuro = new Date();
        futuro.setDate(futuro.getDate() + i);

        await mockRepository.create(
          new Partido({
            id: null,
            fechaHora: futuro,
            rival: `Rival ${i}`,
            lugar: "Estadio",
            tipo: "liga",
            esLocal: true,
            creadoPor: 1,
            resultado: null,
            observaciones: null,
          })
        );
      }

      const resultado = await useCase.execute({ limit: 3 });

      expect(resultado).toHaveLength(3);
    });

    test("debe filtrar por tipo si se especifica", async () => {
      const futuro = new Date();
      futuro.setDate(futuro.getDate() + 5);

      await mockRepository.create(
        new Partido({
          id: null,
          fechaHora: futuro,
          rival: "Rival Liga 1",
          lugar: "Estadio",
          tipo: "liga",
          esLocal: true,
          creadoPor: 1,
          resultado: null,
          observaciones: null,
        })
      );

      await mockRepository.create(
        new Partido({
          id: null,
          fechaHora: futuro,
          rival: "Rival Copa 1",
          lugar: "Estadio",
          tipo: "copa",
          esLocal: true,
          creadoPor: 1,
          resultado: null,
          observaciones: null,
        })
      );

      await mockRepository.create(
        new Partido({
          id: null,
          fechaHora: futuro,
          rival: "Rival Liga 2",
          lugar: "Estadio",
          tipo: "liga",
          esLocal: true,
          creadoPor: 1,
          resultado: null,
          observaciones: null,
        })
      );

      const resultado = await useCase.execute({ tipo: "liga" });

      expect(resultado).toHaveLength(2);
      expect(resultado.every((p) => p.tipo === "liga")).toBe(true);
    });

    test("debe lanzar error con límite inválido", async () => {
      await expect(useCase.execute({ limit: 0 })).rejects.toThrow(
        ValidationError
      );

      await expect(useCase.execute({ limit: -1 })).rejects.toThrow(
        ValidationError
      );

      await expect(useCase.execute({ limit: 101 })).rejects.toThrow(
        "El límite debe ser un número entre 1 y 100"
      );
    });

    test("debe lanzar error con tipo inválido", async () => {
      await expect(useCase.execute({ tipo: "invalido" })).rejects.toThrow(
        ValidationError
      );

      await expect(useCase.execute({ tipo: "invalido" })).rejects.toThrow(
        "Tipo inválido"
      );
    });
  });

  describe("executeNext", () => {
    test("debe obtener el próximo partido", async () => {
      const futuro1 = new Date();
      futuro1.setDate(futuro1.getDate() + 5);

      const futuro2 = new Date();
      futuro2.setDate(futuro2.getDate() + 2);

      await mockRepository.create(
        new Partido({
          id: null,
          fechaHora: futuro1,
          rival: "Rival Lejano",
          lugar: "Estadio",
          tipo: "liga",
          esLocal: true,
          creadoPor: 1,
          resultado: null,
          observaciones: null,
        })
      );

      await mockRepository.create(
        new Partido({
          id: null,
          fechaHora: futuro2,
          rival: "Rival Cercano",
          lugar: "Estadio",
          tipo: "copa",
          esLocal: true,
          creadoPor: 1,
          resultado: null,
          observaciones: null,
        })
      );

      const resultado = await useCase.executeNext();

      expect(resultado).toBeDefined();
      expect(resultado.rival).toBe("Rival Cercano");
    });

    test("debe retornar null si no hay próximo partido", async () => {
      const pasado = new Date();
      pasado.setDate(pasado.getDate() - 5);

      await mockRepository.create(
        new Partido({
          id: null,
          fechaHora: pasado,
          rival: "Rival Pasado",
          lugar: "Estadio",
          tipo: "liga",
          esLocal: true,
          creadoPor: 1,
          resultado: "3-2",
          observaciones: null,
        })
      );

      const resultado = await useCase.executeNext();

      expect(resultado).toBeNull();
    });
  });
});
