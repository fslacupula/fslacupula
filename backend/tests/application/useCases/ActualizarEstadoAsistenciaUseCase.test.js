import { describe, test, expect, beforeEach } from "@jest/globals";
import { ActualizarEstadoAsistenciaUseCase } from "../../../src/application/useCases/asistencia/ActualizarEstadoAsistenciaUseCase.js";

class MockAsistenciaRepository {
  constructor() {
    this.asistencias = new Map();
  }

  async findById(id) {
    return this.asistencias.get(id) || null;
  }

  async actualizar(id, actualizaciones) {
    const asistencia = this.asistencias.get(id);
    if (!asistencia) {
      throw new Error("Asistencia no encontrada");
    }

    const asistenciaActualizada = {
      ...asistencia,
      ...actualizaciones,
    };

    this.asistencias.set(id, asistenciaActualizada);
    return asistenciaActualizada;
  }

  async create(asistencia) {
    const id = asistencia.id;
    this.asistencias.set(id, asistencia);
    return asistencia;
  }
}

describe("ActualizarEstadoAsistenciaUseCase", () => {
  let mockRepository;
  let useCase;

  beforeEach(async () => {
    mockRepository = new MockAsistenciaRepository();
    useCase = new ActualizarEstadoAsistenciaUseCase(mockRepository);

    // Crear asistencias de prueba
    await mockRepository.create({
      id: 1,
      jugadorId: 1,
      partidoId: 1,
      entrenamientoId: null,
      estado: "pendiente",
      motivoAusenciaId: null,
      comentario: null,
    });

    await mockRepository.create({
      id: 2,
      jugadorId: 2,
      partidoId: null,
      entrenamientoId: 1,
      estado: "ausente",
      motivoAusenciaId: 1,
      comentario: "Lesionado",
    });
  });

  describe("constructor", () => {
    test("debe requerir asistenciaRepository", () => {
      expect(() => new ActualizarEstadoAsistenciaUseCase()).toThrow(
        "asistenciaRepository es requerido"
      );
    });

    test("debe crear instancia correctamente", () => {
      expect(useCase).toBeInstanceOf(ActualizarEstadoAsistenciaUseCase);
      expect(useCase.asistenciaRepository).toBe(mockRepository);
    });
  });

  describe("execute", () => {
    test("debe actualizar estado correctamente", async () => {
      const resultado = await useCase.execute(1, { estado: "confirmado" });

      expect(resultado).toBeDefined();
      expect(resultado.estado).toBe("confirmado");
      expect(resultado.jugadorId).toBe(1);
    });

    test("debe actualizar motivo de ausencia", async () => {
      const resultado = await useCase.execute(2, { motivoAusenciaId: 2 });

      expect(resultado.motivoAusenciaId).toBe(2);
      expect(resultado.estado).toBe("ausente");
    });

    test("debe actualizar comentario", async () => {
      const resultado = await useCase.execute(1, {
        comentario: "Llegará tarde",
      });

      expect(resultado.comentario).toBe("Llegará tarde");
    });

    test("debe actualizar múltiples campos", async () => {
      const resultado = await useCase.execute(1, {
        estado: "ausente",
        motivoAusenciaId: 3,
        comentario: "Viaje de trabajo",
      });

      expect(resultado.estado).toBe("ausente");
      expect(resultado.motivoAusenciaId).toBe(3);
      expect(resultado.comentario).toBe("Viaje de trabajo");
    });

    test("debe limpiar motivo al cambiar de ausente a confirmado", async () => {
      const resultado = await useCase.execute(2, { estado: "confirmado" });

      expect(resultado.estado).toBe("confirmado");
      expect(resultado.motivoAusenciaId).toBeNull();
    });

    test("debe lanzar error si falta asistenciaId", async () => {
      await expect(
        useCase.execute(null, { estado: "confirmado" })
      ).rejects.toThrow("asistenciaId es requerido");
    });

    test("debe lanzar error si no se proporciona ningún campo", async () => {
      await expect(useCase.execute(1, {})).rejects.toThrow(
        "Debe proporcionar al menos un campo para actualizar"
      );
    });

    test("debe lanzar error si asistencia no existe", async () => {
      await expect(
        useCase.execute(999, { estado: "confirmado" })
      ).rejects.toThrow("Asistencia con ID 999 no encontrada");
    });

    test("debe lanzar error con estado inválido", async () => {
      await expect(useCase.execute(1, { estado: "invalido" })).rejects.toThrow(
        "estado debe ser uno de: confirmado, ausente, pendiente"
      );
    });

    test("debe lanzar error si cambia a ausente sin motivo", async () => {
      await expect(useCase.execute(1, { estado: "ausente" })).rejects.toThrow(
        "motivoAusenciaId es requerido cuando el estado es 'ausente'"
      );
    });

    test("debe permitir cambiar a ausente si ya tiene motivo", async () => {
      // La asistencia 2 ya tiene motivoAusenciaId: 1
      const resultado = await useCase.execute(2, { estado: "ausente" });

      expect(resultado.estado).toBe("ausente");
      expect(resultado.motivoAusenciaId).toBe(1);
    });

    test("debe actualizar asistencia manteniendo campos no modificados", async () => {
      const resultado = await useCase.execute(1, {
        comentario: "Nuevo comentario",
      });

      expect(resultado.estado).toBe("pendiente"); // No modificado
      expect(resultado.comentario).toBe("Nuevo comentario");
      expect(resultado.jugadorId).toBe(1); // No modificado
    });
  });
});
