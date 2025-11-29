# Análisis: Sistema de Estadísticas de Partido en Tiempo Real

## 📋 Resumen Ejecutivo

Este documento analiza los datos que se están capturando en el componente `ConfigurarPartido.jsx` y propone una estructura de base de datos para almacenar todas las estadísticas de un partido en tiempo real, incluyendo el botón "Finalizar Partido".

---

## 🎯 Datos Capturados Actualmente

### 1. **Estado del Componente (React State)**

#### Variables principales:

```javascript
// Jugadores y Staff
- jugadores: []                    // Lista de jugadores del equipo local
- staff: { ENT, DEL, AUX, MAT }   // Personal técnico
- jugadoresAsignados: {}           // Jugadores actualmente en pista (5 posiciones)

// Marcador y Estadísticas Globales
- golesLocal: 0
- golesVisitante: 0
- faltasLocal: 0
- faltasVisitante: 0
- cronometroActivo: false

// Estadísticas por Jugador
- estadisticas: {
    [jugadorId]: {
      goles: 0,
      asistencias: 0,
      paradas: 0,
      faltas: 0,
      amarillas: 0,
      rojas: 0,
      minutos: 0,
      minutosAcumulados: 0  // Para acumular tiempo cuando se pausa
    }
  }

// Control de Tiempos
- tiemposEntrada: {}              // Timestamp de entrada a pista por jugador
- tiemposSalida: {}               // Timestamp de salida de pista por jugador

// Historial de Acciones
- historialAcciones: [
    {
      id: timestamp,
      jugadorId: id,
      jugadorNombre: string,
      dorsal: number,
      accion: "gol|falta|amarilla|roja|asistencia|parada",
      timestamp: ISOString,
      equipo: "local|visitante"
    }
  ]

// Dorsales Visitantes (localStorage)
- dorsalesVisitantes: { [numero]: "dorsal_personalizado" }

// Información del Partido
- partidoId: string/number
- partidoInfo: {
    id, fecha_hora, rival, lugar, tipo, es_local,
    resultado, observaciones, asistencias[]
  }
```

### 2. **Datos en LocalStorage**

```javascript
- partidoActualId: string                           // ID del partido actual
- dorsalesVisitantes_partido_{id}: JSON             // Dorsales personalizados del rival
```

---

## 🗄️ Estructura de Base de Datos Propuesta

### **Tablas Nuevas a Crear**

#### 1. **`estadisticas_partidos`**

Tabla principal para almacenar las estadísticas de cada partido finalizado.

```sql
CREATE TABLE estadisticas_partidos (
  id SERIAL PRIMARY KEY,
  partido_id INTEGER NOT NULL REFERENCES partidos(id) ON DELETE CASCADE,

  -- Marcador Final
  goles_local INTEGER DEFAULT 0,
  goles_visitante INTEGER DEFAULT 0,

  -- Faltas de Equipo
  faltas_local INTEGER DEFAULT 0,
  faltas_visitante INTEGER DEFAULT 0,

  -- Datos del Rival
  rival_nombre VARCHAR(255),
  dorsales_visitantes JSONB,  -- {1: "5", 2: "10", ...}

  -- Metadata
  duracion_minutos INTEGER,           -- Tiempo total del partido
  fecha_finalizacion TIMESTAMPTZ,     -- Cuándo se finalizó
  finalizado_por INTEGER REFERENCES usuarios(id),

  -- Observaciones
  observaciones TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Índices
  UNIQUE(partido_id)
);

CREATE INDEX idx_estadisticas_partido_id ON estadisticas_partidos(partido_id);
CREATE INDEX idx_estadisticas_fecha_finalizacion ON estadisticas_partidos(fecha_finalizacion);
```

#### 2. **`estadisticas_jugadores_partido`**

Estadísticas individuales de cada jugador en un partido específico.

