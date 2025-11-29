import { describe, test, expect, beforeEach } from "@jest/globals";
import { ObtenerJugadorPorIdUseCase } from "../../../src/application/useCases/jugador/ObtenerJugadorPorIdUseCase.js";
import { Jugador } from "../../../src/domain/entities/Jugador.js";
import { ValidationError } from "../../../src/domain/errors/index.js";

/**
 * Mock del Repositorio de Jugadores
 */
class MockJugadorRepository {
  constructor() {
    this.jugadores = [];
    this.nextId = 1;
  }

  async findById(id) {
    return this.jugadores.find((j) => j.id === id) || null;
  }

  async create(jugador) {
    const jugadorConId = new Jugador({
      id: this.nextId++,
      usuarioId: jugador.usuarioId,
      numeroDorsal: jugador.numeroDorsal,
      posicionId: jugador.posicionId,
      telefono: jugador.telefono,
      fechaNacimiento: jugador.fechaNacimiento,
      alias: jugador.alias,
      fotoUrl: jugador.fotoUrl,
    });
    this.jugadores.push(jugadorConId);
    return jugadorConId;
  }

  reset() {
    this.jugadores = [];
    this.nextId = 1;
  }
}

describe("ObtenerJugadorPorIdUseCase", () => {
  let mockRepository;
  let useCase;

  beforeEach(() => {
    mockRepository = new MockJugadorRepository();
    useCase = new ObtenerJugadorPorIdUseCase(mockRepository);
  });

  describe("constructor", () => {
    test("debe requerir jugadorRepository", () => {
      expect(() => new ObtenerJugadorPorIdUseCase(null)).toThrow(
        "jugadorRepository is required"
      );
    });

    test("debe crear instancia correctamente", () => {
      expect(useCase.jugadorRepository).toBe(mockRepository);
    });
  });

  describe("execute", () => {
    test("debe obtener jugador por ID correctamente", async () => {
      const jugador = await mockRepository.create(
        new Jugador({
          id: null,
          usuarioId: 1,
          numeroDorsal: 10,
          posicionId: 1,
          telefono: "+34600123456",
          fechaNacimiento: new Date("1995-05-15"),
          alias: "Juanito",
          fotoUrl: "http://example.com/foto.jpg",
        })
      );

      const resultado = await useCase.execute(jugador.id);

      expect(resultado).toBeDefined();
      expect(resultado.id).toBe(jugador.id);
      expect(resultado.usuarioId).toBe(1);
      expect(resultado.numeroDorsal).toBe(10);
      expect(resultado.posicionId).toBe(1);
      expect(resultado.telefono).toBe("+34600123456");
      expect(resultado.alias).toBe("Juanito");
      expect(resultado.fotoUrl).toBe("http://example.com/foto.jpg");
    });

    test("debe obtener jugador con datos mínimos", async () => {
      const jugador = await mockRepository.create(
        new Jugador({
          id: null,
          usuarioId: 1,
          numeroDorsal: null,
          posicionId: null,
          telefono: null,
          fechaNacimiento: null,
          alias: null,
          fotoUrl: null,
        })
      );

      const resultado = await useCase.execute(jugador.id);

      expect(resultado).toBeDefined();
      expect(resultado.id).toBe(jugador.id);
      expect(resultado.usuarioId).toBe(1);
      expect(resultado.numeroDorsal).toBeNull();
      expect(resultado.posicionId).toBeNull();
    });

    test("debe lanzar error si jugador no existe", async () => {
      await expect(useCase.execute(999)).rejects.toThrow(ValidationError);

      await expect(useCase.execute(999)).rejects.toThrow(
        "Jugador no encontrado"
      );
    });

    test("debe lanzar error si ID es null", async () => {
      await expect(useCase.execute(null)).rejects.toThrow(ValidationError);

      await expect(useCase.execute(null)).rejects.toThrow(
        "El ID del jugador es requerido"
      );
    });

    test("debe lanzar error si ID es undefined", async () => {
      await expect(useCase.execute(undefined)).rejects.toThrow(ValidationError);

      await expect(useCase.execute(undefined)).rejects.toThrow(
        "El ID del jugador es requerido"
      );
    });

    test("debe retornar objeto plano", async () => {
      const jugador = await mockRepository.create(
        new Jugador({
          id: null,
          usuarioId: 1,
          numeroDorsal: 10,
          posicionId: 1,
          telefono: null,
          fechaNacimiento: null,
          alias: null,
          fotoUrl: null,
        })
      );

      const resultado = await useCase.execute(jugador.id);

      expect(typeof resultado).toBe("object");
      expect(resultado.constructor.name).not.toBe("Jugador");
    });
  });
});
