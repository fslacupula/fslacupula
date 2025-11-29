import { describe, test, expect, beforeEach } from "@jest/globals";
import { ListarJugadoresUseCase } from "../../../src/application/useCases/jugador/ListarJugadoresUseCase.js";
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

  async findAll(opciones = {}) {
    let resultados = [...this.jugadores];

    // Si no hay opciones de paginación, retornar todos los jugadores directamente
    if (!opciones.page && !opciones.limit) {
      // Aplicar filtros
      if (opciones.posicionId !== undefined) {
        resultados = resultados.filter(
          (j) => j.posicionId === opciones.posicionId
        );
      }

      return {
        jugadores: resultados,
        total: resultados.length,
      };
    }

    // Si hay paginación, aplicar lógica de paginación
    const page = opciones.page || 1;
    const limit = opciones.limit || 10;

    // Aplicar filtros
    if (opciones.posicionId !== undefined) {
      resultados = resultados.filter(
        (j) => j.posicionId === opciones.posicionId
      );
    }

    // Aplicar paginación
    const skip = (page - 1) * limit;
    const paginados = resultados.slice(skip, skip + limit);

    return {
      jugadores: paginados,
      total: resultados.length,
      page: page,
      totalPages: Math.ceil(resultados.length / limit),
    };
  }

  async findByPosicion(posicionId) {
    return this.jugadores.filter((j) => j.posicionId === posicionId);
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

describe("ListarJugadoresUseCase", () => {
  let mockRepository;
  let useCase;

  beforeEach(() => {
    mockRepository = new MockJugadorRepository();
    useCase = new ListarJugadoresUseCase(mockRepository);
  });

  describe("constructor", () => {
    test("debe requerir jugadorRepository", () => {
      expect(() => new ListarJugadoresUseCase(null)).toThrow(
        "jugadorRepository is required"
      );
    });

    test("debe crear instancia correctamente", () => {
      expect(useCase.jugadorRepository).toBe(mockRepository);
    });
  });

  describe("execute - con paginación", () => {
    test("debe listar jugadores con paginación por defecto", async () => {
      // Crear 5 jugadores
      for (let i = 1; i <= 5; i++) {
        await mockRepository.create(
          new Jugador({
            id: null,
            usuarioId: i,
            numeroDorsal: i,
            posicionId: null,
            telefono: null,
            fechaNacimiento: null,
            alias: null,
            fotoUrl: null,
          })
        );
      }

      const resultado = await useCase.execute();

      expect(resultado.jugadores).toHaveLength(5);
      expect(resultado.total).toBe(5);
      expect(resultado.page).toBe(1);
      expect(resultado.totalPages).toBe(1);
    });

    test("debe aplicar paginación correctamente", async () => {
      // Crear 25 jugadores
      for (let i = 1; i <= 25; i++) {
        await mockRepository.create(
          new Jugador({
            id: null,
            usuarioId: i,
            numeroDorsal: i,
            posicionId: null,
            telefono: null,
            fechaNacimiento: null,
            alias: null,
            fotoUrl: null,
          })
        );
      }

      const resultado = await useCase.execute({ page: 2, limit: 10 });

      expect(resultado.jugadores).toHaveLength(10);
      expect(resultado.total).toBe(25);
      expect(resultado.page).toBe(2);
      expect(resultado.totalPages).toBe(3);
    });

    test("debe retornar array vacío si no hay jugadores", async () => {
      const resultado = await useCase.execute();

      expect(resultado.jugadores).toHaveLength(0);
      expect(resultado.total).toBe(0);
      expect(resultado.page).toBe(1);
      expect(resultado.totalPages).toBe(0);
    });

    test("debe filtrar por posición", async () => {
      // Crear jugadores con diferentes posiciones
      await mockRepository.create(
        new Jugador({
          id: null,
          usuarioId: 1,
          numeroDorsal: 1,
          posicionId: 1,
          telefono: null,
          fechaNacimiento: null,
          alias: null,
          fotoUrl: null,
        })
      );

      await mockRepository.create(
        new Jugador({
          id: null,
          usuarioId: 2,
          numeroDorsal: 2,
          posicionId: 2,
          telefono: null,
          fechaNacimiento: null,
          alias: null,
          fotoUrl: null,
        })
      );

      await mockRepository.create(
        new Jugador({
          id: null,
          usuarioId: 3,
          numeroDorsal: 3,
          posicionId: 1,
          telefono: null,
          fechaNacimiento: null,
          alias: null,
          fotoUrl: null,
        })
      );

      const resultado = await useCase.execute({ posicionId: 1 });

      expect(resultado.jugadores).toHaveLength(2);
      expect(resultado.total).toBe(2);
      resultado.jugadores.forEach((j) => {
        expect(j.posicionId).toBe(1);
      });
    });

    test("debe validar parámetros de paginación", async () => {
      await expect(useCase.execute({ page: -1 })).rejects.toThrow(
        ValidationError
      );

      await expect(useCase.execute({ page: 0 })).rejects.toThrow(
        ValidationError
      );

      await expect(useCase.execute({ limit: 0 })).rejects.toThrow(
        ValidationError
      );

      await expect(useCase.execute({ limit: 101 })).rejects.toThrow(
        ValidationError
      );
    });
  });

  describe("executeAll - sin paginación", () => {
    test("debe retornar todos los jugadores", async () => {
      // Crear 25 jugadores
      for (let i = 1; i <= 25; i++) {
        await mockRepository.create(
          new Jugador({
            id: null,
            usuarioId: i,
            numeroDorsal: i,
            posicionId: null,
            telefono: null,
            fechaNacimiento: null,
            alias: null,
            fotoUrl: null,
          })
        );
      }

      const resultado = await useCase.executeAll();

      expect(resultado.jugadores).toHaveLength(25);
      expect(resultado.total).toBe(25);
      expect(resultado.page).toBeUndefined();
      expect(resultado.totalPages).toBeUndefined();
    });

    test("debe retornar array vacío si no hay jugadores", async () => {
      const resultado = await useCase.executeAll();

      expect(resultado.jugadores).toHaveLength(0);
      expect(resultado.total).toBe(0);
    });
  });

  describe("executeByPosicion - filtro por posición", () => {
    test("debe retornar jugadores de una posición específica", async () => {
      // Crear jugadores con diferentes posiciones
      for (let i = 1; i <= 5; i++) {
        await mockRepository.create(
          new Jugador({
            id: null,
            usuarioId: i,
            numeroDorsal: i,
            posicionId: 1,
            telefono: null,
            fechaNacimiento: null,
            alias: null,
            fotoUrl: null,
          })
        );
      }

      for (let i = 6; i <= 8; i++) {
        await mockRepository.create(
          new Jugador({
            id: null,
            usuarioId: i,
            numeroDorsal: i,
            posicionId: 2,
            telefono: null,
            fechaNacimiento: null,
            alias: null,
            fotoUrl: null,
          })
        );
      }

      const resultado = await useCase.executeByPosicion(1);

      expect(resultado).toHaveLength(5);
      resultado.forEach((j) => {
        expect(j.posicionId).toBe(1);
      });
    });

    test("debe retornar array vacío si no hay jugadores en esa posición", async () => {
      await mockRepository.create(
        new Jugador({
          id: null,
          usuarioId: 1,
          numeroDorsal: 1,
          posicionId: 1,
          telefono: null,
          fechaNacimiento: null,
          alias: null,
          fotoUrl: null,
        })
      );

      const resultado = await useCase.executeByPosicion(5);

      expect(resultado).toHaveLength(0);
    });

    test("debe validar que posicionId sea requerido", async () => {
      await expect(useCase.executeByPosicion(null)).rejects.toThrow(
        ValidationError
      );

      await expect(useCase.executeByPosicion(null)).rejects.toThrow(
        "El ID de posición es requerido"
      );
    });
  });
});