```sql
CREATE TABLE estadisticas_jugadores_partido (
  id SERIAL PRIMARY KEY,
  partido_id INTEGER NOT NULL REFERENCES partidos(id) ON DELETE CASCADE,
  jugador_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,

  -- Tipo de participación
  equipo VARCHAR(20) NOT NULL DEFAULT 'local',  -- 'local' o 'visitante'
  dorsal VARCHAR(10),                            -- Dorsal usado en el partido

  -- Tiempo de Juego
  minutos_jugados INTEGER DEFAULT 0,             -- En segundos

  -- Goles y Asistencias
  goles INTEGER DEFAULT 0,
  asistencias INTEGER DEFAULT 0,
  paradas INTEGER DEFAULT 0,                     -- Para porteros

  -- Disciplina
  faltas INTEGER DEFAULT 0,
  tarjetas_amarillas INTEGER DEFAULT 0,
  tarjetas_rojas INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Restricción única
  UNIQUE(partido_id, jugador_id)
);

CREATE INDEX idx_estadisticas_jugadores_partido ON estadisticas_jugadores_partido(partido_id);
CREATE INDEX idx_estadisticas_jugadores_jugador ON estadisticas_jugadores_partido(jugador_id);
```

#### 3. **`historial_acciones_partido`**

Registro cronológico de todas las acciones del partido (para auditoría y replay).

```sql
CREATE TABLE historial_acciones_partido (
  id SERIAL PRIMARY KEY,
  partido_id INTEGER NOT NULL REFERENCES partidos(id) ON DELETE CASCADE,
  jugador_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,

  -- Datos de la Acción
  accion VARCHAR(50) NOT NULL,                  -- 'gol', 'falta', 'amarilla', 'roja', 'asistencia', 'parada'
  equipo VARCHAR(20) NOT NULL,                  -- 'local' o 'visitante'
  dorsal VARCHAR(10),
  jugador_nombre VARCHAR(100),

  -- Timestamp de la Acción
  timestamp TIMESTAMPTZ NOT NULL,
  minuto_partido INTEGER,                       -- Minuto del partido en que ocurrió

  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Orden de las acciones
  orden_accion INTEGER
);

CREATE INDEX idx_historial_partido ON historial_acciones_partido(partido_id);
CREATE INDEX idx_historial_timestamp ON historial_acciones_partido(timestamp);
CREATE INDEX idx_historial_jugador ON historial_acciones_partido(jugador_id);
```

#### 4. **`tiempos_juego_partido`** (Opcional - para análisis avanzado)

Registro detallado de entrada/salida de jugadores.

```sql
CREATE TABLE tiempos_juego_partido (
  id SERIAL PRIMARY KEY,
  partido_id INTEGER NOT NULL REFERENCES partidos(id) ON DELETE CASCADE,
  jugador_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,

  -- Control de Tiempo
  timestamp_entrada TIMESTAMPTZ NOT NULL,
  timestamp_salida TIMESTAMPTZ,

  -- Posición en la que jugó
  posicion VARCHAR(50),                         -- 'portero', 'cierre', 'alaSuperior', 'alaInferior', 'pivote'

  -- Duración calculada
  duracion_segundos INTEGER,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tiempos_partido ON tiempos_juego_partido(partido_id);
CREATE INDEX idx_tiempos_jugador ON tiempos_juego_partido(jugador_id);
```

#### 5. **`staff_partido`** (Nuevo)

Para registrar tarjetas al staff técnico.

```sql
CREATE TABLE staff_partido (
  id SERIAL PRIMARY KEY,
  partido_id INTEGER NOT NULL REFERENCES partidos(id) ON DELETE CASCADE,

  -- Identificación del staff
  tipo_staff VARCHAR(50) NOT NULL,              -- 'ENT', 'DEL', 'AUX', 'MAT', o visitante equivalente
  nombre VARCHAR(100),
  equipo VARCHAR(20) NOT NULL DEFAULT 'local',  -- 'local' o 'visitante'

  -- Tarjetas
  tarjetas_amarillas INTEGER DEFAULT 0,
  tarjetas_rojas INTEGER DEFAULT 0,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_staff_partido ON staff_partido(partido_id);
```

