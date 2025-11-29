import { describe, test, expect, beforeEach } from "@jest/globals";
import { AsignarDorsalUseCase } from "../../../src/application/useCases/jugador/AsignarDorsalUseCase.js";
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

  async existsByNumeroDorsal(numeroDorsal, excludeId = null) {
    return this.jugadores.some(
      (j) =>
        j.numeroDorsal === numeroDorsal && (!excludeId || j.id !== excludeId)
    );
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

describe("AsignarDorsalUseCase", () => {
  let mockRepository;
  let useCase;

  beforeEach(() => {
    mockRepository = new MockJugadorRepository();
    useCase = new AsignarDorsalUseCase(mockRepository);
  });

  describe("constructor", () => {
    test("debe requerir jugadorRepository", () => {
      expect(() => new AsignarDorsalUseCase(null)).toThrow(
        "jugadorRepository is required"
      );
    });

    test("debe crear instancia correctamente", () => {
      expect(useCase.jugadorRepository).toBe(mockRepository);
    });
  });

  describe("execute", () => {
    test("debe asignar dorsal correctamente", async () => {
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

      const resultado = await useCase.execute(jugador.id, 10);

      expect(resultado.id).toBe(jugador.id);
      expect(resultado.numeroDorsal).toBe(10);
    });

    test("debe cambiar dorsal existente", async () => {
      const jugador = await mockRepository.create(
        new Jugador({
          id: null,
          usuarioId: 1,
          numeroDorsal: 7,
          posicionId: null,
          telefono: null,
          fechaNacimiento: null,
          alias: null,
          fotoUrl: null,
        })
      );

      const resultado = await useCase.execute(jugador.id, 10);

      expect(resultado.numeroDorsal).toBe(10);
    });

    test("debe lanzar error si jugador no existe", async () => {
      await expect(useCase.execute(999, 10)).rejects.toThrow(ValidationError);

      await expect(useCase.execute(999, 10)).rejects.toThrow(
        "Jugador no encontrado"
      );
    });

    test("debe lanzar error si ID es null", async () => {
      await expect(useCase.execute(null, 10)).rejects.toThrow(ValidationError);

      await expect(useCase.execute(null, 10)).rejects.toThrow(
        "El ID del jugador es requerido"
      );
    });

    test("debe lanzar error si dorsal es null", async () => {
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

      await expect(useCase.execute(jugador.id, null)).rejects.toThrow(
        ValidationError
      );

      await expect(useCase.execute(jugador.id, null)).rejects.toThrow(
        "El número de dorsal es requerido"
      );
    });

    test("debe lanzar error si dorsal está en uso por otro jugador", async () => {
      const jugador1 = await mockRepository.create(
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

      const jugador2 = await mockRepository.create(
        new Jugador({
          id: null,
          usuarioId: 2,
          numeroDorsal: 7,
          posicionId: null,
          telefono: null,
          fechaNacimiento: null,
          alias: null,
          fotoUrl: null,
        })
      );

      await expect(useCase.execute(jugador2.id, 10)).rejects.toThrow(
        ValidationError
      );

      await expect(useCase.execute(jugador2.id, 10)).rejects.toThrow(
        "El dorsal 10 ya está en uso por otro jugador"
      );
    });

    test("debe permitir cambiar al mismo dorsal", async () => {
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

      // Asignar el mismo dorsal no debe dar error
      const resultado = await useCase.execute(jugador.id, 10);

      expect(resultado.numeroDorsal).toBe(10);
    });

    test("debe permitir asignar dorsales diferentes a múltiples jugadores", async () => {
      const jugador1 = await mockRepository.create(
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

      const jugador2 = await mockRepository.create(
        new Jugador({
          id: null,
          usuarioId: 2,
          numeroDorsal: null,
          posicionId: null,
          telefono: null,
          fechaNacimiento: null,
          alias: null,
          fotoUrl: null,
        })
      );

      await useCase.execute(jugador1.id, 10);
      await useCase.execute(jugador2.id, 7);

      const j1Updated = await mockRepository.findById(jugador1.id);
      const j2Updated = await mockRepository.findById(jugador2.id);

      expect(j1Updated.numeroDorsal).toBe(10);
      expect(j2Updated.numeroDorsal).toBe(7);
    });
  });
});
