# Tarea 2.5 Completada: Casos de Uso - Asistencia

**Fecha de finalización:** 29 de noviembre de 2025  
**Tiempo estimado:** 3h  
**Tiempo real:** 2.5h

## Resumen

Se han implementado exitosamente todos los casos de uso para la gestión de asistencias a partidos y entrenamientos, incluyendo la interfaz del repositorio correspondiente, siguiendo los principios de Clean Architecture, DDD y TDD.

## Interfaz de Repositorio

### IAsistenciaRepository (144 líneas)

**Responsabilidad:** Define el contrato para el repositorio de asistencias.

**Métodos principales:**

- `registrar(asistenciaData)` - Registra nueva asistencia
- `actualizar(id, actualizaciones)` - Actualiza asistencia existente
- `findById(id)` - Busca por ID
- `findByJugadorYEvento(jugadorId, partidoId, entrenamientoId)` - Busca asistencia específica
- `findByPartidoId(partidoId)` - Obtiene asistencias de un partido
- `findByEntrenamientoId(entrenamientoId)` - Obtiene asistencias de un entrenamiento
- `findByJugadorId(jugadorId, opciones)` - Obtiene asistencias de un jugador
- `getEstadisticasByJugador(jugadorId, opciones)` - Estadísticas por jugador
- `getEstadisticasByEvento(partidoId, entrenamientoId)` - Estadísticas por evento
- `delete(id)` - Elimina asistencia
- `registrarMasivo(asistencias)` - Registro masivo
- `existe(jugadorId, partidoId, entrenamientoId)` - Verifica existencia

## Casos de Uso Implementados

### 1. RegistrarAsistenciaUseCase (101 líneas)

**Responsabilidad:** Registrar la asistencia de un jugador a un evento (partido o entrenamiento).

**Características:**

- Valida que se proporcione jugadorId y al menos un evento (partidoId o entrenamientoId)
- Valida que no se proporcionen ambos eventos simultáneamente
- Valida estados: 'confirmado', 'ausente', 'pendiente'
- Verifica que el jugador existe
- Requiere motivoAusenciaId cuando el estado es 'ausente'
- Verifica que no exista asistencia duplicada
- Registra la asistencia en el repositorio

**Tests:** 16/16 ✅

- Constructor validation (3)
- Successful registration (partido, entrenamiento, ausente, pendiente) (4)
- Required field validations (4)
- Invalid state validation (1)
- Player existence validation (1)
- Absence motive validation (1)
- Duplicate prevention (1)
- Multiple registrations (1)

### 2. ActualizarEstadoAsistenciaUseCase (91 líneas)

**Responsabilidad:** Actualizar el estado de una asistencia existente.

**Características:**

- Valida que se proporcione al menos un campo para actualizar
- Actualiza: estado, motivoAusenciaId, comentario
- Valida estados válidos
- Requiere motivo cuando se cambia a 'ausente'
- Limpia automáticamente el motivo al cambiar de 'ausente' a otro estado
- Verifica existencia de la asistencia antes de actualizar

**Tests:** 13/13 ✅

- Constructor validation (2)
- Individual field updates (3)
- Multiple field updates (1)
- Auto-cleanup of motive (1)
- Error cases (6)

### 3. ObtenerAsistenciasPorEventoUseCase (106 líneas)

**Responsabilidad:** Obtener asistencias de un evento específico (partido o entrenamiento).

**Características:**

- **3 métodos de ejecución:**
  - `execute(opciones)`: Lista de asistencias del evento
  - `executeAgrupadas(opciones)`: Asistencias agrupadas por estado
  - `executeResumen(opciones)`: Resumen estadístico
- Valida que se proporcione un único evento
- Calcula porcentaje de asistencia
- Retorna arrays vacíos si no hay asistencias

**Tests:** 13/13 ✅

- Constructor validation (2)
- execute() for partido and entrenamiento (3)
- executeAgrupadas() grouping by state (3)
- executeResumen() with statistics (3)
- Error cases (2)

### 4. ObtenerEstadisticasAsistenciaUseCase (174 líneas)

**Responsabilidad:** Obtener estadísticas de asistencia de un jugador.

**Características:**

- **3 métodos de ejecución:**
  - `execute(jugadorId, opciones)`: Estadísticas básicas
  - `executeComparativas(jugadorId, opciones)`: Comparativa partido/entrenamiento
  - `executeHistorial(jugadorId, opciones)`: Historial completo
- Filtros disponibles: tipo (partido/entrenamiento), fechaDesde, fechaHasta
- Valida jugador existe
- Valida tipos y fechas
- Calcula porcentajes de asistencia
- Estadísticas globales en comparativas

