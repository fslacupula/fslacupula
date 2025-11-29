/**
 * Tests unitarios para la entidad Jugador
 */
import { describe, it, expect, beforeEach } from "@jest/globals";
import { Jugador } from "../../../../src/domain/entities/Jugador.js";
import { ValidationError } from "../../../../src/domain/errors/index.js";

describe("Jugador Entity", () => {
  describe("Constructor y creación", () => {
    it("should create a valid jugador with all fields", () => {
      const jugador = new Jugador({
        id: 1,
        usuarioId: 10,
        numeroDorsal: 7,
        posicionId: 3,
        telefono: "+34666777888",
        fechaNacimiento: "1995-05-15",
        alias: "El Rayo",
      });

      expect(jugador.id).toBe(1);
      expect(jugador.usuarioId).toBe(10);
      expect(jugador.numeroDorsal).toBe(7);
      expect(jugador.posicionId).toBe(3);
      expect(jugador.telefono).toBe("+34666777888");
      expect(jugador.fechaNacimiento).toBe("1995-05-15");
      expect(jugador.alias).toBe("El Rayo");
    });

    it("should create jugador with optional fields as null", () => {
      const jugador = new Jugador({
        id: 1,
        usuarioId: 10,
      });

      expect(jugador.numeroDorsal).toBeNull();
      expect(jugador.posicionId).toBeNull();
      expect(jugador.telefono).toBeNull();
      expect(jugador.fechaNacimiento).toBeNull();
      expect(jugador.alias).toBeNull();
    });

    it("should throw ValidationError if usuarioId is missing", () => {
      expect(() => {
        new Jugador({
          id: 1,
          numeroDorsal: 10,
        });
      }).toThrow(ValidationError);
    });

    it("should throw ValidationError if numero dorsal is negative", () => {
      expect(() => {
        new Jugador({
          id: 1,
          usuarioId: 10,
          numeroDorsal: -5,
        });
      }).toThrow(ValidationError);
    });

    it("should throw ValidationError if numero dorsal exceeds maximum", () => {
      expect(() => {
        new Jugador({
          id: 1,
          usuarioId: 10,
          numeroDorsal: 1000,
        });
      }).toThrow(ValidationError);
    });

    it("should accept dorsal between 0 and 99", () => {
      const jugador1 = new Jugador({
        id: 1,
        usuarioId: 10,
        numeroDorsal: 0,
      });

      const jugador2 = new Jugador({
        id: 2,
        usuarioId: 11,
        numeroDorsal: 99,
      });

      expect(jugador1.numeroDorsal).toBe(0);
      expect(jugador2.numeroDorsal).toBe(99);
    });

    it("should throw ValidationError if telefono has invalid format", () => {
      expect(() => {
        new Jugador({
          id: 1,
          usuarioId: 10,
          telefono: "123",
        });
      }).toThrow(ValidationError);
    });

    it("should accept valid Spanish phone number", () => {
      const jugador = new Jugador({
        id: 1,
        usuarioId: 10,
        telefono: "+34666777888",
      });

      expect(jugador.telefono).toBe("+34666777888");
    });

    it("should accept valid international phone number", () => {
      const jugador = new Jugador({
        id: 1,
        usuarioId: 10,
        telefono: "+1234567890",
      });

      expect(jugador.telefono).toBe("+1234567890");
    });
  });

  describe("Métodos de negocio", () => {
    let jugador;

    beforeEach(() => {
      jugador = new Jugador({
        id: 1,
        usuarioId: 10,
        numeroDorsal: 10,
        posicionId: 3,
        alias: "El Crack",
      });
    });

    it("should change numero dorsal with validation", () => {
      jugador.cambiarNumeroDorsal(7);
      expect(jugador.numeroDorsal).toBe(7);
    });

    it("should throw error when changing to invalid dorsal", () => {
      expect(() => {
        jugador.cambiarNumeroDorsal(150);
      }).toThrow(ValidationError);
    });

    it("should change posicion", () => {
      jugador.cambiarPosicion(4);
      expect(jugador.posicionId).toBe(4);
    });

    it("should change alias", () => {
      jugador.cambiarAlias("Nuevo Alias");
      expect(jugador.alias).toBe("Nuevo Alias");
    });

    it("should allow null alias", () => {
      jugador.cambiarAlias(null);
      expect(jugador.alias).toBeNull();
    });

    it("should change telefono with validation", () => {
      jugador.cambiarTelefono("+34699888777");
      expect(jugador.telefono).toBe("+34699888777");
    });

    it("should throw error when changing to invalid telefono", () => {
      expect(() => {
        jugador.cambiarTelefono("invalid");
      }).toThrow(ValidationError);
    });

    it("should check if jugador has complete profile", () => {
      const jugadorIncompleto = new Jugador({
        id: 1,
        usuarioId: 10,
      });

      expect(jugadorIncompleto.tienePerfilCompleto()).toBe(false);

      const jugadorCompleto = new Jugador({
        id: 2,
        usuarioId: 11,
        numeroDorsal: 10,
        posicionId: 3,
        telefono: "+34666777888",
        fechaNacimiento: "1995-05-15",
      });

      expect(jugadorCompleto.tienePerfilCompleto()).toBe(true);
    });

    it("should calculate edad if fecha nacimiento is provided", () => {
      const jugadorConFecha = new Jugador({
        id: 1,
        usuarioId: 10,
        fechaNacimiento: "1995-05-15",
      });

      const edad = jugadorConFecha.calcularEdad();
      expect(edad).toBeGreaterThan(20);
      expect(edad).toBeLessThan(100);
    });

    it("should return null for edad if no fecha nacimiento", () => {
      const jugadorSinFecha = new Jugador({
        id: 1,
        usuarioId: 10,
      });

      expect(jugadorSinFecha.calcularEdad()).toBeNull();
    });
  });

  describe("Validaciones estáticas", () => {
    it("should validate numero dorsal range", () => {
      expect(Jugador.esNumeroDorsalValido(0)).toBe(true);
      expect(Jugador.esNumeroDorsalValido(50)).toBe(true);
      expect(Jugador.esNumeroDorsalValido(99)).toBe(true);
      expect(Jugador.esNumeroDorsalValido(-1)).toBe(false);
      expect(Jugador.esNumeroDorsalValido(100)).toBe(false);
    });

    it("should validate telefono format", () => {
      expect(Jugador.esTelefonoValido("+34666777888")).toBe(true);
      expect(Jugador.esTelefonoValido("+1234567890")).toBe(true);
      expect(Jugador.esTelefonoValido("666777888")).toBe(false);
      expect(Jugador.esTelefonoValido("invalid")).toBe(false);
      expect(Jugador.esTelefonoValido("+34abc")).toBe(false);
    });
  });

  describe("Conversión de datos", () => {
    it("should convert to plain object", () => {
      const jugador = new Jugador({
        id: 1,
        usuarioId: 10,
        numeroDorsal: 7,
        posicionId: 3,
        telefono: "+34666777888",
        fechaNacimiento: "1995-05-15",
        alias: "El Rayo",
      });

      const obj = jugador.toObject();

      expect(obj).toEqual({
        id: 1,
        usuarioId: 10,
        numeroDorsal: 7,
        posicionId: 3,
        telefono: "+34666777888",
        fechaNacimiento: "1995-05-15",
        alias: "El Rayo",
        fotoUrl: null,
        createdAt: expect.any(Date),
      });
    });

    it("should create from database data", () => {
      const dbData = {
        id: 1,
        usuario_id: 10,
        numero_dorsal: 7,
        posicion_id: 3,
        telefono: "+34666777888",
        fecha_nacimiento: "1995-05-15",
        alias: "El Rayo",
        foto_url: null,
        created_at: new Date(),
      };

      const jugador = Jugador.fromDatabase(dbData);

      expect(jugador.id).toBe(1);
      expect(jugador.usuarioId).toBe(10);
      expect(jugador.numeroDorsal).toBe(7);
      expect(jugador.posicionId).toBe(3);
    });
  });
});
