import { describe, test, expect, beforeEach } from "@jest/globals";
import { EliminarEntrenamientoUseCase } from "../../../src/application/useCases/entrenamiento/EliminarEntrenamientoUseCase.js";
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

  async delete(id) {
    if (!this.entrenamientos.has(id)) {
      throw new Error("Entrenamiento no encontrado");
    }
    this.entrenamientos.delete(id);
    return true;
  }
}

describe("EliminarEntrenamientoUseCase", () => {
  let mockRepository;
  let useCase;
  let entrenamientoExistente;

  beforeEach(async () => {
    mockRepository = new MockEntrenamientoRepository();
    useCase = new EliminarEntrenamientoUseCase(mockRepository);

    // Crear un entrenamiento para eliminar
    const entrenamiento = new Entrenamiento({
      id: null,
      fechaHora: new Date("2025-12-15T18:00:00"),
      lugar: "Campo Municipal",
      creadoPor: 1,
    });
    entrenamientoExistente = await mockRepository.create(entrenamiento);
  });

  describe("constructor", () => {
    test("debe requerir entrenamientoRepository", () => {
      expect(() => new EliminarEntrenamientoUseCase()).toThrow(
        "entrenamientoRepository es requerido"
      );
    });

    test("debe crear instancia correctamente", () => {
      const instance = new EliminarEntrenamientoUseCase(mockRepository);
      expect(instance).toBeInstanceOf(EliminarEntrenamientoUseCase);
    });
  });

  describe("execute", () => {
    test("debe eliminar entrenamiento correctamente", async () => {
      const resultado = await useCase.execute(entrenamientoExistente.id);

      expect(resultado.success).toBe(true);
      expect(resultado.message).toBe("Entrenamiento eliminado correctamente");
      expect(mockRepository.entrenamientos.has(entrenamientoExistente.id)).toBe(
        false
      );
    });

    test("debe lanzar error si entrenamiento no existe", async () => {
      await expect(useCase.execute(999)).rejects.toThrow(
        "Entrenamiento no encontrado"
      );
    });

    test("debe lanzar error si ID es null", async () => {
      await expect(useCase.execute(null)).rejects.toThrow(
        "El ID del entrenamiento es requerido"
      );
    });

    test("debe lanzar error si ID es undefined", async () => {
      await expect(useCase.execute(undefined)).rejects.toThrow(
        "El ID del entrenamiento es requerido"
      );
    });

    test("debe eliminar múltiples entrenamientos secuencialmente", async () => {
      // Crear otro entrenamiento
      const entrenamiento2 = new Entrenamiento({
        id: null,
        fechaHora: new Date("2025-12-16T18:00:00"),
        lugar: "Campo B",
        creadoPor: 1,
      });
      const entrenamientoExistente2 = await mockRepository.create(
        entrenamiento2
      );

      expect(mockRepository.entrenamientos.size).toBe(2);

      // Eliminar ambos
      await useCase.execute(entrenamientoExistente.id);
      await useCase.execute(entrenamientoExistente2.id);

      expect(mockRepository.entrenamientos.size).toBe(0);
    });
  });
});
