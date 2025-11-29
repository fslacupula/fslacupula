import { describe, test, expect, beforeEach, jest } from "@jest/globals";
import { CrearUsuarioUseCase } from "../../../src/application/useCases/usuario/CrearUsuarioUseCase.js";
import { Usuario } from "../../../src/domain/entities/index.js";
import { ValidationError } from "../../../src/domain/errors/index.js";

/**
 * Mock del Repositorio de Usuarios
 * Simula la interfaz IUsuarioRepository sin necesidad de base de datos
 */
class MockUsuarioRepository {
  constructor() {
    this.usuarios = [];
    this.nextId = 1;
  }

  async existsByEmail(email, excludeId = null) {
    return this.usuarios.some(
      (u) => u.email === email && (!excludeId || u.id !== excludeId)
    );
  }

  async create(usuario) {
    const usuarioConId = new Usuario({
      id: this.nextId++,
      email: usuario.email,
      password: usuario.password,
      nombre: usuario.nombre,
      rol: usuario.rol,
      activo: usuario.activo,
    });
    this.usuarios.push(usuarioConId);
    return usuarioConId;
  }

  async findById(id) {
    return this.usuarios.find((u) => u.id === id) || null;
  }

  async findByEmail(email) {
    return this.usuarios.find((u) => u.email === email) || null;
  }

  reset() {
    this.usuarios = [];
    this.nextId = 1;
  }
}

describe("CrearUsuarioUseCase", () => {
  let mockRepository;
  let useCase;

  beforeEach(() => {
    mockRepository = new MockUsuarioRepository();
    useCase = new CrearUsuarioUseCase(mockRepository);
  });

  describe("constructor", () => {
    test("debe requerir usuarioRepository", () => {
      expect(() => new CrearUsuarioUseCase(null)).toThrow(
        "usuarioRepository is required"
      );
    });

    test("debe crear instancia correctamente con repositorio", () => {
      expect(useCase.usuarioRepository).toBe(mockRepository);
    });
  });

  describe("execute", () => {
    test("debe crear usuario jugador correctamente", async () => {
      const datos = {
        email: "jugador@test.com",
        password: "Password123!",
        nombre: "Juan Pérez",
        rol: "jugador",
      };

      const resultado = await useCase.execute(datos);

      expect(resultado.id).toBe(1);
      expect(resultado.email).toBe("jugador@test.com");
      expect(resultado.nombre).toBe("Juan Pérez");
      expect(resultado.rol).toBe("jugador");
      expect(resultado.activo).toBe(true);
      expect(resultado.password).toBeUndefined(); // No debe exponer contraseña
    });

    test("debe crear usuario gestor correctamente", async () => {
      const datos = {
        email: "gestor@test.com",
        password: "Gestor123!",
        nombre: "María García",
        rol: "gestor",
      };

      const resultado = await useCase.execute(datos);

      expect(resultado.id).toBe(1);
      expect(resultado.email).toBe("gestor@test.com");
      expect(resultado.rol).toBe("gestor");
    });

    test("debe lanzar error si el email ya existe", async () => {
      const datos = {
        email: "duplicado@test.com",
        password: "Password123!",
        nombre: "Usuario Uno",
        rol: "jugador",
      };

      await useCase.execute(datos);

      // Intentar crear otro usuario con el mismo email
      await expect(useCase.execute(datos)).rejects.toThrow(ValidationError);

      await expect(useCase.execute(datos)).rejects.toThrow(
        "El email ya está registrado"
      );
    });

    test("debe lanzar ValidationError con email inválido", async () => {
      const datos = {
        email: "email-invalido",
        password: "Password123!",
        nombre: "Usuario Test",
        rol: "jugador",
      };

      await expect(useCase.execute(datos)).rejects.toThrow(ValidationError);
    });

    // TODO: Implementar validación de password fuerte en entidad Usuario
    test.skip("debe lanzar ValidationError con password débil", async () => {
      const datos = {
        email: "test@test.com",
        password: "123", // Contraseña débil
        nombre: "Usuario Test",
        rol: "jugador",
      };

      await expect(useCase.execute(datos)).rejects.toThrow(ValidationError);
    });

    test("debe lanzar ValidationError con nombre vacío", async () => {
      const datos = {
        email: "test@test.com",
        password: "Password123!",
        nombre: "",
        rol: "jugador",
      };

      await expect(useCase.execute(datos)).rejects.toThrow(ValidationError);
    });

    test("debe lanzar ValidationError con rol inválido", async () => {
      const datos = {
        email: "test@test.com",
        password: "Password123!",
        nombre: "Usuario Test",
        rol: "administrador", // Rol no válido
      };

      await expect(useCase.execute(datos)).rejects.toThrow(ValidationError);
    });

    test("debe crear múltiples usuarios con emails diferentes", async () => {
      const usuarios = [
        {
          email: "usuario1@test.com",
          password: "Password123!",
          nombre: "Usuario Uno",
          rol: "jugador",
        },
        {
          email: "usuario2@test.com",
          password: "Password456!",
          nombre: "Usuario Dos",
          rol: "gestor",
        },
        {
          email: "usuario3@test.com",
          password: "Password789!",
          nombre: "Usuario Tres",
          rol: "jugador",
        },
      ];

      for (const datos of usuarios) {
        const resultado = await useCase.execute(datos);
        expect(resultado.email).toBe(datos.email);
        expect(resultado.password).toBeUndefined();
      }

      expect(mockRepository.usuarios.length).toBe(3);
    });

    // TODO: Implementar normalización de email (toLowerCase) en entidad Usuario o repositorio
    test.skip("debe validar email case-insensitive", async () => {
      await useCase.execute({
        email: "test@TEST.com",
        password: "Password123!",
        nombre: "Usuario Uno",
        rol: "jugador",
      });

      // Intentar con diferentes casos
      await expect(
        useCase.execute({
          email: "TEST@test.com",
          password: "Password456!",
          nombre: "Usuario Dos",
          rol: "jugador",
        })
      ).rejects.toThrow("El email ya está registrado");
    });
  });
});
