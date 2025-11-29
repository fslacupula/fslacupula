import { describe, test, expect, beforeEach } from "@jest/globals";
import { ObtenerProximosEntrenamientosUseCase } from "../../../src/application/useCases/entrenamiento/ObtenerProximosEntrenamientosUseCase.js";
import { Entrenamiento } from "../../../src/domain/entities/Entrenamiento.js";

class MockEntrenamientoRepository {
  constructor() {
    this.entrenamientos = [];
  }

  async findUpcoming(limit = null) {
    const ahora = new Date();
    let futuros = this.entrenamientos.filter((e) => e.fechaHora > ahora);

    futuros.sort((a, b) => a.fechaHora - b.fechaHora);

    if (limit) {
      futuros = futuros.slice(0, limit);
    }

    return futuros;
  }

  async getNext() {
    const ahora = new Date();
    const futuros = this.entrenamientos
      .filter((e) => e.fechaHora > ahora)
      .sort((a, b) => a.fechaHora - b.fechaHora);

    return futuros.length > 0 ? futuros[0] : null;
  }

  async findToday() {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const mañana = new Date(hoy);
    mañana.setDate(mañana.getDate() + 1);

    return this.entrenamientos.filter(
      (e) => e.fechaHora >= hoy && e.fechaHora < mañana
    );
  }