---

## 🔄 Modificaciones a Tablas Existentes

### **Tabla `partidos`**

Ya existe, solo necesitamos asegurarnos de que se actualice el resultado al finalizar:

```sql
-- Agregar campo si no existe
ALTER TABLE partidos
ADD COLUMN IF NOT EXISTS estado VARCHAR(20) DEFAULT 'pendiente';
-- Valores posibles: 'pendiente', 'en_curso', 'finalizado', 'cancelado'

-- Comentario sobre el campo resultado
COMMENT ON COLUMN partidos.resultado IS 'Formato: "goles_local-goles_visitante" ej: "5-3"';
```

---

## 📡 API Endpoints Necesarios

### **Backend - Nuevos Endpoints**

#### 1. **POST `/api/partidos/:id/finalizar`**

Finaliza el partido y guarda todas las estadísticas.

**Request Body:**

```json
{
  "estadisticas": {
    "golesLocal": 5,
    "golesVisitante": 3,
    "faltasLocal": 4,
    "faltasVisitante": 2,
    "dorsalesVisitantes": {
      "1": "12",
      "2": "7",
      "3": "9"
    },
    "duracionMinutos": 50
  },
  "jugadores": [
    {
      "jugadorId": 1,
      "equipo": "local",
      "dorsal": "5",
      "minutosJugados": 3000,
      "goles": 2,
      "asistencias": 1,
      "paradas": 0,
      "faltas": 1,
      "amarillas": 0,
      "rojas": 0
    }
  ],
  "staff": [
    {
      "tipoStaff": "ENT",
      "nombre": "Entrenador",
      "equipo": "local",
      "amarillas": 1,
      "rojas": 0
    }
  ],
  "historialAcciones": [
    {
      "jugadorId": 1,
      "jugadorNombre": "Juan Pérez",
      "dorsal": "5",
      "accion": "gol",
      "timestamp": "2024-01-15T20:30:00Z",
      "equipo": "local",
      "minutoPartido": 15
    }
  ],
  "tiemposJuego": [
    {
      "jugadorId": 1,
      "timestampEntrada": "2024-01-15T20:00:00Z",
      "timestampSalida": "2024-01-15T20:25:00Z",
      "posicion": "pivote",
      "duracionSegundos": 1500
    }
  ]
}
```

**Response:**

```json
{
  "message": "Partido finalizado correctamente",
  "partido": {
    "id": 1,
    "resultado": "5-3",
    "estado": "finalizado"
  },
  "estadisticasId": 1
}
```

#### 2. **GET `/api/partidos/:id/estadisticas`**

Obtiene las estadísticas de un partido finalizado.

**Response:**

```json
{
  "estadisticas": {
    "id": 1,
    "partidoId": 1,
    "golesLocal": 5,
    "golesVisitante": 3,
    "faltasLocal": 4,
    "faltasVisitante": 2,
    "duracionMinutos": 50,
    "fechaFinalizacion": "2024-01-15T21:00:00Z"
  },
  "jugadores": [...],
  "staff": [...],
  "historial": [...]
}
```

---

## 🎨 Frontend - Cambios Necesarios

### **1. Botón "Finalizar Partido"**

Agregar al final del componente `ConfigurarPartido.jsx`:

```jsx
{
  /* Botón Finalizar Partido */
}
<div className="bg-white rounded-lg shadow-md p-6 mb-4">
  <button
    onClick={handleFinalizarPartido}
    disabled={!partidoId || historialAcciones.length === 0}
    className="w-full px-6 py-4 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold text-xl rounded-lg shadow-lg transition-all hover:scale-105 flex items-center justify-center gap-3"
  >
    <svg
      className="w-8 h-8"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
    FINALIZAR PARTIDO
  </button>

  {!partidoId && (
    <p className="text-sm text-red-500 mt-2 text-center">
      No hay partido activo
    </p>
  )}
  {partidoId && historialAcciones.length === 0 && (
    <p className="text-sm text-yellow-600 mt-2 text-center">
      No hay estadísticas registradas todavía
    </p>
  )}
</div>;
```