**Tests:** 24/24 ✅

- Constructor validation (3)
- execute() with filters (12)
- executeComparativas() (3)
- executeHistorial() (6)

### 5. Archivo de Exportación

**asistencia/index.js**

- Exporta los 4 casos de uso
- Facilita importaciones centralizadas

## Métricas de Calidad

### Cobertura de Tests

- **Total de tests:** 67
- **Tests pasando:** 67 (100%)
- **Suites de tests:** 4
- **Tiempo de ejecución:** 0.59s

### Distribución de Tests por Caso de Uso

1. RegistrarAsistenciaUseCase: 16 tests
2. ActualizarEstadoAsistenciaUseCase: 13 tests
3. ObtenerAsistenciasPorEventoUseCase: 13 tests
4. ObtenerEstadisticasAsistenciaUseCase: 24 tests (más completo por múltiples métodos y filtros)

### Líneas de Código

- **Interfaz de repositorio:** 144 líneas
- **Casos de uso:** ~472 líneas
- **Tests:** ~750 líneas
- **Ratio test/code:** ~1.6:1

## Patrones y Buenas Prácticas Aplicadas

### 1. Gestión de Asistencias Dual

```javascript
// Soporta tanto partidos como entrenamientos
if (!datos.partidoId && !datos.entrenamientoId) {
  throw new Error("Debe proporcionar partidoId o entrenamientoId");
}

if (datos.partidoId && datos.entrenamientoId) {
  throw new Error(
    "No puede proporcionar partidoId y entrenamientoId al mismo tiempo"
  );
}
```

### 2. Validación de Estados y Motivos

```javascript
// Estado ausente requiere motivo
if (datos.estado === "ausente" && !datos.motivoAusenciaId) {
  throw new Error(
    "motivoAusenciaId es requerido cuando el estado es 'ausente'"
  );
}

// Limpieza automática de motivo al cambiar estado
if (asistencia.estado === "ausente" && actualizaciones.estado !== "ausente") {
  actualizaciones.motivoAusenciaId = null;
}
```

### 3. Múltiples Métodos de Ejecución

```javascript
// ObtenerAsistenciasPorEventoUseCase
async execute(opciones = {}) { ... }           // Lista básica
async executeAgrupadas(opciones = {}) { ... }  // Agrupadas por estado
async executeResumen(opciones = {}) { ... }    // Resumen estadístico

// ObtenerEstadisticasAsistenciaUseCase
async execute(jugadorId, opciones = {}) { ... }           // Estadísticas básicas
async executeComparativas(jugadorId, opciones = {}) { ... } // Comparativa
async executeHistorial(jugadorId, opciones = {}) { ... }  // Historial completo
```

### 4. Filtros Flexibles

```javascript
// Filtros para estadísticas
const opciones = {
  tipo: "partido", // 'partido', 'entrenamiento' o undefined (ambos)
  fechaDesde: new Date(), // Fecha desde
  fechaHasta: new Date(), // Fecha hasta
};
```

### 5. Cálculo de Porcentajes

```javascript
// Cálculo automático de porcentaje de asistencia
const porcentajeAsistencia =
  total > 0 ? Math.round((confirmados / total) * 100) : 0;
```

### 6. Prevención de Duplicados

```javascript
// Verifica que no exista asistencia duplicada
const asistenciaExistente =
  await this.asistenciaRepository.findByJugadorYEvento(
    datos.jugadorId,
    datos.partidoId,
    datos.entrenamientoId
  );

if (asistenciaExistente) {
  throw new Error("Ya existe una asistencia para este jugador y evento");
}
```

## Decisiones Técnicas Importantes

### 1. Interfaz de Repositorio Unificada

- Una única interfaz maneja asistencias a partidos y entrenamientos
- Simplifica la implementación y el uso
- Los métodos distinguen entre tipos mediante parámetros opcionales

### 2. Estados de Asistencia

- Tres estados definidos: 'confirmado', 'ausente', 'pendiente'
- Estado 'ausente' requiere obligatoriamente un motivo
- Estado 'pendiente' es el estado por defecto cuando el jugador no ha respondido

### 3. Estadísticas Comparativas

- Método `executeComparativas()` permite comparar rendimiento en partidos vs entrenamientos
- Útil para identificar patrones de asistencia
- Calcula estadísticas globales automáticamente

### 4. Filtros por Fecha

- Todos los métodos de estadísticas soportan filtros de fecha
- Permite análisis de períodos específicos
- Valida que fechaDesde no sea posterior a fechaHasta

