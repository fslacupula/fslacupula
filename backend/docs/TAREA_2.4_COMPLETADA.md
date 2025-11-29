# Tarea 2.4 Completada: Casos de Uso - Entrenamiento

**Fecha de finalización:** 29 de enero de 2025  
**Tiempo estimado:** 4h  
**Tiempo real:** 4h

## Resumen

Se han implementado exitosamente todos los casos de uso para la gestión de entrenamientos, siguiendo los principios de Clean Architecture, DDD y TDD.

## Casos de Uso Implementados

### 1. CrearEntrenamientoUseCase (84 líneas)

**Responsabilidad:** Crear nuevos entrenamientos con validación completa.

**Características:**

- Valida campos obligatorios: `fechaHora`, `lugar`, `creadoPor`
- Usa duración por defecto (90 minutos) si no se proporciona
- Valida rango de duración (15-240 minutos)
- Crea entidad Entrenamiento con validación integrada

**Tests:** 13/13 ✅

- Constructor validation (2)
- Successful creation variants (4)
- Required field validations (3)
- Duration range validation (2)
- Invalid date handling (1)
- Multiple creations (1)

### 2. ActualizarEntrenamientoUseCase (98 líneas)

**Responsabilidad:** Actualizar entrenamientos existentes.

**Características:**

- Valida que al menos un campo sea proporcionado
- Actualiza: `fechaHora`, `lugar`, `descripcion`, `duracionMinutos`
- Usa métodos de negocio de la entidad:
  - `cambiarLugar(nuevoLugar)`
  - `cambiarDescripcion(nuevaDescripcion)`
  - `cambiarDuracion(nuevaDuracion)`
- Permite establecer descripción como `null`

**Tests:** 12/12 ✅

- Constructor validation (2)
- Individual field updates (4)
- Multiple field updates (1)
- Null descripcion handling (1)
- Error cases (4)

### 3. ObtenerProximosEntrenamientosUseCase (86 líneas)

**Responsabilidad:** Obtener entrenamientos futuros con múltiples vistas temporales.

**Características:**

- **4 métodos de ejecución:**
  - `execute(opciones)`: Lista filtrada con límite opcional
  - `executeNext()`: Siguiente entrenamiento único
  - `executeToday()`: Entrenamientos de hoy
  - `executeThisWeek()`: Entrenamientos de esta semana
- Valida límite (1-100)
- Ordena por fecha ascendente

**Tests:** 10/10 ✅

- Constructor validation (2)
- execute() with ordering, empty, limit, validation (4)
- executeNext() success/null (2)
- executeToday() (1)
- executeThisWeek() (1)

**Nota técnica:** El test de `executeThisWeek()` usa el miércoles de la semana actual para evitar problemas de límites semanales.

### 4. ListarEntrenamientosUseCase (113 líneas)

**Responsabilidad:** Listar entrenamientos con paginación y filtros.

**Características:**

- **3 métodos de ejecución:**
  - `execute(opciones)`: Paginado con filtros
  - `executeAll(filters)`: Todos sin paginación
  - `executeByDateRange(fechaInicio, fechaFin)`: Rango de fechas
- Filtros disponibles: `lugar`, `fechaDesde`, `fechaHasta`
- Paginación: `page` (≥1), `limit` (1-100)
- Valida fechas y parámetros de paginación

**Tests:** 19/19 ✅

- Constructor validation (2)
- execute() pagination and filters (8)
- executeAll() without pagination (2)
- executeByDateRange() with validations (5)
- Error handling (2)

### 5. EliminarEntrenamientoUseCase (47 líneas)

**Responsabilidad:** Eliminar entrenamientos con verificación.

**Características:**

- Valida ID de entrenamiento
- Verifica existencia antes de eliminar
- Retorna mensaje de éxito
- Manejo de errores claro

**Tests:** 7/7 ✅

- Constructor validation (2)
- Successful deletion (1)
- Error cases (3)
- Multiple deletions (1)

## Archivo de Exportación

**entrenamiento/index.js**

- Exporta los 5 casos de uso
- Facilita importaciones desde otros módulos

## Métricas de Calidad

### Cobertura de Tests

- **Total de tests:** 62
- **Tests pasando:** 62 (100%)
- **Suites de tests:** 5
- **Tiempo de ejecución:** 0.67s

### Distribución de Tests por Caso de Uso

1. CrearEntrenamientoUseCase: 13 tests
2. ActualizarEntrenamientoUseCase: 12 tests
3. ObtenerProximosEntrenamientosUseCase: 10 tests
4. ListarEntrenamientosUseCase: 19 tests (más completo por múltiples filtros)
5. EliminarEntrenamientoUseCase: 7 tests

### Líneas de Código

- **Casos de uso:** ~428 líneas
- **Tests:** ~600 líneas
- **Ratio test/code:** ~1.4:1

## Patrones y Buenas Prácticas Aplicadas

### 1. Uso de Constantes de Entidad

```javascript
// Uso de constantes definidas en Entrenamiento.js
if (!datos.duracionMinutos) {
  datos.duracionMinutos = Entrenamiento.DEFAULT_DURACION;
}

if (!Entrenamiento.esDuracionValida(datos.duracionMinutos)) {
  throw new Error(
    `La duración debe estar entre ${Entrenamiento.MIN_DURACION} y ${Entrenamiento.MAX_DURACION} minutos`
  );
}
```

### 2. Métodos de Negocio de la Entidad

