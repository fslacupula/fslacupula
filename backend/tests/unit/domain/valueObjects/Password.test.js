import { describe, test, expect } from "@jest/globals";
import { Password } from "../../../../src/domain/valueObjects/Password.js";
import { ValidationError } from "../../../../src/domain/errors/index.js";

describe("Password Value Object", () => {
  describe("Creación exitosa", () => {
    test("debería crear una contraseña válida", () => {
      const password = new Password("Password123");
      expect(password.getValue()).toBe("Password123");
      expect(password.isHashed()).toBe(false);
    });

    test("debería crear una contraseña hasheada", () => {
      const hash = "$2a$10$abcdefghijklmnopqrstuvwxyz123456";
      const password = new Password(hash, true);
      expect(password.getValue()).toBe(hash);
      expect(password.isHashed()).toBe(true);
    });

    test("debería aceptar contraseña con 8 caracteres mínimo", () => {
      const password = new Password("Pass123A");
      expect(password.getLength()).toBe(8);
    });

    test("debería aceptar contraseña con caracteres especiales", () => {
      const password = new Password("Pass123!@#");
      expect(password.getValue()).toBe("Pass123!@#");
    });

    test("debería aceptar contraseña larga", () => {
      const password = new Password("MyVerySecurePassword123");
      expect(password.getLength()).toBe(23);
    });
  });

  describe("Validaciones", () => {
    test("debería lanzar error si la contraseña es nula", () => {
      expect(() => new Password(null)).toThrow(ValidationError);
      expect(() => new Password(null)).toThrow("La contraseña es requerida");
    });

    test("debería lanzar error si la contraseña es undefined", () => {
      expect(() => new Password(undefined)).toThrow(ValidationError);
    });

    test("debería lanzar error si la contraseña está vacía", () => {
      expect(() => new Password("")).toThrow(ValidationError);
      expect(() => new Password("")).toThrow("no puede estar vacía");
    });

    test("debería lanzar error si la contraseña solo tiene espacios", () => {
      expect(() => new Password("   ")).toThrow(ValidationError);
    });

    test("debería lanzar error si es menor a 8 caracteres", () => {
      expect(() => new Password("Pass12")).toThrow(ValidationError);
      expect(() => new Password("Pass12")).toThrow("al menos 8 caracteres");
    });

    test("debería lanzar error si no tiene minúsculas", () => {
      expect(() => new Password("PASSWORD123")).toThrow(ValidationError);
      expect(() => new Password("PASSWORD123")).toThrow(
        "incluir mayúsculas, minúsculas y números"
      );
    });

    test("debería lanzar error si no tiene mayúsculas", () => {
      expect(() => new Password("password123")).toThrow(ValidationError);
    });

    test("debería lanzar error si no tiene números", () => {
      expect(() => new Password("Password")).toThrow(ValidationError);
    });

    test("debería lanzar error si no es un string", () => {
      expect(() => new Password(12345678)).toThrow(ValidationError);
      expect(() => new Password({})).toThrow(ValidationError);
    });

    test("debería lanzar error si es demasiado larga", () => {
      const passwordLarga = "Pass123" + "a".repeat(125);
      expect(() => new Password(passwordLarga)).toThrow(ValidationError);
    });
  });

  describe("Métodos", () => {
    test("getLength debería retornar la longitud", () => {
      const password = new Password("Password123");
      expect(password.getLength()).toBe(11);
    });

    test("equals debería comparar contraseñas iguales en texto plano", () => {
      const password1 = new Password("Password123");
      const password2 = new Password("Password123");
      expect(password1.equals(password2)).toBe(true);
    });

    test("equals debería comparar contraseñas diferentes", () => {
      const password1 = new Password("Password123");
      const password2 = new Password("Different456");
      expect(password1.equals(password2)).toBe(false);
    });

    test("equals debería comparar hashes iguales", () => {
      const hash = "$2a$10$abcdefghijklmnopqrstuvwxyz";
      const password1 = new Password(hash, true);
      const password2 = new Password(hash, true);
      expect(password1.equals(password2)).toBe(true);
    });

    test("equals no debería comparar texto plano con hash", () => {
      const password1 = new Password("Password123");
      const hash = "$2a$10$abcdefghijklmnopqrstuvwxyz";
      const password2 = new Password(hash, true);
      expect(password1.equals(password2)).toBe(false);
    });

    test("equals debería retornar false si no es un Password", () => {
      const password = new Password("Password123");
      expect(password.equals("Password123")).toBe(false);
      expect(password.equals(null)).toBe(false);
    });

    test("toString debería ocultar la contraseña", () => {
      const password = new Password("Password123");
      expect(password.toString()).toBe("********");
    });

    test("toJSON debería ocultar la contraseña", () => {
      const password = new Password("Password123");
      expect(password.toJSON()).toBe("********");
      expect(JSON.stringify({ password })).toBe('{"password":"********"}');
    });
  });

  describe("Inmutabilidad", () => {
    test("debería ser inmutable", () => {
      const password = new Password("Password123");
      expect(() => {
        password.value = "OtraPassword456";
      }).toThrow();
    });

    test("debería estar congelado", () => {
      const password = new Password("Password123");
      expect(Object.isFrozen(password)).toBe(true);
    });
  });

  describe("Método estático esValida", () => {
    test("debería validar contraseñas correctas", () => {
      expect(Password.esValida("Password123")).toBe(true);
      expect(Password.esValida("MySecure123")).toBe(true);
      expect(Password.esValida("Test1234ABC")).toBe(true);
      expect(Password.esValida("Abc123!@#")).toBe(true);
    });

    test("debería rechazar contraseñas incorrectas", () => {
      expect(Password.esValida("")).toBe(false);
      expect(Password.esValida("short")).toBe(false);
      expect(Password.esValida("nocapital123")).toBe(false);
      expect(Password.esValida("NOLOWERCASE123")).toBe(false);
      expect(Password.esValida("NoNumbers")).toBe(false);
      expect(Password.esValida("Pass12")).toBe(false); // muy corta
    });

    test("debería rechazar valores no string", () => {
      expect(Password.esValida(null)).toBe(false);
      expect(Password.esValida(undefined)).toBe(false);
      expect(Password.esValida(12345678)).toBe(false);
    });
  });

  describe("Método estático evaluarFortaleza", () => {
    test("debería evaluar contraseña débil", () => {
      expect(Password.evaluarFortaleza("Pass123A")).toBe("debil");
      expect(Password.evaluarFortaleza("Short1A")).toBe("debil");
    });

    test("debería evaluar contraseña media", () => {
      expect(Password.evaluarFortaleza("Password123")).toBe("media");
      expect(Password.evaluarFortaleza("MyPass1234")).toBe("media");
    });

    test("debería evaluar contraseña fuerte", () => {
      expect(Password.evaluarFortaleza("MyVerySecurePass123!")).toBe("fuerte");
      expect(Password.evaluarFortaleza("C0mpl3x!Pass#2024")).toBe("fuerte");
      expect(Password.evaluarFortaleza("SuperSecure123!@#")).toBe("fuerte");
    });

    test("debería considerar longitud en la evaluación", () => {
      const corta = Password.evaluarFortaleza("Pass123!");
      const larga = Password.evaluarFortaleza("MyVeryLongPassword123!");
      expect(larga).not.toBe(corta);
    });

    test("debería considerar caracteres especiales", () => {
      const sinEspeciales = Password.evaluarFortaleza("Password123");
      const conEspeciales = Password.evaluarFortaleza("Password123!@#");
      expect(conEspeciales).not.toBe(sinEspeciales);
    });
  });

  describe("Factory methods", () => {
    test("fromPlainText debería crear desde texto plano", () => {
      const password = Password.fromPlainText("Password123");
      expect(password).toBeInstanceOf(Password);
      expect(password.isHashed()).toBe(false);
      expect(password.getValue()).toBe("Password123");
    });

    test("fromPlainText debería validar la contraseña", () => {
      expect(() => Password.fromPlainText("weak")).toThrow(ValidationError);
    });

    test("fromHash debería crear desde un hash", () => {
      const hash = "$2a$10$abcdefghijklmnopqrstuvwxyz";
      const password = Password.fromHash(hash);
      expect(password).toBeInstanceOf(Password);
      expect(password.isHashed()).toBe(true);
      expect(password.getValue()).toBe(hash);
    });

    test("fromHash debería lanzar error si el hash es inválido", () => {
      expect(() => Password.fromHash("")).toThrow(ValidationError);
      expect(() => Password.fromHash(null)).toThrow(ValidationError);
    });
  });

  describe("Contraseñas hasheadas", () => {
    test("no debería validar complejidad en hashes", () => {
      // Un hash bcrypt válido no cumple con las reglas de contraseña
      const hash = "$2a$10$1234567890123456789012";
      expect(() => new Password(hash, true)).not.toThrow();
    });

    test("debería permitir cualquier string como hash", () => {
      const hash = "cualquier_hash_generado";
      const password = new Password(hash, true);
      expect(password.getValue()).toBe(hash);
      expect(password.isHashed()).toBe(true);
    });
  });
});
