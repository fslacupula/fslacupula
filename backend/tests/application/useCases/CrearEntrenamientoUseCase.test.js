import { describe, test, expect, beforeEach } from "@jest/globals";
import { CrearEntrenamientoUseCase } from "../../../src/application/useCases/entrenamiento/CrearEntrenamientoUseCase.js";
import { Entrenamiento } from "../../../src/domain/entities/Entrenamiento.js";

class MockEntrenamientoRepository {
  constructor() {
    this.entrenamientos = [];
  }

  async create(entrenamiento) {
    const id = this.entrenamientos.length + 1;
    const entrenamientoObj = entrenamiento.toObject();
    const entrenamientoConId = new Entrenamiento({
      ...entrenamientoObj,
      id,
    });
    this.entrenamientos.push(entrenamientoConId);
    return entrenamientoConId;
  }
}

describe("CrearEntrenamientoUseCase", () => {
  let mockRepository;
  let useCase;

  beforeEach(() => {
    mockRepository = new MockEntrenamientoRepository();
    useCase = new CrearEntrenamientoUseCase(mockRepository);
  });

  describe("constructor", () => {
    test("debe requerir entrenamientoRepository", () => {
      expect(() => new CrearEntrenamientoUseCase()).toThrow(
        "entrenamientoRepository es requerido"
      );
    });

    test("debe crear instancia correctamente", () => {
      const instance = new CrearEntrenamientoUseCase(mockRepository);
      expect(instance).toBeInstanceOf(CrearEntrenamientoUseCase);
    });
  });

  describe("execute", () => {
    test("debe crear entrenamiento correctamente con datos completos", async () => {
      const datos = {
        fechaHora: new Date("2025-12-15T18:00:00"),
        lugar: "Campo Municipal",
        descripcion: "Entrenamiento táctico",
        duracionMinutos: 90,
        creadoPor: 1,
      };

      const resultado = await useCase.execute(datos);

      expect(resultado.id).toBe(1);
      expect(resultado.lugar).toBe("Campo Municipal");
      expect(resultado.descripcion).toBe("Entrenamiento táctico");
      expect(resultado.duracionMinutos).toBe(90);
      expect(resultado.creadoPor).toBe(1);
    });

    test("debe crear entrenamiento sin descripción", async () => {
      const resultado = await useCase.execute({
        fechaHora: new Date("2025-12-15T18:00:00"),
        lugar: "Campo Municipal",
        creadoPor: 1,
      });

      expect(resultado.descripcion).toBeNull();
      expect(resultado.duracionMinutos).toBe(90); // Default
    });

    test("debe usar duración por defecto si no se proporciona", async () => {
      const resultado = await useCase.execute({
        fechaHora: new Date("2025-12-15T18:00:00"),
        lugar: "Campo Municipal",
        creadoPor: 1,
      });

      expect(resultado.duracionMinutos).toBe(Entrenamiento.DEFAULT_DURACION);
    });

    test("debe permitir diferentes duraciones válidas", async () => {
      const resultado = await useCase.execute({
        fechaHora: new Date("2025-12-15T18:00:00"),
        lugar: "Campo Municipal",
        duracionMinutos: 120,
        creadoPor: 1,
      });

      expect(resultado.duracionMinutos).toBe(120);
    });

    test("debe lanzar error si falta fechaHora", async () => {
      await expect(
        useCase.execute({
          lugar: "Campo Municipal",
          creadoPor: 1,
        })
      ).rejects.toThrow("fechaHora es requerido");
    });

    test("debe lanzar error si falta lugar", async () => {
      await expect(
        useCase.execute({
          fechaHora: new Date("2025-12-15T18:00:00"),
          creadoPor: 1,
        })
      ).rejects.toThrow("lugar es requerido");
    });

    test("debe lanzar error si falta creadoPor", async () => {
      await expect(
        useCase.execute({
          fechaHora: new Date("2025-12-15T18:00:00"),
          lugar: "Campo Municipal",
        })
      ).rejects.toThrow("creadoPor es requerido");
    });

    test("debe lanzar error con fechaHora inválida", async () => {
      await expect(
        useCase.execute({
          fechaHora: "fecha-invalida",
          lugar: "Campo Municipal",
          creadoPor: 1,
        })
      ).rejects.toThrow("Fecha y hora inválidas");
    });

    test("debe lanzar error con duración menor al mínimo", async () => {
      await expect(
        useCase.execute({
          fechaHora: new Date("2025-12-15T18:00:00"),
          lugar: "Campo Municipal",
          duracionMinutos: 10,
          creadoPor: 1,
        })
      ).rejects.toThrow("Duración debe estar entre");
    });

    test("debe lanzar error con duración mayor al máximo", async () => {
      await expect(
        useCase.execute({
          fechaHora: new Date("2025-12-15T18:00:00"),
          lugar: "Campo Municipal",
          duracionMinutos: 300,
          creadoPor: 1,
        })
      ).rejects.toThrow("Duración debe estar entre");
    });

    test("debe crear múltiples entrenamientos", async () => {
      const entrenamiento1 = await useCase.execute({
        fechaHora: new Date("2025-12-15T18:00:00"),
        lugar: "Campo A",
        creadoPor: 1,
      });

      const entrenamiento2 = await useCase.execute({
        fechaHora: new Date("2025-12-16T18:00:00"),
        lugar: "Campo B",
        creadoPor: 1,
      });

      expect(entrenamiento1.id).toBe(1);
      expect(entrenamiento2.id).toBe(2);
      expect(mockRepository.entrenamientos.length).toBe(2);
    });
  });
});
