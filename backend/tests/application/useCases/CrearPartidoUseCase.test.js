import { describe, test, expect, beforeEach } from "@jest/globals";
import { CrearPartidoUseCase } from "../../../src/application/useCases/partido/CrearPartidoUseCase.js";
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

describe("CrearPartidoUseCase", () => {
  let mockRepository;
  let useCase;

  beforeEach(() => {
    mockRepository = new MockPartidoRepository();
    useCase = new CrearPartidoUseCase(mockRepository);
  });

  describe("constructor", () => {
    test("debe requerir partidoRepository", () => {
      expect(() => new CrearPartidoUseCase(null)).toThrow(
        "partidoRepository is required"
      );
    });

    test("debe crear instancia correctamente", () => {
      expect(useCase.partidoRepository).toBe(mockRepository);
    });
  });

  describe("execute", () => {
    test("debe crear partido correctamente con datos completos", async () => {
      const fechaPartido = new Date("2024-12-15T18:00:00");

      const resultado = await useCase.execute({
        fechaHora: fechaPartido,
        rival: "Real Madrid",
        lugar: "Estadio Santiago Bernabéu",
        tipo: "liga",
        esLocal: false,
        creadoPor: 1,
        observaciones: "Partido importante",
      });

      expect(resultado.id).toBe(1);
      expect(resultado.rival).toBe("Real Madrid");
      expect(resultado.lugar).toBe("Estadio Santiago Bernabéu");
      expect(resultado.tipo).toBe("liga");
      expect(resultado.esLocal).toBe(false);
      expect(resultado.creadoPor).toBe(1);
      expect(resultado.observaciones).toBe("Partido importante");
      expect(resultado.resultado).toBeNull();
    });

    test("debe crear partido sin observaciones", async () => {
      const fechaPartido = new Date("2024-12-15T18:00:00");

      const resultado = await useCase.execute({
        fechaHora: fechaPartido,
        rival: "FC Barcelona",
        lugar: "Camp Nou",
        tipo: "amistoso",
        esLocal: false,
        creadoPor: 1,
      });

      expect(resultado.id).toBe(1);
      expect(resultado.observaciones).toBeNull();
    });

    test("debe crear partido local", async () => {
      const fechaPartido = new Date("2024-12-15T18:00:00");

      const resultado = await useCase.execute({
        fechaHora: fechaPartido,
        rival: "Atlético Madrid",
        lugar: "Nuestro Estadio",
        tipo: "copa",
        esLocal: true,
        creadoPor: 1,
      });

      expect(resultado.esLocal).toBe(true);
    });

    test("debe permitir diferentes tipos de partido", async () => {
      const fechaPartido = new Date("2024-12-15T18:00:00");

      const tipos = ["liga", "amistoso", "copa", "torneo"];

      for (const tipo of tipos) {
        const resultado = await useCase.execute({
          fechaHora: fechaPartido,
          rival: `Rival ${tipo}`,
          lugar: "Estadio",
          tipo,
          esLocal: true,
          creadoPor: 1,
        });

        expect(resultado.tipo).toBe(tipo);
      }
    });

    test("debe lanzar error si falta fechaHora", async () => {
      await expect(
        useCase.execute({
          rival: "Real Madrid",
          lugar: "Estadio",
          tipo: "liga",
          esLocal: true,
          creadoPor: 1,
        })
      ).rejects.toThrow(ValidationError);

      await expect(
        useCase.execute({
          rival: "Real Madrid",
          lugar: "Estadio",
          tipo: "liga",
          esLocal: true,
          creadoPor: 1,
        })
      ).rejects.toThrow("La fecha y hora del partido son requeridas");
    });

    test("debe lanzar error si falta rival", async () => {
      await expect(
        useCase.execute({
          fechaHora: new Date("2024-12-15T18:00:00"),
          lugar: "Estadio",
          tipo: "liga",
          esLocal: true,
          creadoPor: 1,
        })
      ).rejects.toThrow(ValidationError);

      await expect(
        useCase.execute({
          fechaHora: new Date("2024-12-15T18:00:00"),
          lugar: "Estadio",
          tipo: "liga",
          esLocal: true,
          creadoPor: 1,
        })
      ).rejects.toThrow("El rival es requerido");
    });

    test("debe lanzar error si falta lugar", async () => {
      await expect(
        useCase.execute({
          fechaHora: new Date("2024-12-15T18:00:00"),
          rival: "Real Madrid",
          tipo: "liga",
          esLocal: true,
          creadoPor: 1,
        })
      ).rejects.toThrow(ValidationError);

      await expect(
        useCase.execute({
          fechaHora: new Date("2024-12-15T18:00:00"),
          rival: "Real Madrid",
          tipo: "liga",
          esLocal: true,
          creadoPor: 1,
        })
      ).rejects.toThrow("El lugar es requerido");
    });

    test("debe lanzar error si falta tipo", async () => {
      await expect(
        useCase.execute({
          fechaHora: new Date("2024-12-15T18:00:00"),
          rival: "Real Madrid",
          lugar: "Estadio",
          esLocal: true,
          creadoPor: 1,
        })
      ).rejects.toThrow(ValidationError);

      await expect(
        useCase.execute({
          fechaHora: new Date("2024-12-15T18:00:00"),
          rival: "Real Madrid",
          lugar: "Estadio",
          esLocal: true,
          creadoPor: 1,
        })
      ).rejects.toThrow("El tipo de partido es requerido");
    });

    test("debe lanzar error si falta esLocal", async () => {
      await expect(
        useCase.execute({
          fechaHora: new Date("2024-12-15T18:00:00"),
          rival: "Real Madrid",
          lugar: "Estadio",
          tipo: "liga",
          creadoPor: 1,
        })
      ).rejects.toThrow(ValidationError);

      await expect(
        useCase.execute({
          fechaHora: new Date("2024-12-15T18:00:00"),
          rival: "Real Madrid",
          lugar: "Estadio",
          tipo: "liga",
          creadoPor: 1,
        })
      ).rejects.toThrow("Debe indicar si el partido es local o visitante");
    });

    test("debe lanzar error si falta creadoPor", async () => {
      await expect(
        useCase.execute({
          fechaHora: new Date("2024-12-15T18:00:00"),
          rival: "Real Madrid",
          lugar: "Estadio",
          tipo: "liga",
          esLocal: true,
        })
      ).rejects.toThrow(ValidationError);

      await expect(
        useCase.execute({
          fechaHora: new Date("2024-12-15T18:00:00"),
          rival: "Real Madrid",
          lugar: "Estadio",
          tipo: "liga",
          esLocal: true,
        })
      ).rejects.toThrow("El ID del usuario creador es requerido");
    });

    test("debe lanzar error con tipo inválido", async () => {
      await expect(
        useCase.execute({
          fechaHora: new Date("2024-12-15T18:00:00"),
          rival: "Real Madrid",
          lugar: "Estadio",
          tipo: "invalido",
          esLocal: true,
          creadoPor: 1,
        })
      ).rejects.toThrow(ValidationError);

      await expect(
        useCase.execute({
          fechaHora: new Date("2024-12-15T18:00:00"),
          rival: "Real Madrid",
          lugar: "Estadio",
          tipo: "invalido",
          esLocal: true,
          creadoPor: 1,
        })
      ).rejects.toThrow("Tipo de partido inválido");
    });

    test("debe crear múltiples partidos", async () => {
      const fechaPartido = new Date("2024-12-15T18:00:00");

      await useCase.execute({
        fechaHora: fechaPartido,
        rival: "Real Madrid",
        lugar: "Estadio 1",
        tipo: "liga",
        esLocal: true,
        creadoPor: 1,
      });

      await useCase.execute({
        fechaHora: new Date("2024-12-20T20:00:00"),
        rival: "FC Barcelona",
        lugar: "Estadio 2",
        tipo: "copa",
        esLocal: false,
        creadoPor: 1,
      });

      expect(mockRepository.partidos.length).toBe(2);
    });
  });
});