  async findThisWeek() {
    const hoy = new Date();
    const inicioSemana = new Date(hoy);
    inicioSemana.setDate(hoy.getDate() - hoy.getDay());
    inicioSemana.setHours(0, 0, 0, 0);

    const finSemana = new Date(inicioSemana);
    finSemana.setDate(inicioSemana.getDate() + 7);

    return this.entrenamientos.filter(
      (e) => e.fechaHora >= inicioSemana && e.fechaHora < finSemana
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

describe("ObtenerProximosEntrenamientosUseCase", () => {
  let mockRepository;
  let useCase;

  beforeEach(() => {
    mockRepository = new MockEntrenamientoRepository();
    useCase = new ObtenerProximosEntrenamientosUseCase(mockRepository);
  });

  describe("constructor", () => {
    test("debe requerir entrenamientoRepository", () => {
      expect(() => new ObtenerProximosEntrenamientosUseCase()).toThrow(
        "entrenamientoRepository es requerido"
      );
    });

    test("debe crear instancia correctamente", () => {
      const instance = new ObtenerProximosEntrenamientosUseCase(mockRepository);
      expect(instance).toBeInstanceOf(ObtenerProximosEntrenamientosUseCase);
    });
  });

  describe("execute", () => {
    test("debe obtener entrenamientos futuros ordenados por fecha", async () => {
      const mañana = new Date();
      mañana.setDate(mañana.getDate() + 1);
      const pasadoMañana = new Date();
      pasadoMañana.setDate(pasadoMañana.getDate() + 2);

      await mockRepository.create(
        new Entrenamiento({
          id: null,
          fechaHora: pasadoMañana,
          lugar: "Campo B",
          creadoPor: 1,
        })
      );
      await mockRepository.create(
        new Entrenamiento({
          id: null,
          fechaHora: mañana,
          lugar: "Campo A",
          creadoPor: 1,
        })
      );

      const resultado = await useCase.execute();

      expect(resultado.length).toBe(2);
      expect(resultado[0].lugar).toBe("Campo A"); // Más cercano primero
      expect(resultado[1].lugar).toBe("Campo B");
    });

    test("debe retornar array vacío si no hay entrenamientos futuros", async () => {
      const ayer = new Date();
      ayer.setDate(ayer.getDate() - 1);

      await mockRepository.create(
        new Entrenamiento({
          id: null,
          fechaHora: ayer,
          lugar: "Campo A",
          creadoPor: 1,
        })
      );

      const resultado = await useCase.execute();

      expect(resultado).toEqual([]);
    });

    test("debe aplicar límite correctamente", async () => {
      for (let i = 1; i <= 5; i++) {
        const fecha = new Date();
        fecha.setDate(fecha.getDate() + i);
        await mockRepository.create(
          new Entrenamiento({
            id: null,
            fechaHora: fecha,
            lugar: `Campo ${i}`,
            creadoPor: 1,
          })
        );
      }

      const resultado = await useCase.execute({ limit: 3 });

      expect(resultado.length).toBe(3);
    });

    test("debe lanzar error con límite inválido", async () => {
      await expect(useCase.execute({ limit: 0 })).rejects.toThrow(
        "El límite debe estar entre 1 y 100"
      );

      await expect(useCase.execute({ limit: 101 })).rejects.toThrow(
        "El límite debe estar entre 1 y 100"
      );
    });
  });

  describe("executeNext", () => {
    test("debe obtener el próximo entrenamiento", async () => {
      const mañana = new Date();
      mañana.setDate(mañana.getDate() + 1);
      const pasadoMañana = new Date();
      pasadoMañana.setDate(pasadoMañana.getDate() + 2);

      await mockRepository.create(
        new Entrenamiento({
          id: null,
          fechaHora: pasadoMañana,
          lugar: "Campo B",
          creadoPor: 1,
        })
      );
      await mockRepository.create(
        new Entrenamiento({
          id: null,
          fechaHora: mañana,
          lugar: "Campo A",
          creadoPor: 1,
        })
      );

      const resultado = await useCase.executeNext();

      expect(resultado).not.toBeNull();
      expect(resultado.lugar).toBe("Campo A");
    });

    test("debe retornar null si no hay próximo entrenamiento", async () => {
      const resultado = await useCase.executeNext();
      expect(resultado).toBeNull();
    });
  });

  describe("executeToday", () => {
    test("debe obtener entrenamientos de hoy", async () => {
      const hoy = new Date();
      hoy.setHours(18, 0, 0, 0);
      const mañana = new Date();
      mañana.setDate(mañana.getDate() + 1);

      await mockRepository.create(
        new Entrenamiento({
          id: null,
          fechaHora: hoy,
          lugar: "Campo Hoy",
          creadoPor: 1,
        })
      );
      await mockRepository.create(
        new Entrenamiento({
          id: null,
          fechaHora: mañana,
          lugar: "Campo Mañana",
          creadoPor: 1,
        })
      );

      const resultado = await useCase.executeToday();

      expect(resultado.length).toBe(1);
      expect(resultado[0].lugar).toBe("Campo Hoy");
    });
  });

  describe("executeThisWeek", () => {
    test("debe obtener entrenamientos de esta semana", async () => {
      const hoy = new Date();

      // Calcular inicio y fin de la semana actual
      const inicioSemana = new Date(hoy);
      inicioSemana.setDate(hoy.getDate() - hoy.getDay());
      inicioSemana.setHours(0, 0, 0, 0);

      const finSemana = new Date(inicioSemana);
      finSemana.setDate(inicioSemana.getDate() + 7);

      // Crear una fecha en el miércoles de esta semana (día 3) para garantizar que esté en la semana
      const estaSemana = new Date(inicioSemana);
      estaSemana.setDate(inicioSemana.getDate() + 3); // Miércoles
      estaSemana.setHours(18, 0, 0, 0);

      // Crear una fecha en la siguiente semana
      const proximaSemana = new Date(finSemana);
      proximaSemana.setDate(finSemana.getDate() + 1);
      proximaSemana.setHours(18, 0, 0, 0);

      await mockRepository.create(
        new Entrenamiento({
          id: null,
          fechaHora: estaSemana,
          lugar: "Esta Semana",
          creadoPor: 1,
        })
      );
      await mockRepository.create(
        new Entrenamiento({
          id: null,
          fechaHora: proximaSemana,
          lugar: "Próxima Semana",
          creadoPor: 1,
        })
      );

      const resultado = await useCase.executeThisWeek();

      expect(resultado.length).toBe(1);
      expect(resultado[0].lugar).toBe("Esta Semana");
    });
  });
});
