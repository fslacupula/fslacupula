# Estándares de Gestión de Fechas y Horas

## Arquitectura

### Base de Datos

- **Tipo de dato**: `TIMESTAMPTZ` (timestamp with timezone)
- **Almacenamiento**: UTC automáticamente
- **Timezone**: `Europe/Madrid` configurado en conexión PostgreSQL
- **Formato de entrada**: ISO 8601 (`YYYY-MM-DDTHH:MM:SS`)

### Backend (Node.js)

#### 1. Creación y Actualización de Timestamps

**Estándar aplicado**: ISO 8601 con validación

```javascript
// ✅ CORRECTO - Combinar fecha y hora con formato ISO 8601
const fechaHora = `${fecha}T${hora}`; // Ej: "2025-11-27T21:00:00"

// ✅ CORRECTO - Validar antes de insertar/actualizar
const testDate = new Date(fechaHora);
if (isNaN(testDate.getTime())) {
  throw new Error(`Timestamp inválido: ${fechaHora}`);
}

// ❌ INCORRECTO - Concatenación sin validación
const fechaHora = fecha + " " + hora; // No usar espacios
```

**Beneficios**:

- Formato estándar reconocido por PostgreSQL
- Detección temprana de errores
- Conversión automática a TIMESTAMPTZ

#### 2. Formateo de Timestamps para el Frontend

**Estándar aplicado**: `Intl.DateTimeFormat` (via `toLocaleTimeString`)

```javascript
// ✅ CORRECTO - Usar toLocaleTimeString con opciones explícitas
const fecha = new Date(item.fecha_hora);

// Validar fecha válida
if (isNaN(fecha.getTime())) {
  console.error("Fecha inválida:", item.fecha_hora);
  return item;
}

// Extraer hora con timezone explícito
item.hora = fecha.toLocaleTimeString("es-ES", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
  timeZone: "Europe/Madrid",
});

// ❌ INCORRECTO - Extracción manual de componentes
const horas = String(fecha.getHours()).padStart(2, "0");
const minutos = String(fecha.getMinutes()).padStart(2, "0");
item.hora = `${horas}:${minutos}`; // Propenso a errores de timezone
```

**Beneficios**:

- Manejo automático de timezone
- Formato consistente y localizado
- Menos código propenso a errores
- Compatibilidad con estándares i18n

#### 3. Opciones de `toLocaleTimeString` Explicadas

```javascript
{
  hour: '2-digit',      // Fuerza 2 dígitos (01, 02, ..., 23)
  minute: '2-digit',    // Fuerza 2 dígitos (00-59)
  second: '2-digit',    // Fuerza 2 dígitos (00-59)
  hour12: false,        // Formato 24 horas (no AM/PM)
  timeZone: 'Europe/Madrid'  // Timezone explícito (evita ambigüedades)
}
```

### Frontend (React)

**Pendiente de refactorización**: Los componentes frontend aún usan helpers manuales para comparar fechas. Se recomienda:

1. Usar objetos `Date` directamente
2. Aplicar `Intl.DateTimeFormat` para formato visual
3. Eliminar helpers como `getFechaString()`, `compararFechas()`

```javascript
// ✅ Recomendado para futuro refactor
const fecha = new Date(evento.fecha_hora);
const fechaFormateada = fecha.toLocaleDateString("es-ES", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "Europe/Madrid",
});
```

## Flujo de Datos Completo

### 1. Creación de Evento

```
Usuario introduce: fecha="2025-11-27", hora="21:00:00"
       ↓
Backend combina: fechaHora="2025-11-27T21:00:00"
       ↓
PostgreSQL almacena: "2025-11-27 21:00:00+01" (TIMESTAMPTZ)
```

### 2. Lectura de Evento

```
PostgreSQL devuelve: "2025-11-27T20:00:00.000Z" (ISO UTC)
       ↓
Node.js crea: new Date("2025-11-27T20:00:00.000Z")
       ↓
formatearFechaHora extrae: hora="21:00:00" (Europe/Madrid)
       ↓
Frontend recibe: { fecha_hora: "...", hora: "21:00:00" }
```

### 3. Visualización

```
Frontend muestra calendario con fecha correcta
Frontend muestra hora "21:00:00" en detalles
```

## Ventajas de Esta Arquitectura

1. **Un único source of truth**: TIMESTAMPTZ en base de datos
2. **Conversión automática**: JavaScript Date maneja timezones
3. **Código limpio**: Menos lógica manual de fechas
4. **Internacionalización**: Compatible con i18n/l10n
5. **Menos bugs**: Eliminados problemas de timezone

## Testing

### Casos de Prueba Recomendados

1. **Crear evento a las 23:59**
   - Verificar que no cambia de día
2. **Crear evento el 31 de diciembre a las 23:00**
   - Verificar que no cambia de año
3. **Listar eventos filtrados por rango de fechas**
   - Verificar orden correcto (DESC por fecha_hora)
4. **Actualizar hora de un evento**
   - Verificar que mantiene la fecha correcta

## Referencias

- [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) - Estándar internacional de fechas
- [PostgreSQL TIMESTAMPTZ](https://www.postgresql.org/docs/current/datatype-datetime.html)
- [Intl.DateTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat)
- [Date.toLocaleTimeString()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleTimeString)

## Historial de Cambios

- **2025-11-27**: Migración completa a estándares Intl.DateTimeFormat
- **2025-11-25**: Migración de DATE+TIME a TIMESTAMPTZ
