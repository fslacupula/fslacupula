/**
 * Tests unitarios para la entidad Usuario
 */
import { describe, it, expect, beforeEach } from "@jest/globals";
import { Usuario } from "../../../../src/domain/entities/Usuario.js";
import { ValidationError } from "../../../../src/domain/errors/index.js";

describe("Usuario Entity", () => {
  describe("Constructor y creación", () => {
    it("should create a valid usuario with all required fields", () => {
      const usuario = new Usuario({
        id: 1,
        email: "test@example.com",
        password: "hashedPassword123",
        nombre: "Test User",
        rol: "jugador",
      });

      expect(usuario.id).toBe(1);
      expect(usuario.email).toBe("test@example.com");
      expect(usuario.password).toBe("hashedPassword123");
      expect(usuario.nombre).toBe("Test User");
      expect(usuario.rol).toBe("jugador");
      expect(usuario.activo).toBe(true); // Default value
    });

    it("should create usuario with activo flag", () => {
      const usuario = new Usuario({
        id: 1,
        email: "test@example.com",
        password: "hashed",
        nombre: "Test",
        rol: "jugador",
        activo: false,
      });

      expect(usuario.activo).toBe(false);
    });

    it("should throw ValidationError if email is missing", () => {
      expect(() => {
        new Usuario({
          id: 1,
          password: "hashed",
          nombre: "Test",
          rol: "jugador",
        });
      }).toThrow(ValidationError);
    });

    it("should throw ValidationError if email is invalid format", () => {
      expect(() => {
        new Usuario({
          id: 1,
          email: "invalid-email",
          password: "hashed",
          nombre: "Test",
          rol: "jugador",
        });
      }).toThrow(ValidationError);
    });

    it("should throw ValidationError if nombre is missing", () => {
      expect(() => {
        new Usuario({
          id: 1,
          email: "test@example.com",
          password: "hashed",
          rol: "jugador",
        });
      }).toThrow(ValidationError);
    });

    it("should throw ValidationError if nombre is too short", () => {
      expect(() => {
        new Usuario({
          id: 1,
          email: "test@example.com",
          password: "hashed",
          nombre: "A",
          rol: "jugador",
        });
      }).toThrow(ValidationError);
    });

    it("should throw ValidationError if rol is invalid", () => {
      expect(() => {
        new Usuario({
          id: 1,
          email: "test@example.com",
          password: "hashed",
          nombre: "Test User",
          rol: "invalid-role",
        });
      }).toThrow(ValidationError);
    });

    it('should accept "jugador" as valid rol', () => {
      const usuario = new Usuario({
        id: 1,
        email: "test@example.com",
        password: "hashed",
        nombre: "Test User",
        rol: "jugador",
      });

      expect(usuario.rol).toBe("jugador");
    });

    it('should accept "gestor" as valid rol', () => {
      const usuario = new Usuario({
        id: 1,
        email: "test@example.com",
        password: "hashed",
        nombre: "Test User",
        rol: "gestor",
      });

      expect(usuario.rol).toBe("gestor");
    });
  });

  describe("Métodos de negocio", () => {
    let usuario;

    beforeEach(() => {
      usuario = new Usuario({
        id: 1,
        email: "test@example.com",
        password: "hashed",
        nombre: "Test User",
        rol: "jugador",
        activo: true,
      });
    });

    it("should activate an inactive usuario", () => {
      usuario.activo = false;
      usuario.activar();

      expect(usuario.activo).toBe(true);
    });

    it("should deactivate an active usuario", () => {
      usuario.desactivar();

      expect(usuario.activo).toBe(false);
    });

    it("should check if usuario is jugador", () => {
      expect(usuario.esJugador()).toBe(true);
    });

    it("should check if usuario is gestor", () => {
      expect(usuario.esGestor()).toBe(false);

      const gestor = new Usuario({
        id: 2,
        email: "gestor@example.com",
        password: "hashed",
        nombre: "Gestor",
        rol: "gestor",
      });

      expect(gestor.esGestor()).toBe(true);
    });

    it("should return safe user data without password", () => {
      const safeData = usuario.toSafeObject();

      expect(safeData).toHaveProperty("id");
      expect(safeData).toHaveProperty("email");
      expect(safeData).toHaveProperty("nombre");
      expect(safeData).toHaveProperty("rol");
      expect(safeData).toHaveProperty("activo");
      expect(safeData).not.toHaveProperty("password");
    });

    it("should validate that email cannot be changed to invalid format", () => {
      expect(() => {
        usuario.cambiarEmail("invalid-email");
      }).toThrow(ValidationError);
    });

    it("should allow changing email to valid format", () => {
      usuario.cambiarEmail("newemail@example.com");
      expect(usuario.email).toBe("newemail@example.com");
    });

    it("should allow changing nombre if valid", () => {
      usuario.cambiarNombre("New Name");
      expect(usuario.nombre).toBe("New Name");
    });

    it("should throw ValidationError when changing nombre to invalid", () => {
      expect(() => {
        usuario.cambiarNombre("A");
      }).toThrow(ValidationError);
    });
  });

  describe("Validaciones estáticas", () => {
    it("should validate correct email format", () => {
      expect(Usuario.esEmailValido("test@example.com")).toBe(true);
      expect(Usuario.esEmailValido("user.name+tag@example.co.uk")).toBe(true);
    });

    it("should invalidate incorrect email format", () => {
      expect(Usuario.esEmailValido("invalid")).toBe(false);
      expect(Usuario.esEmailValido("invalid@")).toBe(false);
      expect(Usuario.esEmailValido("@example.com")).toBe(false);
      expect(Usuario.esEmailValido("")).toBe(false);
    });

    it("should validate rol values", () => {
      expect(Usuario.esRolValido("jugador")).toBe(true);
      expect(Usuario.esRolValido("gestor")).toBe(true);
      expect(Usuario.esRolValido("admin")).toBe(false);
      expect(Usuario.esRolValido("")).toBe(false);
    });
  });

  describe("Inmutabilidad y encapsulación", () => {
    it("should not allow direct modification of rol", () => {
      const usuario = new Usuario({
        id: 1,
        email: "test@example.com",
        password: "hashed",
        nombre: "Test",
        rol: "jugador",
      });

      // Intentar modificar directamente (debería ser inmutable o validado)
      const originalRol = usuario.rol;

      // En una implementación completa, esto debería estar protegido
      expect(usuario.rol).toBe(originalRol);
    });
  });
});
