import { describe, test, expect } from "@jest/globals";
import { EstadoAsistencia } from "../../../../src/domain/valueObjects/EstadoAsistencia.js";
import { ValidationError } from "../../../../src/domain/errors/index.js";

describe("EstadoAsistencia Value Object", () => {
  describe("Creación exitosa", () => {
    test("debería crear estado PENDIENTE", () => {
      const estado = new EstadoAsistencia("pendiente");
      expect(estado.getValue()).toBe("pendiente");
    });

    test("debería crear estado CONFIRMADO", () => {
      const estado = new EstadoAsistencia("confirmado");
      expect(estado.getValue()).toBe("confirmado");
    });

    test("debería crear estado NO_ASISTE", () => {
      const estado = new EstadoAsistencia("no_asiste");
      expect(estado.getValue()).toBe("no_asiste");
    });

    test("debería normalizar a minúsculas", () => {
      const estado = new EstadoAsistencia("CONFIRMADO");
      expect(estado.getValue()).toBe("confirmado");
    });

    test("debería eliminar espacios en blanco", () => {
      const estado = new EstadoAsistencia("  pendiente  ");
      expect(estado.getValue()).toBe("pendiente");
    });

    test("debería aceptar mayúsculas y minúsculas mezcladas", () => {
      const estado = new EstadoAsistencia("CoNfIrMaDo");
      expect(estado.getValue()).toBe("confirmado");
    });
  });

  describe("Validaciones", () => {
    test("debería lanzar error si el estado es null", () => {
      expect(() => new EstadoAsistencia(null)).toThrow(ValidationError);
      expect(() => new EstadoAsistencia(null)).toThrow(
        "El estado de asistencia es requerido"
      );
    });

    test("debería lanzar error si el estado es undefined", () => {
      expect(() => new EstadoAsistencia(undefined)).toThrow(ValidationError);
    });

    test("debería lanzar error si el estado está vacío", () => {
      expect(() => new EstadoAsistencia("")).toThrow(ValidationError);
    });

    test("debería lanzar error con estado inválido", () => {
      expect(() => new EstadoAsistencia("ausente")).toThrow(ValidationError);
      expect(() => new EstadoAsistencia("ausente")).toThrow("no es válido");
    });

    test("debería lanzar error con estado aleatorio", () => {
      expect(() => new EstadoAsistencia("cualquier_cosa")).toThrow(
        ValidationError
      );
    });

    test("debería lanzar error si no es un string", () => {
      expect(() => new EstadoAsistencia(123)).toThrow(ValidationError);
      expect(() => new EstadoAsistencia({})).toThrow(ValidationError);
      expect(() => new EstadoAsistencia([])).toThrow(ValidationError);
    });

    test("mensaje de error debería incluir estados válidos", () => {
      try {
        new EstadoAsistencia("invalido");
      } catch (error) {
        expect(error.message).toContain("pendiente");
        expect(error.message).toContain("confirmado");
        expect(error.message).toContain("no_asiste");
      }
    });
  });

  describe("Métodos de verificación", () => {
    test("esPendiente debería identificar estado pendiente", () => {
      const pendiente = new EstadoAsistencia("pendiente");
      const confirmado = new EstadoAsistencia("confirmado");

      expect(pendiente.esPendiente()).toBe(true);
      expect(confirmado.esPendiente()).toBe(false);
    });

    test("esConfirmado debería identificar estado confirmado", () => {
      const confirmado = new EstadoAsistencia("confirmado");
      const pendiente = new EstadoAsistencia("pendiente");

      expect(confirmado.esConfirmado()).toBe(true);
      expect(pendiente.esConfirmado()).toBe(false);
    });

    test("esNoAsiste debería identificar estado no_asiste", () => {
      const noAsiste = new EstadoAsistencia("no_asiste");
      const confirmado = new EstadoAsistencia("confirmado");

      expect(noAsiste.esNoAsiste()).toBe(true);
      expect(confirmado.esNoAsiste()).toBe(false);
    });

    test("tieneRespuesta debería ser false solo para pendiente", () => {
      const pendiente = new EstadoAsistencia("pendiente");
      const confirmado = new EstadoAsistencia("confirmado");
      const noAsiste = new EstadoAsistencia("no_asiste");

      expect(pendiente.tieneRespuesta()).toBe(false);
      expect(confirmado.tieneRespuesta()).toBe(true);
      expect(noAsiste.tieneRespuesta()).toBe(true);
    });
  });

  describe("Métodos de presentación", () => {
    test("getColor debería retornar color apropiado", () => {
      const pendiente = new EstadoAsistencia("pendiente");
      const confirmado = new EstadoAsistencia("confirmado");
      const noAsiste = new EstadoAsistencia("no_asiste");

      expect(pendiente.getColor()).toBe("gray");
      expect(confirmado.getColor()).toBe("green");
      expect(noAsiste.getColor()).toBe("red");
    });

    test("getLabel debería retornar etiqueta legible", () => {
      const pendiente = new EstadoAsistencia("pendiente");
      const confirmado = new EstadoAsistencia("confirmado");
      const noAsiste = new EstadoAsistencia("no_asiste");

      expect(pendiente.getLabel()).toBe("Pendiente");
      expect(confirmado.getLabel()).toBe("Confirmado");
      expect(noAsiste.getLabel()).toBe("No asiste");
    });
  });

  describe("Comparaciones", () => {
    test("equals debería comparar estados iguales", () => {
      const estado1 = new EstadoAsistencia("confirmado");
      const estado2 = new EstadoAsistencia("confirmado");
      expect(estado1.equals(estado2)).toBe(true);
    });

    test("equals debería comparar estados diferentes", () => {
      const estado1 = new EstadoAsistencia("confirmado");
      const estado2 = new EstadoAsistencia("pendiente");
      expect(estado1.equals(estado2)).toBe(false);
    });

    test("equals debería normalizar antes de comparar", () => {
      const estado1 = new EstadoAsistencia("CONFIRMADO");
      const estado2 = new EstadoAsistencia("confirmado");
      expect(estado1.equals(estado2)).toBe(true);
    });

    test("equals debería retornar false si no es EstadoAsistencia", () => {
      const estado = new EstadoAsistencia("confirmado");
      expect(estado.equals("confirmado")).toBe(false);
      expect(estado.equals(null)).toBe(false);
    });
  });

  describe("Serialización", () => {
    test("toString debería retornar el valor", () => {
      const estado = new EstadoAsistencia("confirmado");
      expect(estado.toString()).toBe("confirmado");
    });

    test("toJSON debería retornar el valor", () => {
      const estado = new EstadoAsistencia("confirmado");
      expect(estado.toJSON()).toBe("confirmado");
      expect(JSON.stringify({ estado })).toBe('{"estado":"confirmado"}');
    });
  });

  describe("Inmutabilidad", () => {
    test("debería ser inmutable", () => {
      const estado = new EstadoAsistencia("confirmado");
      expect(() => {
        estado.value = "pendiente";
      }).toThrow();
    });

    test("debería estar congelado", () => {
      const estado = new EstadoAsistencia("confirmado");
      expect(Object.isFrozen(estado)).toBe(true);
    });
  });

  describe("Método estático esValido", () => {
    test("debería validar estados correctos", () => {
      expect(EstadoAsistencia.esValido("pendiente")).toBe(true);
      expect(EstadoAsistencia.esValido("confirmado")).toBe(true);
      expect(EstadoAsistencia.esValido("no_asiste")).toBe(true);
    });

    test("debería validar con mayúsculas", () => {
      expect(EstadoAsistencia.esValido("PENDIENTE")).toBe(true);
      expect(EstadoAsistencia.esValido("Confirmado")).toBe(true);
    });

    test("debería rechazar estados inválidos", () => {
      expect(EstadoAsistencia.esValido("ausente")).toBe(false);
      expect(EstadoAsistencia.esValido("presente")).toBe(false);
      expect(EstadoAsistencia.esValido("")).toBe(false);
    });

    test("debería rechazar valores no string", () => {
      expect(EstadoAsistencia.esValido(null)).toBe(false);
      expect(EstadoAsistencia.esValido(undefined)).toBe(false);
      expect(EstadoAsistencia.esValido(123)).toBe(false);
    });
  });

  describe("Método estático getEstadosValidos", () => {
    test("debería retornar todos los estados válidos", () => {
      const estados = EstadoAsistencia.getEstadosValidos();
      expect(estados).toContain("pendiente");
      expect(estados).toContain("confirmado");
      expect(estados).toContain("no_asiste");
      expect(estados.length).toBe(3);
    });

    test("debería retornar una copia del array", () => {
      const estados1 = EstadoAsistencia.getEstadosValidos();
      const estados2 = EstadoAsistencia.getEstadosValidos();
      expect(estados1).not.toBe(estados2);
      expect(estados1).toEqual(estados2);
    });
  });

  describe("Factory methods", () => {
    test("pendiente() debería crear estado PENDIENTE", () => {
      const estado = EstadoAsistencia.pendiente();
      expect(estado).toBeInstanceOf(EstadoAsistencia);
      expect(estado.getValue()).toBe("pendiente");
      expect(estado.esPendiente()).toBe(true);
    });

    test("confirmado() debería crear estado CONFIRMADO", () => {
      const estado = EstadoAsistencia.confirmado();
      expect(estado).toBeInstanceOf(EstadoAsistencia);
      expect(estado.getValue()).toBe("confirmado");
      expect(estado.esConfirmado()).toBe(true);
    });

    test("noAsiste() debería crear estado NO_ASISTE", () => {
      const estado = EstadoAsistencia.noAsiste();
      expect(estado).toBeInstanceOf(EstadoAsistencia);
      expect(estado.getValue()).toBe("no_asiste");
      expect(estado.esNoAsiste()).toBe(true);
    });
  });

  describe("Constantes de clase", () => {
    test("debería tener constante PENDIENTE", () => {
      expect(EstadoAsistencia.PENDIENTE).toBe("pendiente");
    });

    test("debería tener constante CONFIRMADO", () => {
      expect(EstadoAsistencia.CONFIRMADO).toBe("confirmado");
    });

    test("debería tener constante NO_ASISTE", () => {
      expect(EstadoAsistencia.NO_ASISTE).toBe("no_asiste");
    });

    test("las constantes deberían funcionar en el constructor", () => {
      const estado = new EstadoAsistencia(EstadoAsistencia.CONFIRMADO);
      expect(estado.esConfirmado()).toBe(true);
    });
  });
});