### **2. Función `handleFinalizarPartido`**

```javascript
const handleFinalizarPartido = async () => {
  if (!partidoId) {
    alert("No hay partido activo");
    return;
  }

  const confirmar = window.confirm(
    `¿Estás seguro de finalizar el partido?\n\n` +
      `Resultado: ${golesLocal} - ${golesVisitante}\n` +
      `Faltas: Local ${faltasLocal}, Visitante ${faltasVisitante}\n` +
      `Total acciones: ${historialAcciones.length}\n\n` +
      `Esta acción guardará todas las estadísticas en la base de datos.`
  );

  if (!confirmar) return;

  try {
    // Preparar datos para enviar
    const datosPartido = {
      estadisticas: {
        golesLocal,
        golesVisitante,
        faltasLocal,
        faltasVisitante,
        dorsalesVisitantes,
        duracionMinutos: 50, // O calculado desde cronómetro
      },
      jugadores: prepararEstadisticasJugadores(),
      staff: prepararEstadisticasStaff(),
      historialAcciones: prepararHistorialAcciones(),
      tiemposJuego: prepararTiemposJuego(),
    };

    // Enviar a la API
    const response = await partidos.finalizarPartido(partidoId, datosPartido);

    alert("¡Partido finalizado exitosamente!");

    // Limpiar localStorage
    localStorage.removeItem("partidoActualId");
    localStorage.removeItem(`dorsalesVisitantes_partido_${partidoId}`);

    // Redirigir al dashboard o a la página del partido
    navigate(`/partidos/${partidoId}/estadisticas`);
  } catch (error) {
    console.error("Error al finalizar partido:", error);
    alert("Error al finalizar el partido. Por favor, intenta de nuevo.");
  }
};

// Funciones auxiliares para preparar datos
const prepararEstadisticasJugadores = () => {
  const jugadoresStats = [];

  // Jugadores locales
  jugadores.forEach((jugador) => {
    const stats = estadisticas[jugador.id];
    if (stats) {
      jugadoresStats.push({
        jugadorId: jugador.id,
        equipo: "local",
        dorsal: jugador.numero_dorsal,
        minutosJugados: Math.floor(stats.minutos || 0),
        goles: stats.goles || 0,
        asistencias: stats.asistencias || 0,
        paradas: stats.paradas || 0,
        faltas: stats.faltas || 0,
        amarillas: stats.amarillas || 0,
        rojas: stats.rojas || 0,
      });
    }
  });

  // Jugadores visitantes (si tienen estadísticas)
  Object.keys(estadisticas).forEach((jugadorId) => {
    if (jugadorId.startsWith("visitante-")) {
      const stats = estadisticas[jugadorId];
      const numero = jugadorId.split("-")[1];
      jugadoresStats.push({
        jugadorId: null, // No hay ID real
        equipo: "visitante",
        dorsal: obtenerDorsalVisitante(parseInt(numero)),
        minutosJugados: 0, // Visitantes no se rastrean en pista
        goles: stats.goles || 0,
        asistencias: stats.asistencias || 0,
        paradas: stats.paradas || 0,
        faltas: stats.faltas || 0,
        amarillas: stats.amarillas || 0,
        rojas: stats.rojas || 0,
      });
    }
  });

  return jugadoresStats;
};

const prepararEstadisticasStaff = () => {
  const staffStats = [];
  const staffIds = [
    "staff-E",
    "staff-D",
    "staff-A",
    "staff-visitante-E",
    "staff-visitante-D",
    "staff-visitante-A",
  ];

  staffIds.forEach((id) => {
    if (estadisticas[id]) {
      const stats = estadisticas[id];
      staffStats.push({
        tipoStaff: id.split("-")[id.startsWith("staff-visitante") ? 2 : 1],
        nombre: getNombreStaff(id),
        equipo: id.includes("visitante") ? "visitante" : "local",
        amarillas: stats.amarillas || 0,
        rojas: stats.rojas || 0,
      });
    }
  });

  return staffStats;
};

const prepararHistorialAcciones = () => {
  return historialAcciones.map((accion, index) => ({
    ...accion,
    ordenAccion: index + 1,
    minutoPartido: calcularMinutoPartido(accion.timestamp),
  }));
};

const prepararTiemposJuego = () => {
  const tiempos = [];
  // Aquí necesitarías implementar el tracking completo de entradas/salidas
  // Por ahora, retornamos array vacío o implementación básica
  return tiempos;
};

const calcularMinutoPartido = (timestamp) => {
  // Calcular el minuto del partido basado en el timestamp
  // Esto requeriría tener un timestamp de inicio del partido
  return 0; // Implementar lógica
};

const getNombreStaff = (id) => {
  const nombres = {
    E: "Entrenador",
    D: "Delegado",
    A: "Auxiliar",
  };
  const tipo = id.split("-")[id.startsWith("staff-visitante") ? 2 : 1];
  const esVisitante = id.includes("visitante");
  return nombres[tipo] + (esVisitante ? " Visitante" : "");
};
```

