import { describe, test, expect, beforeEach } from "@jest/globals";
import { ObtenerEstadisticasAsistenciaUseCase } from "../../../src/application/useCases/asistencia/ObtenerEstadisticasAsistenciaUseCase.js";

class MockAsistenciaRepository {
  constructor() {
    this.asistencias = [];
  }

  async getEstadisticasByJugador(jugadorId, opciones = {}) {
    let asistenciasFiltradas = this.asistencias.filter(
      (a) => a.jugadorId === jugadorId
    );

    // Filtrar por tipo
    if (opciones.tipo === "partido") {
      asistenciasFiltradas = asistenciasFiltradas.filter(
        (a) => a.partidoId !== null
      );
    } else if (opciones.tipo === "entrenamiento") {
      asistenciasFiltradas = asistenciasFiltradas.filter(
        (a) => a.entrenamientoId !== null
      );
    }

    // Filtrar por fechas (simplificado para tests)
    if (opciones.fechaDesde) {
      asistenciasFiltradas = asistenciasFiltradas.filter(
        (a) => a.fechaRespuesta >= opciones.fechaDesde
      );
    }

    if (opciones.fechaHasta) {
      asistenciasFiltradas = asistenciasFiltradas.filter(
        (a) => a.fechaRespuesta <= opciones.fechaHasta
      );
    }

    const total = asistenciasFiltradas.length;
    const confirmados = asistenciasFiltradas.filter(
      (a) => a.estado === "confirmado"
    ).length;
    const ausentes = asistenciasFiltradas.filter(
      (a) => a.estado === "ausente"
    ).length;
    const pendientes = asistenciasFiltradas.filter(
      (a) => a.estado === "pendiente"
    ).length;

    const porcentajeAsistencia =
      total > 0 ? Math.round((confirmados / total) * 100) : 0;

    return {
      total,
      confirmados,
      ausentes,
      pendientes,
      porcentajeAsistencia,
    };
  }

  async findByJugadorId(jugadorId, opciones = {}) {
    let asistenciasFiltradas = this.asistencias.filter(
      (a) => a.jugadorId === jugadorId
    );

    // Filtrar por tipo
    if (opciones.tipo === "partido") {
      asistenciasFiltradas = asistenciasFiltradas.filter(
        (a) => a.partidoId !== null
      );
    } else if (opciones.tipo === "entrenamiento") {
      asistenciasFiltradas = asistenciasFiltradas.filter(
        (a) => a.entrenamientoId !== null
      );
    }

    return asistenciasFiltradas;
  }

  async create(asistencia) {
    this.asistencias.push(asistencia);
    return asistencia;
  }
}

class MockJugadorRepository {
  constructor() {
    this.jugadores = new Map();
  }

  async findById(id) {
    return this.jugadores.get(id) || null;
  }

  async create(jugador) {
    const id = jugador.id;
    this.jugadores.set(id, jugador);
    return jugador;
  }
}

