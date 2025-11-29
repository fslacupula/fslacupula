import { describe, test, expect, beforeEach } from "@jest/globals";
import { ActualizarPerfilJugadorUseCase } from "../../../src/application/useCases/jugador/ActualizarPerfilJugadorUseCase.js";
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

describe("ActualizarPerfilJugadorUseCase", () => {
  let mockRepository;
  let useCase;

  beforeEach(() => {
    mockRepository = new MockJugadorRepository();
    useCase = new ActualizarPerfilJugadorUseCase(mockRepository);
  });

  describe("constructor", () => {
    test("debe requerir jugadorRepository", () => {
      expect(() => new ActualizarPerfilJugadorUseCase(null)).toThrow(
        "jugadorRepository is required"
      );
    });

    test("debe crear instancia correctamente", () => {
      expect(useCase.jugadorRepository).toBe(mockRepository);
    });
  });

  describe("execute", () => {
    test("debe actualizar teléfono", async () => {
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

      const resultado = await useCase.execute(jugador.id, {
        telefono: "+34600123456",
      });

      expect(resultado.telefono).toBe("+34600123456");
    });

    test("debe actualizar alias", async () => {
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

      const resultado = await useCase.execute(jugador.id, {
        alias: "El Tigre",
      });

      expect(resultado.alias).toBe("El Tigre");
    });

    test("debe actualizar foto URL", async () => {
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

      const resultado = await useCase.execute(jugador.id, {
        fotoUrl: "http://example.com/foto.jpg",
      });

      expect(resultado.fotoUrl).toBe("http://example.com/foto.jpg");
    });

    test("debe actualizar fecha de nacimiento", async () => {
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

      const fecha = new Date("1995-05-15");
      const resultado = await useCase.execute(jugador.id, {
        fechaNacimiento: fecha,
      });

      expect(resultado.fechaNacimiento).toEqual(fecha);
    });

    test("debe actualizar múltiples campos a la vez", async () => {
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

      const fecha = new Date("1995-05-15");
      const resultado = await useCase.execute(jugador.id, {
        telefono: "+34600123456",
        alias: "Juanito",
        fechaNacimiento: fecha,
        fotoUrl: "http://example.com/foto.jpg",
      });

      expect(resultado.telefono).toBe("+34600123456");
      expect(resultado.alias).toBe("Juanito");
      expect(resultado.fechaNacimiento).toEqual(fecha);
      expect(resultado.fotoUrl).toBe("http://example.com/foto.jpg");
    });

    test("debe mantener campos no actualizados", async () => {
      const fecha = new Date("1995-05-15");
      const jugador = await mockRepository.create(
        new Jugador({
          id: null,
          usuarioId: 1,
          numeroDorsal: 10,
          posicionId: 1,
          telefono: "+34600123456",
          fechaNacimiento: fecha,
          alias: "Juanito",
          fotoUrl: "http://example.com/foto.jpg",
        })
      );

      const resultado = await useCase.execute(jugador.id, {
        alias: "El Tigre",
      });

      expect(resultado.alias).toBe("El Tigre");
      expect(resultado.telefono).toBe("+34600123456");
      expect(resultado.fechaNacimiento).toEqual(fecha);
      expect(resultado.fotoUrl).toBe("http://example.com/foto.jpg");
    });

    test("debe lanzar error si jugador no existe", async () => {
      await expect(useCase.execute(999, { alias: "Test" })).rejects.toThrow(
        ValidationError
      );

      await expect(useCase.execute(999, { alias: "Test" })).rejects.toThrow(
        "Jugador no encontrado"
      );
    });

    test("debe lanzar error si ID es null", async () => {
      await expect(useCase.execute(null, { alias: "Test" })).rejects.toThrow(
        ValidationError
      );

      await expect(useCase.execute(null, { alias: "Test" })).rejects.toThrow(
        "El ID del jugador es requerido"
      );
    });

    test("debe lanzar error si no se proporcionan datos para actualizar", async () => {
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

      await expect(useCase.execute(jugador.id, {})).rejects.toThrow(
        ValidationError
      );

      await expect(useCase.execute(jugador.id, {})).rejects.toThrow(
        "Debe proporcionar al menos un campo para actualizar"
      );
    });

    test("debe validar formato de teléfono", async () => {
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

      await expect(
        useCase.execute(jugador.id, { telefono: "123" })
      ).rejects.toThrow(ValidationError);
    });
  });
});
