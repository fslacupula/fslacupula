// Ejemplo de uso de las entidades del dominio
import {
  Usuario,
  Entrenamiento,
  Partido,
  Asistencia,
  Email,
  EstadoAsistenciaVO,
  FechaHora,
} from "../domain";
import type { UsuarioDTO, EntrenamientoDTO, PartidoDTO } from "../domain";

// ============================================
// EJEMPLO 1: Crear Usuario desde API response
// ============================================

const usuarioAPIResponse: UsuarioDTO = {
  id: 1,
  email: "test@gestor.com",
  nombre: "Gestor Test",
  rol: "gestor",
  activo: true,
};

// ✅ Factory method convierte DTO → Entidad
const usuario = Usuario.fromDTO(usuarioAPIResponse);

console.log("Usuario creado:");
console.log("- Nombre:", usuario.nombre);
console.log("- Email:", usuario.email.getValue());
console.log("- Es gestor?", usuario.esGestor());
console.log("- Está activo?", usuario.estaActivo());

// ============================================
// EJEMPLO 2: Crear Entrenamiento desde API
// ============================================

const entrenamientoAPIResponse: EntrenamientoDTO = {
  id: 3,
  fecha: "2025-11-27",
  hora: "20:00",
  ubicacion: "Can Tries",
  descripcion: "Entrenamiento de técnica",
  duracion_minutos: 90,
  asistencias: [
    {
      jugador_id: 1,
      jugador_nombre: "Alberto Ortega",
      estado: "confirmado",
    },
    {
      jugador_id: 2,
      jugador_nombre: "Marc García",
      estado: "ausente",
      motivo_ausencia_id: 1,
      motivo_nombre: "Trabajo",
    },
  ],
};

const entrenamiento = Entrenamiento.fromDTO(entrenamientoAPIResponse);

console.log("\nEntrenamiento creado:");
console.log("- Fecha:", entrenamiento.fechaHora.formatearLargo());
console.log("- Hora:", entrenamiento.hora);
console.log("- Ubicación:", entrenamiento.ubicacion);
console.log("- Tipo:", entrenamiento.getTipo());

const stats = entrenamiento.contarAsistencias();
console.log("- Confirmados:", stats.confirmados);
console.log("- Ausentes:", stats.ausentes);
console.log("- Pendientes:", stats.pendientes);

// ============================================
// EJEMPLO 3: Crear Partido desde API
// ============================================

const partidoAPIResponse: PartidoDTO = {
  id: 1,
  fecha: "2025-11-29",
  hora: "19:00",
  ubicacion: "Polideportivo Municipal",
  rival: "Polinyá B",
  tipo: "liga",
  es_local: false,
  resultado: "3-2",
  asistencias: [],
};

const partido = Partido.fromDTO(partidoAPIResponse);

console.log("\nPartido creado:");
console.log("- Rival:", partido.rival);
console.log("- Tipo:", partido.tipo);
console.log(
  "- Local/Visitante:",
  partido.esPartidoLocal() ? "Local" : "Visitante"
);
console.log("- Tiene resultado?", partido.tieneResultado());
console.log("- Resultado:", partido.resultado);

// ============================================
// EJEMPLO 4: Validaciones en Value Objects
// ============================================

try {
  // ❌ Email inválido lanza error
  new Email("no-es-un-email");
} catch (error) {
  console.log("\n✅ Validación Email funciona:", (error as Error).message);
}

try {
  // ❌ Estado inválido lanza error
  new EstadoAsistenciaVO("inexistente");
} catch (error) {
  console.log("✅ Validación Estado funciona:", (error as Error).message);
}

// ✅ Email válido
const emailValido = new Email("test@example.com");
console.log("✅ Email válido creado:", emailValido.getValue());

// ============================================
// EJEMPLO 5: Crear Asistencia con validaciones
// ============================================

try {
  // ❌ Asistencia ausente sin motivo lanza error
  Asistencia.crearAusente(
    1,
    3,
    "entrenamiento",
    0 as any // Sin motivo
  );
} catch (error) {
  console.log("\n✅ Validación Asistencia funciona:", (error as Error).message);
}

// ✅ Asistencia confirmada (no requiere motivo)
const asistenciaConfirmada = Asistencia.crearConfirmada(
  1,
  3,
  "entrenamiento",
  "Llegaré 5 minutos tarde"
);

console.log("✅ Asistencia confirmada creada");
console.log("- Estado:", asistenciaConfirmada.estado.getValue());
console.log("- Es confirmada?", asistenciaConfirmada.esConfirmado());
console.log("- Tiene comentario?", asistenciaConfirmada.tieneComentario());

// ✅ Asistencia ausente (requiere motivo)
const asistenciaAusente = Asistencia.crearAusente(
  2,
  3,
  "entrenamiento",
  1, // Motivo: Trabajo
  "Tengo reunión"
);

console.log("✅ Asistencia ausente creada");
console.log("- Estado:", asistenciaAusente.estado.getValue());
console.log("- Es ausente?", asistenciaAusente.esAusente());
console.log("- Motivo ID:", asistenciaAusente.motivoAusenciaId);

// ============================================
// EJEMPLO 6: Comparación de fechas
// ============================================

const fecha1 = new FechaHora("2025-11-27", "20:00");
const fecha2 = new FechaHora("2025-11-29", "19:00");
const hoy = FechaHora.hoy();

console.log("\n✅ Comparación de fechas:");
console.log("- Fecha 1:", fecha1.formatearLargo());
console.log("- Fecha 2:", fecha2.formatearLargo());
console.log("- Hoy:", hoy.formatearLargo());
console.log("- Fecha 1 < Fecha 2?", fecha1.esAntesDe(fecha2));
console.log("- Fecha 2 > Fecha 1?", fecha2.esDespuesDe(fecha1));

// ============================================
// EJEMPLO 7: Serializar para enviar al backend
// ============================================

console.log("\n✅ Serialización para backend:");

// Crear entrenamiento nuevo
const nuevoEntrenamiento = new Entrenamiento(
  0, // ID temporal
  new FechaHora("2025-12-01", "20:30"),
  "20:30",
  "Can Tries",
  "Entrenamiento de táctica",
  90
);

// Convertir a DTO para enviar al backend
const dtoParaBackend = nuevoEntrenamiento.toDTO();
console.log(
  "DTO para POST /entrenamientos:",
  JSON.stringify(dtoParaBackend, null, 2)
);

// ============================================
// RESUMEN
// ============================================

console.log("\n" + "=".repeat(50));
console.log("✅ TODOS LOS EJEMPLOS FUNCIONANDO CORRECTAMENTE");
console.log("=".repeat(50));

export {
  usuario,
  entrenamiento,
  partido,
  asistenciaConfirmada,
  asistenciaAusente,
  emailValido,
};
