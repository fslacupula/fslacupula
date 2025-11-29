# Resumen: Gestión de Tiempos en el Sistema

## ✅ ESTADO ACTUAL CORRECTO

### 📊 Base de Datos

#### `estadisticas_jugadores_partido.minutos_jugados`

- **Tipo**: INTEGER
- **Almacena**: SEGUNDOS
- **Comentario en migración**: "Tiempo jugado en segundos"

#### `tiempos_juego_partido.duracion_segundos`

- **Tipo**: INTEGER
- **Almacena**: SEGUNDOS

#### `tiempos_juego_partido.duracion_minutos`

- **Tipo**: INTEGER
- **Almacena**: MINUTOS (columna alternativa, se usa `duracion_segundos`)

#### `estadisticas_partidos.duracion_minutos`

- **Tipo**: INTEGER
- **Almacena**: MINUTOS (duración total del partido)

---

### 🎮 Frontend (ConfigurarPartido.jsx)

#### Estado interno

```javascript
estadisticas[jugadorId].minutos; // Almacena SEGUNDOS
contadoresJugadores[jugadorId].tiempoAcumulado; // SEGUNDOS
tiempoCronometro; // SEGUNDOS
```

#### Al finalizar partido (línea ~1131)

```javascript
const minutosJugados = stats.minutos || 0; // Envía SEGUNDOS
```

#### Payload enviado al backend

```javascript
{
  jugadores: [{
    minutosJugados: 90  // SEGUNDOS (no dividido)
  }],
  tiemposJuego: [{
    duracionSegundos: 90  // SEGUNDOS
  }],
  estadisticas: {
    duracionMinutos: 50  // MINUTOS (duración total partido)
  }
}
```

---

### 🖥️ Backend (PartidoController.js)

#### Guardar estadísticas de jugadores (línea ~422)

```javascript
jugador.minutosJugados || 0; // Recibe SEGUNDOS, guarda en BD
```

#### Guardar tiempos de juego (línea ~507)

```javascript
tiempo.duracionSegundos || 0; // Recibe SEGUNDOS, guarda en BD
```

#### INSERT SQL

```sql
INSERT INTO estadisticas_jugadores_partido (..., minutos_jugados, ...)
VALUES (..., $6, ...)  -- Guarda SEGUNDOS

INSERT INTO tiempos_juego_partido (..., duracion_segundos)
VALUES (..., $8)  -- Guarda SEGUNDOS
```

---

### 📄 Frontend (ActaPartido.jsx)

#### Leer de BD

```javascript
jugador.minutos_jugados; // Recibe SEGUNDOS desde BD
```

#### Mostrar en UI (línea ~42)

```javascript
const formatearTiempo = (segundos) => {
  const minutos = Math.floor((segundos || 0) / 60); // Convierte a MINUTOS
  return `${minutos}'`;
};
```

#### Uso

```jsx
{
  formatearTiempo(jugador.minutos_jugados);
} // Muestra "5'" por ejemplo
```

---

## 🔧 FLUJO COMPLETO

1. **Durante el partido**:

   - Cronómetro cuenta en SEGUNDOS
   - `contadoresJugadores` acumula SEGUNDOS
   - `estadisticas[jugadorId].minutos` guarda SEGUNDOS

2. **Al finalizar partido**:

   - Frontend envía `minutosJugados` en SEGUNDOS (sin dividir)
   - Frontend envía `duracionSegundos` en SEGUNDOS
   - Frontend envía `duracionMinutos` en MINUTOS (solo para duración total)

3. **Backend guarda**:

   - `minutos_jugados` = SEGUNDOS recibidos
   - `duracion_segundos` = SEGUNDOS recibidos
   - `duracion_minutos` = MINUTOS recibidos

4. **Al leer acta**:
   - Backend devuelve `minutos_jugados` en SEGUNDOS
   - Frontend convierte a MINUTOS para mostrar: `Math.floor(segundos / 60)`

---

## ✅ VERIFICACIÓN

Todo está correcto y consistente:

- ✅ BD espera y guarda SEGUNDOS en `minutos_jugados`
- ✅ Frontend envía SEGUNDOS (cambio reciente)
- ✅ Frontend lee SEGUNDOS y convierte a MINUTOS para mostrar
- ✅ Función `formatearTiempo()` hace la conversión correcta

---

## 📝 NOTAS

- La columna `duracion_minutos` en `tiempos_juego_partido` existe pero **NO se usa**
- Se usa `duracion_segundos` para mayor precisión
- `estadisticas_partidos.duracion_minutos` sí se usa para la duración total del partido
