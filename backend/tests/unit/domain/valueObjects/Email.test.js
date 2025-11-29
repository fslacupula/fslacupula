import { describe, test, expect } from "@jest/globals";
import { Email } from "../../../../src/domain/valueObjects/Email.js";
import { ValidationError } from "../../../../src/domain/errors/index.js";

describe("Email Value Object", () => {
  describe("Creación exitosa", () => {
    test("debería crear un email válido", () => {
      const email = new Email("usuario@ejemplo.com");
      expect(email.getValue()).toBe("usuario@ejemplo.com");
    });

    test("debería normalizar a minúsculas", () => {
      const email = new Email("Usuario@Ejemplo.COM");
      expect(email.getValue()).toBe("usuario@ejemplo.com");
    });

    test("debería eliminar espacios en blanco", () => {
      const email = new Email("  usuario@ejemplo.com  ");
      expect(email.getValue()).toBe("usuario@ejemplo.com");
    });

    test("debería aceptar emails con números", () => {
      const email = new Email("usuario123@ejemplo123.com");
      expect(email.getValue()).toBe("usuario123@ejemplo123.com");
    });

    test("debería aceptar emails con guiones y guiones bajos", () => {
      const email = new Email("usuario_test-123@ejemplo.com");
      expect(email.getValue()).toBe("usuario_test-123@ejemplo.com");
    });

    test("debería aceptar emails con subdominios", () => {
      const email = new Email("usuario@mail.ejemplo.com");
      expect(email.getValue()).toBe("usuario@mail.ejemplo.com");
    });

    test("debería aceptar emails con puntos en el usuario", () => {
      const email = new Email("usuario.nombre@ejemplo.com");
      expect(email.getValue()).toBe("usuario.nombre@ejemplo.com");
    });
  });

  describe("Validaciones", () => {
    test("debería lanzar error si el email es nulo", () => {
      expect(() => new Email(null)).toThrow(ValidationError);
      expect(() => new Email(null)).toThrow("El email es requerido");
    });

    test("debería lanzar error si el email es undefined", () => {
      expect(() => new Email(undefined)).toThrow(ValidationError);
    });

    test("debería lanzar error si el email está vacío", () => {
      expect(() => new Email("")).toThrow(ValidationError);
      expect(() => new Email("")).toThrow("no puede estar vacío");
    });

    test("debería lanzar error si el email solo tiene espacios", () => {
      expect(() => new Email("   ")).toThrow(ValidationError);
    });

    test("debería lanzar error si no tiene @", () => {
      expect(() => new Email("usuarioejemplo.com")).toThrow(ValidationError);
      expect(() => new Email("usuarioejemplo.com")).toThrow(
        "formato del email no es válido"
      );
    });

    test("debería lanzar error si no tiene dominio", () => {
      expect(() => new Email("usuario@")).toThrow(ValidationError);
    });

    test("debería lanzar error si no tiene extensión", () => {
      expect(() => new Email("usuario@ejemplo")).toThrow(ValidationError);
    });

    test("debería lanzar error si tiene múltiples @", () => {
      expect(() => new Email("usuario@@ejemplo.com")).toThrow(ValidationError);
    });

    test("debería lanzar error si empieza con punto", () => {
      expect(() => new Email(".usuario@ejemplo.com")).toThrow(ValidationError);
    });

    test("debería lanzar error si termina con punto", () => {
      expect(() => new Email("usuario.@ejemplo.com")).toThrow(ValidationError);
    });

    test("debería lanzar error si tiene puntos consecutivos", () => {
      expect(() => new Email("usuario..nombre@ejemplo.com")).toThrow(
        ValidationError
      );
    });

    test("debería lanzar error si el dominio tiene puntos consecutivos", () => {
      expect(() => new Email("usuario@ejemplo..com")).toThrow(ValidationError);
    });

    test("debería lanzar error si es demasiado largo", () => {
      const emailLargo = "a".repeat(250) + "@ejemplo.com";
      expect(() => new Email(emailLargo)).toThrow(ValidationError);
    });

    test("debería lanzar error si no es un string", () => {
      expect(() => new Email(123)).toThrow(ValidationError);
      expect(() => new Email({})).toThrow(ValidationError);
      expect(() => new Email([])).toThrow(ValidationError);
    });
  });

  describe("Métodos", () => {
    test("getDominio debería retornar el dominio", () => {
      const email = new Email("usuario@ejemplo.com");
      expect(email.getDominio()).toBe("ejemplo.com");
    });

    test("getDominio debería funcionar con subdominios", () => {
      const email = new Email("usuario@mail.ejemplo.com");
      expect(email.getDominio()).toBe("mail.ejemplo.com");
    });

    test("getUsuario debería retornar la parte local", () => {
      const email = new Email("usuario@ejemplo.com");
      expect(email.getUsuario()).toBe("usuario");
    });

    test("getUsuario debería funcionar con puntos", () => {
      const email = new Email("usuario.nombre@ejemplo.com");
      expect(email.getUsuario()).toBe("usuario.nombre");
    });

    test("equals debería comparar correctamente emails iguales", () => {
      const email1 = new Email("usuario@ejemplo.com");
      const email2 = new Email("usuario@ejemplo.com");
      expect(email1.equals(email2)).toBe(true);
    });

    test("equals debería comparar correctamente emails diferentes", () => {
      const email1 = new Email("usuario1@ejemplo.com");
      const email2 = new Email("usuario2@ejemplo.com");
      expect(email1.equals(email2)).toBe(false);
    });

    test("equals debería normalizar antes de comparar", () => {
      const email1 = new Email("Usuario@Ejemplo.COM");
      const email2 = new Email("usuario@ejemplo.com");
      expect(email1.equals(email2)).toBe(true);
    });

    test("equals debería retornar false si no es un Email", () => {
      const email = new Email("usuario@ejemplo.com");
      expect(email.equals("usuario@ejemplo.com")).toBe(false);
      expect(email.equals(null)).toBe(false);
      expect(email.equals(undefined)).toBe(false);
    });

    test("toString debería retornar el valor", () => {
      const email = new Email("usuario@ejemplo.com");
      expect(email.toString()).toBe("usuario@ejemplo.com");
    });

    test("toJSON debería retornar el valor", () => {
      const email = new Email("usuario@ejemplo.com");
      expect(email.toJSON()).toBe("usuario@ejemplo.com");
      expect(JSON.stringify({ email })).toBe('{"email":"usuario@ejemplo.com"}');
    });
  });

  describe("Inmutabilidad", () => {
    test("debería ser inmutable", () => {
      const email = new Email("usuario@ejemplo.com");
      expect(() => {
        email.value = "otro@ejemplo.com";
      }).toThrow();
    });

    test("debería estar congelado", () => {
      const email = new Email("usuario@ejemplo.com");
      expect(Object.isFrozen(email)).toBe(true);
    });
  });

  describe("Método estático esValido", () => {
    test("debería validar emails correctos", () => {
      expect(Email.esValido("usuario@ejemplo.com")).toBe(true);
      expect(Email.esValido("usuario.nombre@ejemplo.com")).toBe(true);
      expect(Email.esValido("usuario_123@mail.ejemplo.com")).toBe(true);
    });

    test("debería rechazar emails incorrectos", () => {
      expect(Email.esValido("")).toBe(false);
      expect(Email.esValido("usuario")).toBe(false);
      expect(Email.esValido("usuario@")).toBe(false);
      expect(Email.esValido("@ejemplo.com")).toBe(false);
      expect(Email.esValido("usuario@ejemplo")).toBe(false);
      expect(Email.esValido(".usuario@ejemplo.com")).toBe(false);
      expect(Email.esValido("usuario.@ejemplo.com")).toBe(false);
    });

    test("debería rechazar valores no string", () => {
      expect(Email.esValido(null)).toBe(false);
      expect(Email.esValido(undefined)).toBe(false);
      expect(Email.esValido(123)).toBe(false);
    });
  });

  describe("Factory method from", () => {
    test("debería crear un Email usando from", () => {
      const email = Email.from("usuario@ejemplo.com");
      expect(email).toBeInstanceOf(Email);
      expect(email.getValue()).toBe("usuario@ejemplo.com");
    });

    test("debería lanzar error con valor inválido", () => {
      expect(() => Email.from("invalido")).toThrow(ValidationError);
    });
  });
});