### 5. Métodos de Agrupación

- `executeAgrupadas()` retorna asistencias separadas por estado
- Útil para UI que necesita mostrar listas separadas
- Simplifica el procesamiento en el frontend

## Mock Repositories Implementados

### MockAsistenciaRepository

**Implementación:** Array-based con lógica de filtrado

**Métodos implementados:**

- `registrar()` - Añade asistencia con ID autoincremental
- `findByJugadorYEvento()` - Busca por combinación jugador-evento
- `actualizar()` - Actualiza objeto en array
- `findById()` - Busca por ID
- `findByPartidoId()` - Filtra por partido
- `findByEntrenamientoId()` - Filtra por entrenamiento
- `getEstadisticasByJugador()` - Calcula estadísticas con filtros
- `findByJugadorId()` - Filtra por jugador con opciones

**Lógica de filtrado:**

- Tipo: partidoId !== null o entrenamientoId !== null
- Fechas: Comparación con fechaRespuesta
- Estados: Cuenta confirmados, ausentes, pendientes

### MockJugadorRepository

**Implementación:** Map-based para búsquedas rápidas

**Métodos implementados:**

- `findById()` - Busca jugador por ID
- `create()` - Crea jugador en el Map

## Lecciones Aprendidas

### 1. Manejo de Relaciones Duales

- Las asistencias relacionan jugadores con dos tipos de eventos diferentes
- Validar exclusividad mutua (partidoId XOR entrenamientoId) previene errores
- Métodos del repositorio deben aceptar ambos tipos como parámetros opcionales

### 2. Validación Contextual

- El requisito de motivo para ausencias depende del estado
- La limpieza automática de motivos al cambiar estado mejora la experiencia
- Validar en actualización que el estado existente permite el cambio

### 3. Estadísticas Calculadas

- Calcular porcentajes en el repositorio mock permite testear la lógica completa
- Los métodos de estadísticas deben retornar objetos con estructura consistente
- Las estadísticas comparativas requieren múltiples llamadas coordinadas

### 4. Filtros de Fecha en Tests

- Los filtros de fecha deben usar comparaciones >= y <=
- Los datos de prueba deben estar bien distribuidos temporalmente
- Documentar con comentarios qué registros se esperan en cada filtro

## Archivos Creados

### Interfaz de Repositorio

```
src/domain/repositories/
└── IAsistenciaRepository.js (144 líneas)
```

### Casos de Uso

```
src/application/useCases/asistencia/
├── RegistrarAsistenciaUseCase.js (101 líneas)
├── ActualizarEstadoAsistenciaUseCase.js (91 líneas)
├── ObtenerAsistenciasPorEventoUseCase.js (106 líneas)
├── ObtenerEstadisticasAsistenciaUseCase.js (174 líneas)
└── index.js (4 exportaciones)
```

### Tests

```
tests/application/useCases/
├── RegistrarAsistenciaUseCase.test.js (16 tests)
├── ActualizarEstadoAsistenciaUseCase.test.js (13 tests)
├── ObtenerAsistenciasPorEventoUseCase.test.js (13 tests)
└── ObtenerEstadisticasAsistenciaUseCase.test.js (24 tests)
```

## Próximos Pasos

Con la Tarea 2.5 completada, se ha finalizado **completamente la FASE 2** (Casos de Uso). Pendientes:

- **FASE 3:** Implementaciones de Infraestructura (6 tareas)

  - Repositorios PostgreSQL
  - Servicios externos (Hash, Token, DateTime)
  - Integración con base de datos

- **FASE 4:** Tests de Integración (3 tareas)
- **FASE 5:** Actualización del Frontend (6 tareas)
- **FASE 6:** Documentación y Deployment (2 tareas)

## Conclusión

La implementación de los casos de uso de Asistencia se completó exitosamente con:

✅ 1 interfaz de repositorio (IAsistenciaRepository)  
✅ 4 casos de uso funcionales  
✅ 67 tests (100% passing)  
✅ ~616 líneas de código de producción (interfaz + casos de uso)  
✅ ~750 líneas de tests  
✅ Múltiples métodos de ejecución para flexibilidad  
✅ Soporte dual para partidos y entrenamientos  
✅ Estadísticas completas y comparativas  
✅ Filtros por tipo y fechas  
✅ Zero dependencias de infraestructura (Clean Architecture)

**FASE 2 COMPLETA:** 5/5 tareas finalizadas (Usuario, Jugador, Partido, Entrenamiento, Asistencia)

El código está listo para la FASE 3: Implementaciones de Infraestructura.
