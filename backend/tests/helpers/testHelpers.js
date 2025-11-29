/**
 * Test Helpers - Utilidades comunes para tests
 */

import { jest } from "@jest/globals";

/**
 * Crea un mock de repositorio con métodos básicos
 */
export function createRepositoryMock() {
  return {
    findById: jest.fn(),
    findByEmail: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    save: jest.fn(),
  };
}

/**
 * Crea un mock de servicio con métodos básicos
 */
export function createServiceMock() {
  return {
    execute: jest.fn(),
    validate: jest.fn(),
    process: jest.fn(),
  };
}

/**
 * Crea un mock de token service
 */
export function createTokenServiceMock() {
  return {
    generateToken: jest.fn().mockReturnValue("mock-token-123"),
    verifyToken: jest
      .fn()
      .mockReturnValue({ id: 1, email: "test@test.com", rol: "jugador" }),
    decodeToken: jest.fn(),
  };
}

/**
 * Crea un mock de hash service
 */
export function createHashServiceMock() {
  return {
    hash: jest.fn().mockResolvedValue("hashed-password"),
    compare: jest.fn().mockResolvedValue(true),
  };
}

/**
 * Espera un tiempo determinado (para tests async)
 */
export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Limpia todos los mocks
 */
export function clearAllMocks() {
  jest.clearAllMocks();
}

/**
 * Crea un objeto de request mock para Express
 */
export function createMockRequest(overrides = {}) {
  return {
    body: {},
    params: {},
    query: {},
    headers: {},
    user: null,
    ...overrides,
  };
}

/**
 * Crea un objeto de response mock para Express
 */
export function createMockResponse() {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    sendFile: jest.fn().mockReturnThis(),
    statusCode: 200,
  };
  return res;
}

/**
 * Crea un objeto de next mock para Express middleware
 */
export function createMockNext() {
  return jest.fn();
}

/**
 * Assertion helpers
 */
export const assertions = {
  /**
   * Verifica que una función lance un error específico
   */
  async toThrowError(fn, ErrorClass, message = null) {
    try {
      await fn();
      throw new Error("Expected function to throw but it did not");
    } catch (error) {
      if (!(error instanceof ErrorClass)) {
        throw new Error(
          `Expected error of type ${ErrorClass.name} but got ${error.constructor.name}`
        );
      }
      if (message && !error.message.includes(message)) {
        throw new Error(
          `Expected error message to contain "${message}" but got "${error.message}"`
        );
      }
    }
  },
};

/**
 * Generadores de datos de prueba
 */
export const testData = {
  usuario: {
    valid: {
      email: "test@example.com",
      password: "Password123!",
      nombre: "Test User",
      rol: "jugador",
    },
    invalidEmail: {
      email: "invalid-email",
      password: "Password123!",
      nombre: "Test User",
      rol: "jugador",
    },
    weakPassword: {
      email: "test@example.com",
      password: "123",
      nombre: "Test User",
      rol: "jugador",
    },
  },
  jugador: {
    valid: {
      numeroDorsal: 10,
      posicionId: 1,
      telefono: "+34666777888",
      fechaNacimiento: "1995-05-15",
      alias: "El Test",
    },
  },
  partido: {
    valid: {
      fecha: "2025-12-15",
      hora: "18:00:00",
      rival: "Rival FC",
      ubicacion: "Pabellón Test",
      tipo: "amistoso",
      esLocal: true,
    },
  },
  entrenamiento: {
    valid: {
      fecha: "2025-12-10",
      hora: "19:00:00",
      ubicacion: "Pabellón Test",
      descripcion: "Entrenamiento de prueba",
      duracionMinutos: 90,
    },
  },
};

export default {
  createRepositoryMock,
  createServiceMock,
  createTokenServiceMock,
  createHashServiceMock,
  sleep,
  clearAllMocks,
  createMockRequest,
  createMockResponse,
  createMockNext,
  assertions,
  testData,
};
