import { describe, test, expect, beforeEach } from "@jest/globals";
import { ActualizarPartidoUseCase } from "../../../src/application/useCases/partido/ActualizarPartidoUseCase.js";
import { Partido } from "../../../src/domain/entities/Partido.js";

class MockPartidoRepository {
  constructor() {
    this.partidos = new Map();
  }

  async findById(id) {
    return this.partidos.get(id) || null;
  }

  async create(partido) {
    const id = this.partidos.size + 1;
    const partidoObj = partido.toObject();
    const partidoConId = new Partido({
      ...partidoObj,
      id,
    });
    this.partidos.set(id, partidoConId);
    return partidoConId;
  }

  async update(partidoId, partido) {
    if (!this.partidos.has(partidoId)) {
      throw new Error("Partido no encontrado");
    }
    this.partidos.set(partidoId, partido);
    return partido;
  }
}

describe("ActualizarPartidoUseCase", () => {
  let mockRepository;
  let useCase;
  let partidoExistente;

  beforeEach(async () => {
    mockRepository = new MockPartidoRepository();
    useCase = new ActualizarPartidoUseCase(mockRepository);

    // Crear un partido base para actualizar
    const partido = new Partido({
      id: null,
      fechaHora: new Date("2025-02-15T18:00:00"),
      rival: "Rival Original",
      lugar: "Campo Original",
      tipo: Partido.TIPOS.LIGA,
      esLocal: true,
      creadoPor: 1,
      resultado: null,
      observaciones: "Observaciones originales",
    });
    partidoExistente = await mockRepository.create(partido);
  });

  describe("constructor", () => {
    test("debe requerir partidoRepository", () => {
      expect(() => new ActualizarPartidoUseCase()).toThrow(
        "partidoRepository es requerido"
      );
    });

    test("debe crear instancia correctamente", () => {
      const instance = new ActualizarPartidoUseCase(mockRepository);
      expect(instance).toBeInstanceOf(ActualizarPartidoUseCase);
    });
  });

  describe("execute", () => {
    test("debe actualizar fechaHora correctamente", async () => {
      const nuevaFecha = new Date("2025-02-20T20:00:00");
      const resultado = await useCase.execute(partidoExistente.id, {
        fechaHora: nuevaFecha,
      });

      expect(resultado.fechaHora).toEqual(nuevaFecha);
      expect(resultado.rival).toBe("Rival Original");
      expect(resultado.lugar).toBe("Campo Original");
    });

    test("debe actualizar rival correctamente", async () => {
      const resultado = await useCase.execute(partidoExistente.id, {
        rival: "Nuevo Rival FC",
      });

      expect(resultado.rival).toBe("Nuevo Rival FC");
      expect(resultado.fechaHora).toEqual(partidoExistente.fechaHora);
      expect(resultado.lugar).toBe("Campo Original");
    });

    test("debe actualizar lugar correctamente usando cambiarLugar", async () => {
      const resultado = await useCase.execute(partidoExistente.id, {
        lugar: "Nuevo Estadio",
      });

      expect(resultado.lugar).toBe("Nuevo Estadio");
      expect(resultado.rival).toBe("Rival Original");
    });

    test("debe actualizar tipo correctamente", async () => {
      const resultado = await useCase.execute(partidoExistente.id, {
        tipo: Partido.TIPOS.COPA,
      });

      expect(resultado.tipo).toBe(Partido.TIPOS.COPA);
      expect(resultado.rival).toBe("Rival Original");
    });

    test("debe actualizar esLocal correctamente", async () => {
      const resultado = await useCase.execute(partidoExistente.id, {
        esLocal: false,
      });

      expect(resultado.esLocal).toBe(false);
      expect(resultado.rival).toBe("Rival Original");
    });

    test("debe actualizar observaciones correctamente", async () => {
      const resultado = await useCase.execute(partidoExistente.id, {
        observaciones: "Nuevas observaciones importantes",
      });

      expect(resultado.observaciones).toBe("Nuevas observaciones importantes");
      expect(resultado.rival).toBe("Rival Original");
    });

    test("debe actualizar múltiples campos a la vez", async () => {
      const nuevaFecha = new Date("2025-03-01T19:00:00");
      const resultado = await useCase.execute(partidoExistente.id, {
        fechaHora: nuevaFecha,
        rival: "Super Rival FC",
        lugar: "Estadio Monumental",
        tipo: Partido.TIPOS.COPA,
        esLocal: false,
        observaciones: "Partido de cuartos de final",
      });

      expect(resultado.fechaHora).toEqual(nuevaFecha);
      expect(resultado.rival).toBe("Super Rival FC");
      expect(resultado.lugar).toBe("Estadio Monumental");
      expect(resultado.tipo).toBe(Partido.TIPOS.COPA);
      expect(resultado.esLocal).toBe(false);
      expect(resultado.observaciones).toBe("Partido de cuartos de final");
    });

    test("debe lanzar error si partido no existe", async () => {
      await expect(
        useCase.execute(999, { rival: "Nuevo Rival" })
      ).rejects.toThrow("Partido no encontrado");
    });

    test("debe lanzar error si ID es null", async () => {
      await expect(
        useCase.execute(null, { rival: "Nuevo Rival" })
      ).rejects.toThrow("El ID del partido es requerido");
    });

    test("debe lanzar error si no se proporciona ninguna actualización", async () => {
      await expect(useCase.execute(partidoExistente.id, {})).rejects.toThrow(
        "Debe proporcionar al menos un campo para actualizar"
      );
    });

    test("debe lanzar error con tipo inválido", async () => {
      await expect(
        useCase.execute(partidoExistente.id, { tipo: "TIPO_INVALIDO" })
      ).rejects.toThrow("Tipo inválido");
    });

    test("debe lanzar error con fechaHora inválida", async () => {
      await expect(
        useCase.execute(partidoExistente.id, { fechaHora: "fecha-invalida" })
      ).rejects.toThrow("Fecha y hora inválidas");
    });

    test("debe eliminar espacios en blanco de rival", async () => {
      const resultado = await useCase.execute(partidoExistente.id, {
        rival: "  Rival con espacios  ",
      });

      expect(resultado.rival).toBe("Rival con espacios");
    });
  });
});
