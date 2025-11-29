import { describe, test, expect, beforeEach } from "@jest/globals";
import { RegistrarResultadoUseCase } from "../../../src/application/useCases/partido/RegistrarResultadoUseCase.js";
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

  async findById(id) {
    return this.partidos.find((p) => p.id === id) || null;
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

  async update(id, partido) {
    const index = this.partidos.findIndex((p) => p.id === id);
    if (index === -1) return null;

    this.partidos[index] = partido;
    return partido;
  }

  reset() {
    this.partidos = [];
    this.nextId = 1;
  }
}

describe("RegistrarResultadoUseCase", () => {
  let mockRepository;
  let useCase;

  beforeEach(() => {
    mockRepository = new MockPartidoRepository();
    useCase = new RegistrarResultadoUseCase(mockRepository);
  });

  describe("constructor", () => {
    test("debe requerir partidoRepository", () => {
      expect(() => new RegistrarResultadoUseCase(null)).toThrow(
        "partidoRepository is required"
      );
    });

    test("debe crear instancia correctamente", () => {
      expect(useCase.partidoRepository).toBe(mockRepository);
    });
  });

  describe("execute", () => {
    test("debe registrar resultado correctamente", async () => {
      const partido = await mockRepository.create(
        new Partido({
          id: null,
          fechaHora: new Date("2024-12-15T18:00:00"),
          rival: "Real Madrid",
          lugar: "Estadio",
          tipo: "liga",
          esLocal: true,
          creadoPor: 1,
          resultado: null,
          observaciones: null,
        })
      );

      const resultado = await useCase.execute(partido.id, "3-2");

      expect(resultado.resultado).toBe("3-2");
      expect(resultado.id).toBe(partido.id);
    });

    test("debe registrar resultado de empate", async () => {
      const partido = await mockRepository.create(
        new Partido({
          id: null,
          fechaHora: new Date("2024-12-15T18:00:00"),
          rival: "FC Barcelona",
          lugar: "Estadio",
          tipo: "liga",
          esLocal: true,
          creadoPor: 1,
          resultado: null,
          observaciones: null,
        })
      );

      const resultado = await useCase.execute(partido.id, "1-1");

      expect(resultado.resultado).toBe("1-1");
    });

    test("debe registrar resultado 0-0", async () => {
      const partido = await mockRepository.create(
        new Partido({
          id: null,
          fechaHora: new Date("2024-12-15T18:00:00"),
          rival: "Atlético Madrid",
          lugar: "Estadio",
          tipo: "copa",
          esLocal: false,
          creadoPor: 1,
          resultado: null,
          observaciones: null,
        })
      );

      const resultado = await useCase.execute(partido.id, "0-0");

      expect(resultado.resultado).toBe("0-0");
    });

    test("debe permitir cambiar resultado existente", async () => {
      const partido = await mockRepository.create(
        new Partido({
          id: null,
          fechaHora: new Date("2024-12-15T18:00:00"),
          rival: "Real Madrid",
          lugar: "Estadio",
          tipo: "liga",
          esLocal: true,
          creadoPor: 1,
          resultado: "2-1",
          observaciones: null,
        })
      );

      const resultado = await useCase.execute(partido.id, "3-2");

      expect(resultado.resultado).toBe("3-2");
    });

    test("debe eliminar espacios en blanco del resultado", async () => {
      const partido = await mockRepository.create(
        new Partido({
          id: null,
          fechaHora: new Date("2024-12-15T18:00:00"),
          rival: "Real Madrid",
          lugar: "Estadio",
          tipo: "liga",
          esLocal: true,
          creadoPor: 1,
          resultado: null,
          observaciones: null,
        })
      );

      const resultado = await useCase.execute(partido.id, "  3-2  ");

      expect(resultado.resultado).toBe("3-2");
    });

    test("debe lanzar error si partido no existe", async () => {
      await expect(useCase.execute(999, "3-2")).rejects.toThrow(
        ValidationError
      );

      await expect(useCase.execute(999, "3-2")).rejects.toThrow(
        "Partido no encontrado"
      );
    });

    test("debe lanzar error si ID es null", async () => {
      await expect(useCase.execute(null, "3-2")).rejects.toThrow(
        ValidationError
      );

      await expect(useCase.execute(null, "3-2")).rejects.toThrow(
        "El ID del partido es requerido"
      );
    });

    test("debe lanzar error si resultado es null", async () => {
      const partido = await mockRepository.create(
        new Partido({
          id: null,
          fechaHora: new Date("2024-12-15T18:00:00"),
          rival: "Real Madrid",
          lugar: "Estadio",
          tipo: "liga",
          esLocal: true,
          creadoPor: 1,
          resultado: null,
          observaciones: null,
        })
      );

      await expect(useCase.execute(partido.id, null)).rejects.toThrow(
        ValidationError
      );

      await expect(useCase.execute(partido.id, null)).rejects.toThrow(
        "El resultado es requerido"
      );
    });

    test("debe lanzar error si resultado es vacío", async () => {
      const partido = await mockRepository.create(
        new Partido({
          id: null,
          fechaHora: new Date("2024-12-15T18:00:00"),
          rival: "Real Madrid",
          lugar: "Estadio",
          tipo: "liga",
          esLocal: true,
          creadoPor: 1,
          resultado: null,
          observaciones: null,
        })
      );

      await expect(useCase.execute(partido.id, "")).rejects.toThrow(
        ValidationError
      );

      await expect(useCase.execute(partido.id, "   ")).rejects.toThrow(
        ValidationError
      );
    });

    test("debe lanzar error con formato de resultado inválido", async () => {
      const partido = await mockRepository.create(
        new Partido({
          id: null,
          fechaHora: new Date("2024-12-15T18:00:00"),
          rival: "Real Madrid",
          lugar: "Estadio",
          tipo: "liga",
          esLocal: true,
          creadoPor: 1,
          resultado: null,
          observaciones: null,
        })
      );

      await expect(useCase.execute(partido.id, "3:2")).rejects.toThrow(
        ValidationError
      );

      await expect(useCase.execute(partido.id, "3-2-1")).rejects.toThrow(
        'El resultado debe tener el formato "X-Y"'
      );

      await expect(useCase.execute(partido.id, "abc")).rejects.toThrow(
        ValidationError
      );
    });
  });
});
