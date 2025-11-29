import { describe, test, expect, beforeEach } from "@jest/globals";
import { RegistrarAsistenciaUseCase } from "../../../src/application/useCases/asistencia/RegistrarAsistenciaUseCase.js";

class MockAsistenciaRepository {
  constructor() {
    this.asistencias = [];
    this.nextId = 1;
  }

  async registrar(datos) {
    const asistencia = {
      id: this.nextId++,
      ...datos,
      fechaRespuesta: new Date(),
    };
    this.asistencias.push(asistencia);
    return asistencia;
  }

  async findByJugadorYEvento(
    jugadorId,
    partidoId = null,
    entrenamientoId = null
  ) {
    return this.asistencias.find(
      (a) =>
        a.jugadorId === jugadorId &&
        a.partidoId === partidoId &&
        a.entrenamientoId === entrenamientoId
    );
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
    const id = jugador.id || this.jugadores.size + 1;
    const jugadorConId = { ...jugador, id };
    this.jugadores.set(id, jugadorConId);
    return jugadorConId;
  }
}

describe("RegistrarAsistenciaUseCase", () => {
  let mockAsistenciaRepository;
  let mockJugadorRepository;
  let useCase;

  beforeEach(() => {
    mockAsistenciaRepository = new MockAsistenciaRepository();
    mockJugadorRepository = new MockJugadorRepository();
    useCase = new RegistrarAsistenciaUseCase(
      mockAsistenciaRepository,
      mockJugadorRepository
    );
  });

  describe("constructor", () => {
    test("debe requerir asistenciaRepository", () => {
      expect(
        () => new RegistrarAsistenciaUseCase(null, mockJugadorRepository)
      ).toThrow("asistenciaRepository es requerido");
    });

    test("debe requerir jugadorRepository", () => {
      expect(
        () => new RegistrarAsistenciaUseCase(mockAsistenciaRepository, null)
      ).toThrow("jugadorRepository es requerido");
    });

    test("debe crear instancia correctamente", () => {
      expect(useCase).toBeInstanceOf(RegistrarAsistenciaUseCase);
      expect(useCase.asistenciaRepository).toBe(mockAsistenciaRepository);
      expect(useCase.jugadorRepository).toBe(mockJugadorRepository);
    });
  });

  describe("execute", () => {
    beforeEach(async () => {
      // Crear un jugador de prueba
      await mockJugadorRepository.create({
        id: 1,
        usuarioId: 1,
        numeroDorsal: 10,
        posicion: "Portero",
      });
    });

    test("debe registrar asistencia a partido correctamente", async () => {
      const datos = {
        jugadorId: 1,
        partidoId: 1,
        estado: "confirmado",
      };

      const resultado = await useCase.execute(datos);

      expect(resultado).toBeDefined();
      expect(resultado.id).toBe(1);
      expect(resultado.jugadorId).toBe(1);
      expect(resultado.partidoId).toBe(1);
      expect(resultado.entrenamientoId).toBeNull();
      expect(resultado.estado).toBe("confirmado");
      expect(mockAsistenciaRepository.asistencias).toHaveLength(1);
    });

    test("debe registrar asistencia a entrenamiento correctamente", async () => {
      const datos = {
        jugadorId: 1,
        entrenamientoId: 1,
        estado: "confirmado",
      };

      const resultado = await useCase.execute(datos);

      expect(resultado).toBeDefined();
      expect(resultado.jugadorId).toBe(1);
      expect(resultado.partidoId).toBeNull();
      expect(resultado.entrenamientoId).toBe(1);
      expect(resultado.estado).toBe("confirmado");
    });

    test("debe registrar ausencia con motivo", async () => {
      const datos = {
        jugadorId: 1,
        partidoId: 1,
        estado: "ausente",
        motivoAusenciaId: 1,
        comentario: "Lesionado",
      };

      const resultado = await useCase.execute(datos);

      expect(resultado.estado).toBe("ausente");
      expect(resultado.motivoAusenciaId).toBe(1);
      expect(resultado.comentario).toBe("Lesionado");
    });

    test("debe registrar asistencia pendiente", async () => {
      const datos = {
        jugadorId: 1,
        partidoId: 1,
        estado: "pendiente",
      };

      const resultado = await useCase.execute(datos);

      expect(resultado.estado).toBe("pendiente");
      expect(resultado.motivoAusenciaId).toBeNull();
    });

    test("debe lanzar error si falta jugadorId", async () => {
      const datos = {
        partidoId: 1,
        estado: "confirmado",
      };

      await expect(useCase.execute(datos)).rejects.toThrow(
        "jugadorId es requerido"
      );
    });

    test("debe lanzar error si no se proporciona evento", async () => {
      const datos = {
        jugadorId: 1,
        estado: "confirmado",
      };

      await expect(useCase.execute(datos)).rejects.toThrow(
        "Debe proporcionar partidoId o entrenamientoId"
      );
    });

    test("debe lanzar error si se proporcionan ambos eventos", async () => {
      const datos = {
        jugadorId: 1,
        partidoId: 1,
        entrenamientoId: 1,
        estado: "confirmado",
      };

      await expect(useCase.execute(datos)).rejects.toThrow(
        "No puede proporcionar partidoId y entrenamientoId al mismo tiempo"
      );
    });

    test("debe lanzar error si falta estado", async () => {
      const datos = {
        jugadorId: 1,
        partidoId: 1,
      };

      await expect(useCase.execute(datos)).rejects.toThrow(
        "estado es requerido"
      );
    });

    test("debe lanzar error con estado inválido", async () => {
      const datos = {
        jugadorId: 1,
        partidoId: 1,
        estado: "invalido",
      };

      await expect(useCase.execute(datos)).rejects.toThrow(
        "estado debe ser uno de: confirmado, ausente, pendiente"
      );
    });

    test("debe lanzar error si jugador no existe", async () => {
      const datos = {
        jugadorId: 999,
        partidoId: 1,
        estado: "confirmado",
      };

      await expect(useCase.execute(datos)).rejects.toThrow(
        "Jugador con ID 999 no encontrado"
      );
    });

    test("debe lanzar error si ausente sin motivo", async () => {
      const datos = {
        jugadorId: 1,
        partidoId: 1,
        estado: "ausente",
      };

      await expect(useCase.execute(datos)).rejects.toThrow(
        "motivoAusenciaId es requerido cuando el estado es 'ausente'"
      );
    });

    test("debe lanzar error si ya existe asistencia", async () => {
      const datos = {
        jugadorId: 1,
        partidoId: 1,
        estado: "confirmado",
      };

      await useCase.execute(datos);

      await expect(useCase.execute(datos)).rejects.toThrow(
        "Ya existe una asistencia para este jugador y evento"
      );
    });

    test("debe registrar múltiples asistencias para diferentes jugadores", async () => {
      await mockJugadorRepository.create({
        id: 2,
        usuarioId: 2,
        numeroDorsal: 11,
        posicion: "Ala",
      });

      const datos1 = {
        jugadorId: 1,
        partidoId: 1,
        estado: "confirmado",
      };

      const datos2 = {
        jugadorId: 2,
        partidoId: 1,
        estado: "ausente",
        motivoAusenciaId: 1,
      };

      await useCase.execute(datos1);
      await useCase.execute(datos2);

      expect(mockAsistenciaRepository.asistencias).toHaveLength(2);
    });
  });
});