```javascript
// ActualizarEntrenamientoUseCase usa métodos de negocio
if (actualizaciones.lugar !== undefined) {
  entrenamiento.cambiarLugar(actualizaciones.lugar);
}

if (actualizaciones.descripcion !== undefined) {
  entrenamiento.cambiarDescripcion(actualizaciones.descripcion);
}

if (actualizaciones.duracionMinutos !== undefined) {
  entrenamiento.cambiarDuracion(actualizaciones.duracionMinutos);
}
```

### 3. Múltiples Métodos de Ejecución

```javascript
// ObtenerProximosEntrenamientosUseCase
async execute(opciones = {}) { ... }          // Lista con filtros
async executeNext() { ... }                   // Siguiente único
async executeToday() { ... }                  // Hoy
async executeThisWeek() { ... }               // Esta semana

// ListarEntrenamientosUseCase
async execute(opciones = {}) { ... }          // Paginado
async executeAll(filters = {}) { ... }        // Todos
async executeByDateRange(fechaInicio, fechaFin) { ... }  // Rango
```

### 4. Validación Exhaustiva

- Todos los casos de uso validan sus parámetros de entrada
- Mensajes de error claros y específicos
- Uso de constantes para valores límite
- Validación de tipos de datos (Date, números, strings)

### 5. Mock Repositories Robustos

```javascript
// MockEntrenamientoRepository implementa lógica de filtrado temporal
async findThisWeek() {
  const hoy = new Date();
  const inicioSemana = new Date(hoy);
  inicioSemana.setDate(hoy.getDate() - hoy.getDay());
  inicioSemana.setHours(0, 0, 0, 0);

  const finSemana = new Date(inicioSemana);
  finSemana.setDate(inicioSemana.getDate() + 7);

  return this.entrenamientos.filter(
    (e) => e.fechaHora >= inicioSemana && e.fechaHora < finSemana
  );
}
```

## Decisiones Técnicas Importantes

### 1. Duración por Defecto

- Si no se proporciona `duracionMinutos`, se usa `DEFAULT_DURACION` (90 minutos)
- Esto simplifica la creación de entrenamientos típicos
- La validación de rango sigue aplicándose si se proporciona explícitamente

### 2. Consultas Temporales

- `findToday()`: Desde las 00:00:00 hasta las 23:59:59 de hoy
- `findThisWeek()`: Desde el domingo 00:00:00 hasta el sábado 23:59:59
- Tests usan fechas relativas al miércoles para evitar límites semanales

### 3. Filtros Combinables

- En `ListarEntrenamientosUseCase` se pueden combinar múltiples filtros
- Los filtros se aplican con lógica AND
- La paginación se aplica después del filtrado

### 4. Manejo de Descripción Nula

- La descripción es nullable en la entidad
- `ActualizarEntrenamientoUseCase` permite establecerla explícitamente como `null`
- Se distingue entre "no proporcionar" y "establecer como null"

## Lecciones Aprendidas

### 1. Tests con Fechas

- Los tests con fechas relativas deben considerar límites de períodos (semanas, meses)
- Usar fechas fijas dentro del período (ej: miércoles) es más confiable que fechas relativas (ej: mañana)
- Calcular explícitamente inicio y fin de períodos hace el código más legible

### 2. Múltiples Métodos de Ejecución

- Proporcionar métodos especializados (`executeNext()`, `executeToday()`) mejora la ergonomía del API
- Los métodos especializados pueden delegar a métodos más generales con parámetros específicos
- Mantener la consistencia en la nomenclatura (`execute`, `executeXxx`)

### 3. Uso de Métodos de Negocio

- Los casos de uso deben usar los métodos de negocio de la entidad en lugar de asignación directa
- Esto respeta el encapsulamiento y permite que la entidad valide sus propias reglas
- Mejora la trazabilidad y el mantenimiento del código

## Archivos Creados

### Casos de Uso

```
src/application/useCases/entrenamiento/
├── CrearEntrenamientoUseCase.js (84 líneas)
├── ActualizarEntrenamientoUseCase.js (98 líneas)
├── ObtenerProximosEntrenamientosUseCase.js (86 líneas)
├── ListarEntrenamientosUseCase.js (113 líneas)
├── EliminarEntrenamientoUseCase.js (47 líneas)
└── index.js (5 exportaciones)
```

### Tests

```
tests/application/useCases/
├── CrearEntrenamientoUseCase.test.js (13 tests)
├── ActualizarEntrenamientoUseCase.test.js (12 tests)
├── ObtenerProximosEntrenamientosUseCase.test.js (10 tests)
├── ListarEntrenamientosUseCase.test.js (19 tests)
└── EliminarEntrenamientoUseCase.test.js (7 tests)
```

## Próximos Pasos

Con la Tarea 2.4 completada, se ha terminado el cuarto conjunto de casos de uso de FASE 2. Pendientes:

- **Tarea 2.5:** Casos de Uso - Asistencia (última tarea de FASE 2)
- **FASE 3:** Implementaciones de Infraestructura (6 tareas)
- **FASE 4:** Tests de Integración (3 tareas)
- **FASE 5:** Actualización del Frontend (6 tareas)
- **FASE 6:** Documentación y Deployment (2 tareas)

## Conclusión

La implementación de los casos de uso de Entrenamiento se completó exitosamente con:

✅ 5 casos de uso funcionales  
✅ 62 tests (100% passing)  
✅ ~428 líneas de código de producción  
✅ ~600 líneas de tests  
✅ Múltiples métodos de ejecución para mayor flexibilidad  
✅ Uso correcto de constantes y métodos de negocio de la entidad  
✅ Tests robustos con manejo correcto de fechas relativas  
✅ Zero dependencias de infraestructura (Clean Architecture)

El código está listo para la siguiente fase de implementación.
