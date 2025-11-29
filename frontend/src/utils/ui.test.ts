import { describe, it, expect } from "vitest";
import { getEstadoBadgeClasses, getTipoEventoBadge } from "./ui";

describe("ui utils", () => {
  describe("getEstadoBadgeClasses", () => {
    it("debe retornar clases correctas para estado confirmado", () => {
      const classes = getEstadoBadgeClasses("confirmado");

      expect(classes.bg).toBe("bg-green-100");
      expect(classes.text).toBe("text-green-800");
      expect(classes.label).toBe("Confirmado");
    });

    it("debe retornar clases correctas para estado ausente", () => {
      const classes = getEstadoBadgeClasses("ausente");

      expect(classes.bg).toBe("bg-red-100");
      expect(classes.text).toBe("text-red-800");
      expect(classes.label).toBe("Ausente");
    });

    it("debe retornar clases correctas para estado pendiente", () => {
      const classes = getEstadoBadgeClasses("pendiente");

      expect(classes.bg).toBe("bg-yellow-100");
      expect(classes.text).toBe("text-yellow-800");
      expect(classes.label).toBe("Pendiente");
    });

    it("debe retornar clases por defecto para estado desconocido", () => {
      const classes = getEstadoBadgeClasses("desconocido" as any);

      expect(classes.bg).toBe("bg-gray-100");
      expect(classes.text).toBe("text-gray-800");
      expect(classes.label).toBe("Desconocido");
    });

    it("debe manejar undefined", () => {
      const classes = getEstadoBadgeClasses(undefined as any);

      expect(classes.bg).toBe("bg-gray-100");
      expect(classes.text).toBe("text-gray-800");
      expect(classes.label).toBe("Desconocido");
    });
  });

  describe("getTipoEventoBadge", () => {
    it("debe retornar clases correctas para entrenamiento", () => {
      const badge = getTipoEventoBadge("entrenamiento");

      expect(badge.bg).toBe("bg-blue-100");
      expect(badge.text).toBe("text-blue-800");
      expect(badge.label).toBe("Entrenamiento");
      expect(badge.icon).toBe("⚽");
    });

    it("debe retornar clases correctas para partido", () => {
      const badge = getTipoEventoBadge("partido");

      expect(badge.bg).toBe("bg-purple-100");
      expect(badge.text).toBe("text-purple-800");
      expect(badge.label).toBe("Partido");
      expect(badge.icon).toBe("🏆");
    });

    it("debe manejar tipo desconocido", () => {
      const badge = getTipoEventoBadge("desconocido" as any);

      expect(badge.bg).toBe("bg-gray-100");
      expect(badge.text).toBe("text-gray-800");
      expect(badge.label).toBe("Evento");
      expect(badge.icon).toBe("📅");
    });
  });

  describe("integración de badges", () => {
    it("debe combinar clases de estado y tipo correctamente", () => {
      const estadoClasses = getEstadoBadgeClasses("confirmado");
      const tipoClasses = getTipoEventoBadge("partido");

      expect(estadoClasses.bg).toBeTruthy();
      expect(estadoClasses.text).toBeTruthy();
      expect(tipoClasses.bg).toBeTruthy();
      expect(tipoClasses.text).toBeTruthy();

      // Verificar que son diferentes
      expect(estadoClasses.bg).not.toBe(tipoClasses.bg);
    });

    it("debe manejar todos los estados y tipos combinados", () => {
      const estados = ["confirmado", "ausente", "pendiente"];
      const tipos = ["entrenamiento", "partido"];

      estados.forEach((estado) => {
        tipos.forEach((tipo) => {
          const estadoBadge = getEstadoBadgeClasses(estado as any);
          const tipoBadge = getTipoEventoBadge(tipo as any);

          expect(estadoBadge.bg).toBeTruthy();
          expect(estadoBadge.text).toBeTruthy();
          expect(estadoBadge.label).toBeTruthy();

          expect(tipoBadge.bg).toBeTruthy();
          expect(tipoBadge.text).toBeTruthy();
          expect(tipoBadge.label).toBeTruthy();
          expect(tipoBadge.icon).toBeTruthy();
        });
      });
    });
  });
});