describe("ObtenerEstadisticasAsistenciaUseCase", () => {
  let mockAsistenciaRepository;
  let mockJugadorRepository;
  let useCase;

  beforeEach(async () => {
    mockAsistenciaRepository = new MockAsistenciaRepository();
    mockJugadorRepository = new MockJugadorRepository();
    useCase = new ObtenerEstadisticasAsistenciaUseCase(
      mockAsistenciaRepository,
      mockJugadorRepository
    );

    // Crear jugador de prueba
    await mockJugadorRepository.create({
      id: 1,
      usuarioId: 1,
      numeroDorsal: 10,
    });

    // Crear asistencias de prueba para el jugador 1
    const fechaBase = new Date("2024-01-01");

    // Asistencias a partidos
    await mockAsistenciaRepository.create({
      id: 1,
      jugadorId: 1,
      partidoId: 1,
      entrenamientoId: null,
      estado: "confirmado",
      fechaRespuesta: new Date("2024-01-05"),
    });

    await mockAsistenciaRepository.create({
      id: 2,
      jugadorId: 1,
      partidoId: 2,
      entrenamientoId: null,
      estado: "ausente",
      motivoAusenciaId: 1,
      fechaRespuesta: new Date("2024-01-10"),
    });

    await mockAsistenciaRepository.create({
      id: 3,
      jugadorId: 1,
      partidoId: 3,
      entrenamientoId: null,
      estado: "confirmado",
      fechaRespuesta: new Date("2024-01-15"),
    });

    // Asistencias a entrenamientos
    await mockAsistenciaRepository.create({
      id: 4,
      jugadorId: 1,
      partidoId: null,
      entrenamientoId: 1,
      estado: "confirmado",
      fechaRespuesta: new Date("2024-01-12"),
    });

    await mockAsistenciaRepository.create({
      id: 5,
      jugadorId: 1,
      partidoId: null,
      entrenamientoId: 2,
      estado: "confirmado",
      fechaRespuesta: new Date("2024-01-20"),
    });

    await mockAsistenciaRepository.create({
      id: 6,
      jugadorId: 1,
      partidoId: null,
      entrenamientoId: 3,
      estado: "pendiente",
      fechaRespuesta: new Date("2024-01-25"),
    });
  });

  describe("constructor", () => {
    test("debe requerir asistenciaRepository", () => {
      expect(
        () =>
          new ObtenerEstadisticasAsistenciaUseCase(null, mockJugadorRepository)
      ).toThrow("asistenciaRepository es requerido");
    });

    test("debe requerir jugadorRepository", () => {
      expect(
        () =>
          new ObtenerEstadisticasAsistenciaUseCase(
            mockAsistenciaRepository,
            null
          )
      ).toThrow("jugadorRepository es requerido");
    });

    test("debe crear instancia correctamente", () => {
      expect(useCase).toBeInstanceOf(ObtenerEstadisticasAsistenciaUseCase);
      expect(useCase.asistenciaRepository).toBe(mockAsistenciaRepository);
      expect(useCase.jugadorRepository).toBe(mockJugadorRepository);
    });
  });

  describe("execute", () => {
    test("debe obtener estadísticas generales del jugador", async () => {
      const resultado = await useCase.execute(1);

      expect(resultado).toHaveProperty("total");
      expect(resultado).toHaveProperty("confirmados");
      expect(resultado).toHaveProperty("ausentes");
      expect(resultado).toHaveProperty("pendientes");
      expect(resultado).toHaveProperty("porcentajeAsistencia");
      expect(resultado.total).toBe(6);
      expect(resultado.confirmados).toBe(4);
      expect(resultado.ausentes).toBe(1);
      expect(resultado.pendientes).toBe(1);
    });

    test("debe filtrar estadísticas por tipo partido", async () => {
      const resultado = await useCase.execute(1, { tipo: "partido" });

      expect(resultado.total).toBe(3);
      expect(resultado.confirmados).toBe(2);
      expect(resultado.ausentes).toBe(1);
      expect(resultado.pendientes).toBe(0);
    });

    test("debe filtrar estadísticas por tipo entrenamiento", async () => {
      const resultado = await useCase.execute(1, { tipo: "entrenamiento" });

      expect(resultado.total).toBe(3);
      expect(resultado.confirmados).toBe(2);
      expect(resultado.ausentes).toBe(0);
      expect(resultado.pendientes).toBe(1);
    });

    test("debe filtrar estadísticas por fecha desde", async () => {
      const fechaDesde = new Date("2024-01-11");
      const resultado = await useCase.execute(1, { fechaDesde });

      expect(resultado.total).toBe(4);
    });

    test("debe filtrar estadísticas por fecha hasta", async () => {
      const fechaHasta = new Date("2024-01-12");
      const resultado = await useCase.execute(1, { fechaHasta });

      expect(resultado.total).toBe(3);
    });

    test("debe filtrar estadísticas por rango de fechas", async () => {
      const fechaDesde = new Date("2024-01-10");
      const fechaHasta = new Date("2024-01-20");
      const resultado = await useCase.execute(1, { fechaDesde, fechaHasta });

      expect(resultado.total).toBe(4);
    });

    test("debe lanzar error si falta jugadorId", async () => {
      await expect(useCase.execute(null)).rejects.toThrow(
        "jugadorId es requerido"
      );
    });

    test("debe lanzar error si jugador no existe", async () => {
      await expect(useCase.execute(999)).rejects.toThrow(
        "Jugador con ID 999 no encontrado"
      );
    });

    test("debe lanzar error con tipo inválido", async () => {
      await expect(useCase.execute(1, { tipo: "invalido" })).rejects.toThrow(
        "tipo debe ser uno de: partido, entrenamiento"
      );
    });

    test("debe lanzar error con fechaDesde inválida", async () => {
      await expect(
        useCase.execute(1, { fechaDesde: "2024-01-01" })
      ).rejects.toThrow("fechaDesde debe ser una instancia de Date");
    });

    test("debe lanzar error con fechaHasta inválida", async () => {
      await expect(
        useCase.execute(1, { fechaHasta: "2024-01-31" })
      ).rejects.toThrow("fechaHasta debe ser una instancia de Date");
    });

    test("debe lanzar error si fechaDesde es posterior a fechaHasta", async () => {
      const fechaDesde = new Date("2024-01-20");
      const fechaHasta = new Date("2024-01-10");

      await expect(
        useCase.execute(1, { fechaDesde, fechaHasta })
      ).rejects.toThrow("fechaDesde no puede ser posterior a fechaHasta");
    });
  });

  describe("executeComparativas", () => {
    test("debe obtener estadísticas comparativas", async () => {
      const resultado = await useCase.executeComparativas(1);

      expect(resultado).toHaveProperty("partidos");
      expect(resultado).toHaveProperty("entrenamientos");
      expect(resultado).toHaveProperty("global");
      expect(resultado.partidos.total).toBe(3);
      expect(resultado.entrenamientos.total).toBe(3);
      expect(resultado.global.total).toBe(6);
    });

    test("debe calcular porcentajes correctamente", async () => {
      const resultado = await useCase.executeComparativas(1);

      expect(resultado.partidos.porcentajeAsistencia).toBe(67);
      expect(resultado.entrenamientos.porcentajeAsistencia).toBe(67);
      expect(resultado.global.porcentajeAsistencia).toBe(67);
    });

    test("debe filtrar por fechas en comparativas", async () => {
      const fechaDesde = new Date("2024-01-11");
      const resultado = await useCase.executeComparativas(1, { fechaDesde });

      expect(resultado.partidos.total).toBe(1); // Solo partido del 15
      expect(resultado.entrenamientos.total).toBe(3); // Entrenamientos del 12, 20 y 25
      expect(resultado.global.total).toBe(4);
    });
  });

  describe("executeHistorial", () => {
    test("debe obtener historial completo del jugador", async () => {
      const resultado = await useCase.executeHistorial(1);

      expect(resultado).toHaveLength(6);
      expect(resultado.every((a) => a.jugadorId === 1)).toBe(true);
    });

    test("debe filtrar historial por tipo partido", async () => {
      const resultado = await useCase.executeHistorial(1, { tipo: "partido" });

      expect(resultado).toHaveLength(3);
      expect(resultado.every((a) => a.partidoId !== null)).toBe(true);
    });

    test("debe filtrar historial por tipo entrenamiento", async () => {
      const resultado = await useCase.executeHistorial(1, {
        tipo: "entrenamiento",
      });

      expect(resultado).toHaveLength(3);
      expect(resultado.every((a) => a.entrenamientoId !== null)).toBe(true);
    });

    test("debe lanzar error si falta jugadorId", async () => {
      await expect(useCase.executeHistorial(null)).rejects.toThrow(
        "jugadorId es requerido"
      );
    });

    test("debe lanzar error si jugador no existe", async () => {
      await expect(useCase.executeHistorial(999)).rejects.toThrow(
        "Jugador con ID 999 no encontrado"
      );
    });

    test("debe lanzar error con tipo inválido", async () => {
      await expect(
        useCase.executeHistorial(1, { tipo: "invalido" })
      ).rejects.toThrow("tipo debe ser uno de: partido, entrenamiento");
    });
  });
});
