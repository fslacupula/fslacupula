/**
 * Fixtures - Datos de prueba reutilizables
 */

export const usuarios = {
  jugador1: {
    id: 1,
    email: "jugador1@test.com",
    password: "$2b$10$abcdefghijklmnopqrstuvwxyz", // "password123" hasheado
    nombre: "Jugador Uno",
    rol: "jugador",
    activo: true,
    created_at: new Date("2025-01-01"),
  },
  jugador2: {
    id: 2,
    email: "jugador2@test.com",
    password: "$2b$10$abcdefghijklmnopqrstuvwxyz",
    nombre: "Jugador Dos",
    rol: "jugador",
    activo: true,
    created_at: new Date("2025-01-02"),
  },
  gestor1: {
    id: 10,
    email: "gestor@test.com",
    password: "$2b$10$abcdefghijklmnopqrstuvwxyz",
    nombre: "Gestor Principal",
    rol: "gestor",
    activo: true,
    created_at: new Date("2025-01-01"),
  },
  jugadorInactivo: {
    id: 99,
    email: "inactivo@test.com",
    password: "$2b$10$abcdefghijklmnopqrstuvwxyz",
    nombre: "Jugador Inactivo",
    rol: "jugador",
    activo: false,
    created_at: new Date("2025-01-01"),
  },
};

export const jugadores = {
  jugador1: {
    id: 1,
    usuario_id: 1,
    numero_dorsal: 10,
    posicion_id: 3,
    telefono: "+34666111222",
    fecha_nacimiento: "1995-06-15",
    alias: "El Crack",
    created_at: new Date("2025-01-01"),
  },
  jugador2: {
    id: 2,
    usuario_id: 2,
    numero_dorsal: 7,
    posicion_id: 4,
    telefono: "+34666333444",
    fecha_nacimiento: "1998-03-20",
    alias: "Speedy",
    created_at: new Date("2025-01-02"),
  },
};

export const posiciones = {
  portero: {
    id: 1,
    nombre: "Portero",
    abreviatura: "POR",
    color: "blue",
    orden: 1,
    activo: true,
  },
  cierre: {
    id: 2,
    nombre: "Cierre",
    abreviatura: "CIE",
    color: "blue",
    orden: 2,
    activo: true,
  },
  ala: {
    id: 3,
    nombre: "Ala",
    abreviatura: "ALA",
    color: "blue",
    orden: 3,
    activo: true,
  },
  pivot: {
    id: 4,
    nombre: "Pivot",
    abreviatura: "PIV",
    color: "blue",
    orden: 4,
    activo: true,
  },
};

export const partidos = {
  futuro: {
    id: 1,
    fecha_hora: new Date("2025-12-15T18:00:00Z"),
    rival: "Rival FC",
    lugar: "Pabellón Municipal",
    tipo: "liga",
    es_local: true,
    resultado: null,
    observaciones: null,
    creado_por: 10,
    created_at: new Date("2025-11-01"),
  },
  pasado: {
    id: 2,
    fecha_hora: new Date("2025-10-15T18:00:00Z"),
    rival: "Otro Equipo",
    lugar: "Pabellón Visitante",
    tipo: "amistoso",
    es_local: false,
    resultado: "3-2",
    observaciones: "Gran partido",
    creado_por: 10,
    created_at: new Date("2025-10-01"),
  },
};

export const entrenamientos = {
  futuro: {
    id: 1,
    fecha_hora: new Date("2025-12-10T19:00:00Z"),
    lugar: "Pabellón Municipal",
    descripcion: "Entrenamiento táctico",
    duracion_minutos: 90,
    creado_por: 10,
    created_at: new Date("2025-11-01"),
  },
  pasado: {
    id: 2,
    fecha_hora: new Date("2025-10-10T19:00:00Z"),
    lugar: "Pabellón Municipal",
    descripcion: "Entrenamiento físico",
    duracion_minutos: 60,
    creado_por: 10,
    created_at: new Date("2025-10-01"),
  },
};

export const motivosAusencia = {
  trabajo: {
    id: 1,
    motivo: "Trabajo",
    activo: true,
  },
  lesion: {
    id: 2,
    motivo: "Lesión",
    activo: true,
  },
  enfermedad: {
    id: 3,
    motivo: "Enfermedad",
    activo: true,
  },
  personal: {
    id: 4,
    motivo: "Personal",
    activo: true,
  },
};

export const asistenciasEntrenamientos = {
  confirmada: {
    id: 1,
    entrenamiento_id: 1,
    jugador_id: 1,
    estado: "confirmado",
    motivo_ausencia_id: null,
    comentario: null,
    fecha_respuesta: new Date("2025-11-05"),
  },
  ausente: {
    id: 2,
    entrenamiento_id: 1,
    jugador_id: 2,
    estado: "no_asiste",
    motivo_ausencia_id: 1,
    comentario: "Tengo que trabajar",
    fecha_respuesta: new Date("2025-11-06"),
  },
  pendiente: {
    id: 3,
    entrenamiento_id: 1,
    jugador_id: 99,
    estado: "pendiente",
    motivo_ausencia_id: null,
    comentario: null,
    fecha_respuesta: new Date("2025-11-01"),
  },
};

export const asistenciasPartidos = {
  confirmada: {
    id: 1,
    partido_id: 1,
    jugador_id: 1,
    estado: "confirmado",
    motivo_ausencia_id: null,
    comentario: null,
    fecha_respuesta: new Date("2025-11-05"),
  },
  ausente: {
    id: 2,
    partido_id: 1,
    jugador_id: 2,
    estado: "no_asiste",
    motivo_ausencia_id: 2,
    comentario: "Lesionado",
    fecha_respuesta: new Date("2025-11-06"),
  },
};

export default {
  usuarios,
  jugadores,
  posiciones,
  partidos,
  entrenamientos,
  motivosAusencia,
  asistenciasEntrenamientos,
  asistenciasPartidos,
};
