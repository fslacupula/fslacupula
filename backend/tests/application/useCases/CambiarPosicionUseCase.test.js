import { describe, test, expect, beforeEach } from "@jest/globals";
import { CambiarPosicionUseCase } from "../../../src/application/useCases/jugador/CambiarPosicionUseCase.js";
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

  async update(id, jugador) {
    const index = this.jugadores.findIndex((j) => j.id === id);
    if (index === -1) return null;

    this.jugadores[index] = jugador;
    return jugador;
  }

  reset() {
    this.jugadores = [];
    this.nextId = 1;
  }
}

describe("CambiarPosicionUseCase", () => {
  let mockRepository;
  let useCase;

  beforeEach(() => {
    mockRepository = new MockJugadorRepository();
    useCase = new CambiarPosicionUseCase(mockRepository);
  });

  describe("constructor", () => {
    test("debe requerir jugadorRepository", () => {
      expect(() => new CambiarPosicionUseCase(null)).toThrow(
        "jugadorRepository is required"
      );
    });

    test("debe crear instancia correctamente", () => {
      expect(useCase.jugadorRepository).toBe(mockRepository);
    });
  });

  describe("execute", () => {
    test("debe cambiar posición correctamente", async () => {
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

      const resultado = await useCase.execute(jugador.id, 2);

      expect(resultado.id).toBe(jugador.id);
      expect(resultado.posicionId).toBe(2);
    });

    test("debe permitir asignar posición a jugador sin posición", async () => {
      const jugador = await mockRepository.create(
        new Jugador({
          id: null,
          usuarioId: 1,
          numeroDorsal: 10,
          posicionId: null,
          telefono: null,
          fechaNacimiento: null,
          alias: null,
          fotoUrl: null,
        })
      );

      const resultado = await useCase.execute(jugador.id, 3);

      expect(resultado.posicionId).toBe(3);
    });

    test("debe lanzar error si jugador no existe", async () => {
      await expect(useCase.execute(999, 1)).rejects.toThrow(ValidationError);

      await expect(useCase.execute(999, 1)).rejects.toThrow(
        "Jugador no encontrado"
      );
    });

    test("debe lanzar error si ID es null", async () => {
      await expect(useCase.execute(null, 1)).rejects.toThrow(ValidationError);

      await expect(useCase.execute(null, 1)).rejects.toThrow(
        "El ID del jugador es requerido"
      );
    });

    test("debe lanzar error si nueva posición es null", async () => {
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

      await expect(useCase.execute(jugador.id, null)).rejects.toThrow(
        ValidationError
      );

      await expect(useCase.execute(jugador.id, null)).rejects.toThrow(
        "El ID de la posición es requerido"
      );
    });

    test("debe permitir cambiar varias veces de posición", async () => {
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

      await useCase.execute(jugador.id, 2);
      await useCase.execute(jugador.id, 3);
      const resultado = await useCase.execute(jugador.id, 4);

      expect(resultado.posicionId).toBe(4);
    });

    test("debe permitir asignar la misma posición", async () => {
      const jugador = await mockRepository.create(
        new Jugador({
          id: null,
          usuarioId: 1,
          numeroDorsal: 10,
          posicionId: 2,
          telefono: null,
          fechaNacimiento: null,
          alias: null,
          fotoUrl: null,
        })
      );

      const resultado = await useCase.execute(jugador.id, 2);

      expect(resultado.posicionId).toBe(2);
    });
  });
});
