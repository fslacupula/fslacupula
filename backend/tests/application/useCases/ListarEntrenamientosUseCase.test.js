import { describe, test, expect, beforeEach } from "@jest/globals";
import { ListarEntrenamientosUseCase } from "../../../src/application/useCases/entrenamiento/ListarEntrenamientosUseCase.js";
import { Entrenamiento } from "../../../src/domain/entities/Entrenamiento.js";

class MockEntrenamientoRepository {
  constructor() {
    this.entrenamientos = [];
  }

  async findAll(filters = {}) {
    let resultado = [...this.entrenamientos];

    if (filters.fechaDesde) {
      resultado = resultado.filter((e) => e.fechaHora >= filters.fechaDesde);
    }

    if (filters.fechaHasta) {
      resultado = resultado.filter((e) => e.fechaHora <= filters.fechaHasta);
    }

    if (filters.lugar) {
      resultado = resultado.filter((e) => e.lugar === filters.lugar);
    }

    return resultado;
  }

  async findPaginated(page, limit, filters = {}) {
    const todos = await this.findAll(filters);
    const total = todos.length;
    const totalPages = Math.ceil(total / limit);
    const inicio = (page - 1) * limit;
    const data = todos.slice(inicio, inicio + limit);

    return { data, total, page, totalPages };
  }

  async findByDateRange(fechaInicio, fechaFin) {
    return this.entrenamientos.filter(
      (e) => e.fechaHora >= fechaInicio && e.fechaHora <= fechaFin
    );
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

describe("ListarEntrenamientosUseCase", () => {
  let mockRepository;
  let useCase;

  beforeEach(async () => {
    mockRepository = new MockEntrenamientoRepository();
    useCase = new ListarEntrenamientosUseCase(mockRepository);

    // Crear algunos entrenamientos de prueba
    for (let i = 1; i <= 15; i++) {
      const fecha = new Date("2025-12-01");
      fecha.setDate(fecha.getDate() + i);
      await mockRepository.create(
        new Entrenamiento({
          id: null,
          fechaHora: fecha,
          lugar: i % 2 === 0 ? "Campo A" : "Campo B",
          creadoPor: 1,
        })
      );
    }
  });

  describe("constructor", () => {
    test("debe requerir entrenamientoRepository", () => {
      expect(() => new ListarEntrenamientosUseCase()).toThrow(
        "entrenamientoRepository es requerido"
      );
    });

    test("debe crear instancia correctamente", () => {
      const instance = new ListarEntrenamientosUseCase(mockRepository);
      expect(instance).toBeInstanceOf(ListarEntrenamientosUseCase);
    });
  });

  describe("execute", () => {
    test("debe listar entrenamientos con paginación por defecto", async () => {
      const resultado = await useCase.execute();

      expect(resultado.data.length).toBe(10); // Default limit
      expect(resultado.total).toBe(15);
      expect(resultado.page).toBe(1);
      expect(resultado.totalPages).toBe(2);
    });

    test("debe respetar la paginación personalizada", async () => {
      const resultado = await useCase.execute({ page: 2, limit: 5 });

      expect(resultado.data.length).toBe(5);
      expect(resultado.page).toBe(2);
      expect(resultado.totalPages).toBe(3);
    });

    test("debe filtrar por lugar", async () => {
      const resultado = await useCase.execute({ lugar: "Campo A" });

      expect(resultado.data.every((e) => e.lugar === "Campo A")).toBe(true);
    });

    test("debe filtrar por fechaDesde", async () => {
      const fechaDesde = new Date("2025-12-10");
      const resultado = await useCase.execute({ fechaDesde });

      expect(resultado.total).toBeLessThan(15);
      expect(
        resultado.data.every((e) => new Date(e.fechaHora) >= fechaDesde)
      ).toBe(true);
    });

    test("debe filtrar por fechaHasta", async () => {
      const fechaHasta = new Date("2025-12-10");
      const resultado = await useCase.execute({ fechaHasta });

      expect(resultado.total).toBeLessThan(15);
      expect(
        resultado.data.every((e) => new Date(e.fechaHora) <= fechaHasta)
      ).toBe(true);
    });

    test("debe combinar múltiples filtros", async () => {
      const resultado = await useCase.execute({
        lugar: "Campo A",
        page: 1,
        limit: 5,
      });

      expect(resultado.data.every((e) => e.lugar === "Campo A")).toBe(true);
      expect(resultado.data.length).toBeLessThanOrEqual(5);
    });

    test("debe lanzar error con página inválida", async () => {
      await expect(useCase.execute({ page: 0 })).rejects.toThrow(
        "La página debe ser un número mayor a 0"
      );
    });

    test("debe lanzar error con límite inválido", async () => {
      await expect(useCase.execute({ limit: 0 })).rejects.toThrow(
        "El límite debe estar entre 1 y 100"
      );

      await expect(useCase.execute({ limit: 101 })).rejects.toThrow(
        "El límite debe estar entre 1 y 100"
      );
    });

    test("debe lanzar error con fechaDesde inválida", async () => {
      await expect(
        useCase.execute({ fechaDesde: "fecha-invalida" })
      ).rejects.toThrow("fechaDesde inválida");
    });

    test("debe lanzar error con fechaHasta inválida", async () => {
      await expect(
        useCase.execute({ fechaHasta: "fecha-invalida" })
      ).rejects.toThrow("fechaHasta inválida");
    });
  });

  describe("executeAll", () => {
    test("debe listar todos los entrenamientos sin paginación", async () => {
      const resultado = await useCase.executeAll();

      expect(resultado.length).toBe(15);
    });

    test("debe aplicar filtros sin paginación", async () => {
      const resultado = await useCase.executeAll({ lugar: "Campo A" });

      expect(resultado.every((e) => e.lugar === "Campo A")).toBe(true);
    });
  });

  describe("executeByDateRange", () => {
    test("debe listar entrenamientos en rango de fechas", async () => {
      const fechaInicio = new Date("2025-12-05");
      const fechaFin = new Date("2025-12-10");

      const resultado = await useCase.executeByDateRange(fechaInicio, fechaFin);

      expect(resultado.length).toBeGreaterThan(0);
      expect(
        resultado.every((e) => {
          const fecha = new Date(e.fechaHora);
          return fecha >= fechaInicio && fecha <= fechaFin;
        })
      ).toBe(true);
    });

    test("debe lanzar error si falta fechaInicio", async () => {
      await expect(
        useCase.executeByDateRange(null, new Date())
      ).rejects.toThrow("fechaInicio y fechaFin son requeridas");
    });

    test("debe lanzar error si falta fechaFin", async () => {
      await expect(
        useCase.executeByDateRange(new Date(), null)
      ).rejects.toThrow("fechaInicio y fechaFin son requeridas");
    });

    test("debe lanzar error con fechas inválidas", async () => {
      await expect(
        useCase.executeByDateRange("invalida", new Date())
      ).rejects.toThrow("Fechas inválidas");
    });

    test("debe lanzar error si fechaInicio es posterior a fechaFin", async () => {
      const fechaInicio = new Date("2025-12-20");
      const fechaFin = new Date("2025-12-10");

      await expect(
        useCase.executeByDateRange(fechaInicio, fechaFin)
      ).rejects.toThrow("fechaInicio no puede ser posterior a fechaFin");
    });
  });
});