### **3. Agregar endpoint en `api.js`**

```javascript
export const partidos = {
  // ... endpoints existentes

  finalizarPartido: (id, data) => api.post(`/partidos/${id}/finalizar`, data),

  obtenerEstadisticas: (id) => api.get(`/partidos/${id}/estadisticas`),
};
```

---

## 🛠️ Backend - Implementación del Controller

### **partidoController.js**

```javascript
export const finalizarPartido = async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const { id } = req.params;
    const { estadisticas, jugadores, staff, historialAcciones, tiemposJuego } =
      req.body;

    // 1. Actualizar estado del partido
    const resultado = `${estadisticas.golesLocal}-${estadisticas.golesVisitante}`;
    await client.query(
      `UPDATE partidos 
       SET resultado = $1, estado = 'finalizado' 
       WHERE id = $2`,
      [resultado, id]
    );

    // 2. Insertar estadísticas generales del partido
    const statsResult = await client.query(
      `INSERT INTO estadisticas_partidos 
       (partido_id, goles_local, goles_visitante, faltas_local, faltas_visitante, 
        dorsales_visitantes, duracion_minutos, fecha_finalizacion, finalizado_por)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), $8)
       RETURNING id`,
      [
        id,
        estadisticas.golesLocal,
        estadisticas.golesVisitante,
        estadisticas.faltasLocal,
        estadisticas.faltasVisitante,
        JSON.stringify(estadisticas.dorsalesVisitantes || {}),
        estadisticas.duracionMinutos,
        req.user.id,
      ]
    );

    // 3. Insertar estadísticas de jugadores
    for (const jugador of jugadores) {
      await client.query(
        `INSERT INTO estadisticas_jugadores_partido 
         (partido_id, jugador_id, equipo, dorsal, minutos_jugados, goles, 
          asistencias, paradas, faltas, tarjetas_amarillas, tarjetas_rojas)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          id,
          jugador.jugadorId,
          jugador.equipo,
          jugador.dorsal,
          jugador.minutosJugados,
          jugador.goles,
          jugador.asistencias,
          jugador.paradas,
          jugador.faltas,
          jugador.amarillas,
          jugador.rojas,
        ]
      );
    }

    // 4. Insertar estadísticas del staff
    for (const s of staff) {
      await client.query(
        `INSERT INTO staff_partido 
         (partido_id, tipo_staff, nombre, equipo, tarjetas_amarillas, tarjetas_rojas)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [id, s.tipoStaff, s.nombre, s.equipo, s.amarillas, s.rojas]
      );
    }

    // 5. Insertar historial de acciones
    for (const accion of historialAcciones) {
      await client.query(
        `INSERT INTO historial_acciones_partido 
         (partido_id, jugador_id, accion, equipo, dorsal, jugador_nombre, 
          timestamp, minuto_partido, orden_accion)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          id,
          accion.jugadorId,
          accion.accion,
          accion.equipo,
          accion.dorsal,
          accion.jugadorNombre,
          accion.timestamp,
          accion.minutoPartido,
          accion.ordenAccion,
        ]
      );
    }

    // 6. Insertar tiempos de juego (opcional)
    if (tiemposJuego && tiemposJuego.length > 0) {
      for (const tiempo of tiemposJuego) {
        await client.query(
          `INSERT INTO tiempos_juego_partido 
           (partido_id, jugador_id, timestamp_entrada, timestamp_salida, 
            posicion, duracion_segundos)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            id,
            tiempo.jugadorId,
            tiempo.timestampEntrada,
            tiempo.timestampSalida,
            tiempo.posicion,
            tiempo.duracionSegundos,
          ]
        );
      }
    }

    await client.query("COMMIT");

    res.json({
      message: "Partido finalizado correctamente",
      partido: {
        id: parseInt(id),
        resultado,
        estado: "finalizado",
      },
      estadisticasId: statsResult.rows[0].id,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error al finalizar partido:", error);
    res.status(500).json({ error: "Error al finalizar partido" });
  } finally {
    client.release();
  }
};

export const obtenerEstadisticasPartido = async (req, res) => {
  try {
    const { id } = req.params;

    // Obtener estadísticas generales
    const statsResult = await pool.query(
      `SELECT * FROM estadisticas_partidos WHERE partido_id = $1`,
      [id]
    );

    if (statsResult.rows.length === 0) {
      return res.status(404).json({ error: "Estadísticas no encontradas" });
    }

    // Obtener estadísticas de jugadores
    const jugadoresResult = await pool.query(
      `SELECT ejp.*, u.nombre, u.email 
       FROM estadisticas_jugadores_partido ejp
       LEFT JOIN usuarios u ON ejp.jugador_id = u.id
       WHERE ejp.partido_id = $1
       ORDER BY ejp.equipo, ejp.goles DESC`,
      [id]
    );

    // Obtener estadísticas del staff
    const staffResult = await pool.query(
      `SELECT * FROM staff_partido WHERE partido_id = $1`,
      [id]
    );

    // Obtener historial de acciones
    const historialResult = await pool.query(
      `SELECT * FROM historial_acciones_partido 
       WHERE partido_id = $1 
       ORDER BY orden_accion ASC`,
      [id]
    );

    res.json({
      estadisticas: statsResult.rows[0],
      jugadores: jugadoresResult.rows,
      staff: staffResult.rows,
      historial: historialResult.rows,
    });
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    res.status(500).json({ error: "Error al obtener estadísticas" });
  }
};
```

---

## 📊 Consultas Útiles

### **Estadísticas de un jugador en todos los partidos**

```sql
SELECT
  u.nombre,
  COUNT(DISTINCT ejp.partido_id) as partidos_jugados,
  SUM(ejp.minutos_jugados) as minutos_totales,
  SUM(ejp.goles) as goles_totales,
  SUM(ejp.asistencias) as asistencias_totales,
  SUM(ejp.tarjetas_amarillas) as amarillas_totales,
  SUM(ejp.tarjetas_rojas) as rojas_totales
FROM estadisticas_jugadores_partido ejp
JOIN usuarios u ON ejp.jugador_id = u.id
WHERE ejp.jugador_id = ?
GROUP BY u.nombre;
```

### **Top goleadores de la temporada**

```sql
SELECT
  u.nombre,
  u.numero_dorsal,
  SUM(ejp.goles) as goles,
  COUNT(DISTINCT ejp.partido_id) as partidos,
  ROUND(CAST(SUM(ejp.goles) AS DECIMAL) / COUNT(DISTINCT ejp.partido_id), 2) as promedio
FROM estadisticas_jugadores_partido ejp
JOIN usuarios u ON ejp.jugador_id = u.id
WHERE ejp.equipo = 'local'
GROUP BY u.id, u.nombre, u.numero_dorsal
ORDER BY goles DESC
LIMIT 10;
```

### **Historial completo de un partido**

```sql
SELECT
  hap.*,
  u.nombre as nombre_real
FROM historial_acciones_partido hap
LEFT JOIN usuarios u ON hap.jugador_id = u.id
WHERE hap.partido_id = ?
ORDER BY hap.orden_accion ASC;
```

---

## ✅ Checklist de Implementación

### **Base de Datos**

- [ ] Crear tabla `estadisticas_partidos`
- [ ] Crear tabla `estadisticas_jugadores_partido`
- [ ] Crear tabla `historial_acciones_partido`
- [ ] Crear tabla `tiempos_juego_partido` (opcional)
- [ ] Crear tabla `staff_partido`
- [ ] Agregar campo `estado` a tabla `partidos`
- [ ] Crear índices necesarios

### **Backend**

- [ ] Implementar endpoint `POST /api/partidos/:id/finalizar`
- [ ] Implementar endpoint `GET /api/partidos/:id/estadisticas`
- [ ] Agregar validaciones de datos
- [ ] Implementar transacciones para atomicidad
- [ ] Agregar tests unitarios

### **Frontend**

- [ ] Agregar botón "Finalizar Partido" en `ConfigurarPartido.jsx`
- [ ] Implementar función `handleFinalizarPartido`
- [ ] Implementar funciones auxiliares de preparación de datos
- [ ] Agregar endpoints en `api.js`
- [ ] Crear página de visualización de estadísticas finalizadas
- [ ] Agregar confirmación antes de finalizar
- [ ] Limpiar localStorage después de finalizar
- [ ] Manejar errores y mostrar mensajes al usuario

### **Testing**

- [ ] Probar flujo completo de finalización
- [ ] Verificar que todos los datos se guardan correctamente
- [ ] Probar con partidos sin estadísticas
- [ ] Probar con dorsales personalizados visitantes
- [ ] Verificar limpieza de localStorage

### **Documentación**

- [ ] Documentar endpoints de la API
- [ ] Crear ejemplos de uso
- [ ] Documentar esquema de base de datos

---

## 🚀 Próximos Pasos Recomendados

1. **Crear las tablas en la base de datos**
2. **Implementar el endpoint de finalización en el backend**
3. **Agregar el botón y la lógica en el frontend**
4. **Crear página de visualización de estadísticas**
5. **Implementar exportación a PDF/Excel de estadísticas**
6. **Agregar gráficos y análisis visual**

---

## 📝 Notas Adicionales

- **Jugadores visitantes**: No tienen `jugador_id` real, se identifican por dorsal y equipo
- **Staff**: Se guarda por separado porque puede recibir tarjetas sin ser jugador
- **Historial**: Permite "replay" del partido cronológicamente
- **Tiempos de juego**: Útil para análisis de rotaciones y fatiga
- **JSONB para dorsales**: Permite flexibilidad en la personalización

---

## 🎯 Ejemplo de Flujo Completo

```
1. Usuario configura partido en tiempo real
   ↓
2. Registra goles, faltas, tarjetas, etc.
   ↓
3. Click en "Finalizar Partido"
   ↓
4. Confirmación con resumen
   ↓
5. POST /api/partidos/:id/finalizar
   ↓
6. Backend guarda en 5 tablas (transacción)
   ↓
7. Actualiza estado del partido a "finalizado"
   ↓
8. Limpia localStorage
   ↓
9. Redirige a página de estadísticas finales
```

---

**Fecha de Análisis**: 29 de noviembre de 2025  
**Autor**: GitHub Copilot  
**Proyecto**: FutbolClub - Sistema de Gestión Deportiva
