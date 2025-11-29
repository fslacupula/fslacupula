import { describe, test, expect, beforeEach } from "@jest/globals";
import { ActualizarEntrenamientoUseCase } from "../../../src/application/useCases/entrenamiento/ActualizarEntrenamientoUseCase.js";
import { Entrenamiento } from "../../../src/domain/entities/Entrenamiento.js";

class MockEntrenamientoRepository {
  constructor() {
    this.entrenamientos = new Map();
  }

  async findById(id) {
    return this.entrenamientos.get(id) || null;
  }

  async create(entrenamiento) {
    const id = this.entrenamientos.size + 1;
    const entrenamientoObj = entrenamiento.toObject();
    const entrenamientoConId = new Entrenamiento({
      ...entrenamientoObj,
      id,
    });
    this.entrenamientos.set(id, entrenamientoConId);
    return entrenamientoConId;
  }

  async update(entrenamientoId, entrenamiento) {
    if (!this.entrenamientos.has(entrenamientoId)) {
      throw new Error("Entrenamiento no encontrado");
    }
    this.entrenamientos.set(entrenamientoId, entrenamiento);
    return entrenamiento;
  }
}

describe("ActualizarEntrenamientoUseCase", () => {
  let mockRepository;
  let useCase;
  let entrenamientoExistente;

  beforeEach(async () => {
    mockRepository = new MockEntrenamientoRepository();
    useCase = new ActualizarEntrenamientoUseCase(mockRepository);

    // Crear un entrenamiento base para actualizar
    const entrenamiento = new Entrenamiento({
      id: null,
      fechaHora: new Date("2025-12-15T18:00:00"),
      lugar: "Campo Original",
      descripcion: "Descripción original",
      duracionMinutos: 90,
      creadoPor: 1,
    });
    entrenamientoExistente = await mockRepository.create(entrenamiento);
  });

  describe("constructor", () => {
    test("debe requerir entrenamientoRepository", () => {
      expect(() => new ActualizarEntrenamientoUseCase()).toThrow(
        "entrenamientoRepository es requerido"
      );
    });

    test("debe crear instancia correctamente", () => {
      const instance = new ActualizarEntrenamientoUseCase(mockRepository);
      expect(instance).toBeInstanceOf(ActualizarEntrenamientoUseCase);
    });
  });

  describe("execute", () => {
    test("debe actualizar fechaHora correctamente", async () => {
      const nuevaFecha = new Date("2025-12-20T20:00:00");
      const resultado = await useCase.execute(entrenamientoExistente.id, {
        fechaHora: nuevaFecha,
      });

      expect(resultado.fechaHora).toEqual(nuevaFecha);
      expect(resultado.lugar).toBe("Campo Original");
    });

    test("debe actualizar lugar correctamente", async () => {
      const resultado = await useCase.execute(entrenamientoExistente.id, {
        lugar: "Nuevo Campo",
      });

      expect(resultado.lugar).toBe("Nuevo Campo");
      expect(resultado.descripcion).toBe("Descripción original");
    });

    test("debe actualizar descripción correctamente", async () => {
      const resultado = await useCase.execute(entrenamientoExistente.id, {
        descripcion: "Nueva descripción",
      });

      expect(resultado.descripcion).toBe("Nueva descripción");
      expect(resultado.lugar).toBe("Campo Original");
    });

    test("debe actualizar duracionMinutos correctamente", async () => {
      const resultado = await useCase.execute(entrenamientoExistente.id, {
        duracionMinutos: 120,
      });

      expect(resultado.duracionMinutos).toBe(120);
      expect(resultado.lugar).toBe("Campo Original");
    });

    test("debe actualizar múltiples campos a la vez", async () => {
      const nuevaFecha = new Date("2025-12-20T20:00:00");
      const resultado = await useCase.execute(entrenamientoExistente.id, {
        fechaHora: nuevaFecha,
        lugar: "Super Campo",
        descripcion: "Nueva descripción completa",
        duracionMinutos: 120,
      });

      expect(resultado.fechaHora).toEqual(nuevaFecha);
      expect(resultado.lugar).toBe("Super Campo");
      expect(resultado.descripcion).toBe("Nueva descripción completa");
      expect(resultado.duracionMinutos).toBe(120);
    });

    test("debe permitir establecer descripción como null", async () => {
      const resultado = await useCase.execute(entrenamientoExistente.id, {
        descripcion: null,
      });

      expect(resultado.descripcion).toBeNull();
    });

    test("debe lanzar error si entrenamiento no existe", async () => {
      await expect(
        useCase.execute(999, { lugar: "Nuevo Campo" })
      ).rejects.toThrow("Entrenamiento no encontrado");
    });

    test("debe lanzar error si ID es null", async () => {
      await expect(
        useCase.execute(null, { lugar: "Nuevo Campo" })
      ).rejects.toThrow("El ID del entrenamiento es requerido");
    });

    test("debe lanzar error si no se proporciona ninguna actualización", async () => {
      await expect(
        useCase.execute(entrenamientoExistente.id, {})
      ).rejects.toThrow("Debe proporcionar al menos un campo para actualizar");
    });

    test("debe lanzar error con fechaHora inválida", async () => {
      await expect(
        useCase.execute(entrenamientoExistente.id, {
          fechaHora: "fecha-invalida",
        })
      ).rejects.toThrow("Fecha y hora inválidas");
    });

    test("debe lanzar error con duración inválida", async () => {
      await expect(
        useCase.execute(entrenamientoExistente.id, { duracionMinutos: 10 })
      ).rejects.toThrow("Duración debe estar entre");
    });
  });
});
