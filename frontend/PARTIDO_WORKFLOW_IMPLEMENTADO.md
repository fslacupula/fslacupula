# Implementación del Workflow de Partido

## Fecha

2025-01-XX

## Resumen

Se ha implementado un sistema completo de gestión de estados del partido con confirmaciones temporales, períodos separados y validaciones de seguridad.

## Estados del Partido

El partido ahora tiene 5 estados claramente definidos:

1. **configuracion** - Estado inicial donde se configuran los 5 jugadores titulares
2. **primera_parte** - Primera parte del partido en juego
3. **descanso** - Tiempo entre períodos
4. **segunda_parte** - Segunda parte del partido
5. **finalizado** - Partido completado

## Características Implementadas

### 1. Estado de Configuración Inicial

- Los botones de marcador (+/-) y acciones están **deshabilitados** durante el estado "configuracion"
- Se requiere colocar exactamente **5 jugadores en la pista** antes de iniciar
- Botón **"INICIAR PARTIDO"** valida y cambia al estado "primera_parte"

### 2. Seguimiento de Faltas por Período

Se han creado 4 contadores independientes de faltas:

- `faltasLocalPrimera`
- `faltasLocalSegunda`
- `faltasVisitantePrimera`
- `faltasVisitanteSegunda`

**Lógica implementada:**

- Las faltas se registran automáticamente en el período actual
- Las faltas totales se calculan automáticamente (primera + segunda)
- Al finalizar la primera parte, las faltas del primer período se resetean visualmente pero se conservan
- El historial de acciones incluye el período en el que ocurrió cada falta

### 3. Sistema de Confirmación con Timeout de 5 Segundos

Se ha implementado un sistema de confirmación temporal para acciones críticas:

**Acciones que requieren confirmación:**

- Iniciar/Detener cronómetro
- Incrementar gol (local o visitante)
- Decrementar gol (local o visitante)
- Resetear cronómetro

**Funcionamiento:**

- Al pulsar una acción crítica, aparece un modal de confirmación
- Se muestra un countdown visual circular de 5 segundos
- Si no se confirma en 5 segundos, la acción se cancela automáticamente
- El usuario puede confirmar o cancelar manualmente

**Código del sistema:**

```javascript
// Estado para gestionar confirmaciones
const [confirmacionPendiente, setConfirmacionPendiente] = useState(null);
const [tiempoRestanteConfirmacion, setTiempoRestanteConfirmacion] = useState(0);

// useEffect que maneja el countdown automático
useEffect(() => {
  if (!confirmacionPendiente) return;

  const tiempoInicio = confirmacionPendiente.timestamp;
  setTiempoRestanteConfirmacion(5);

  const intervalo = setInterval(() => {
    const tiempoTranscurrido = Date.now() - tiempoInicio;
    const tiempoRestante = Math.max(0, 5 - tiempoTranscurrido / 1000);

    setTiempoRestanteConfirmacion(tiempoRestante);

    if (tiempoRestante === 0) {
      setConfirmacionPendiente(null);
      setTiempoRestanteConfirmacion(0);
    }
  }, 100);

  return () => clearInterval(intervalo);
}, [confirmacionPendiente]);
```

### 4. Transiciones de Estado del Partido

Se han agregado 3 botones de control de flujo:

#### Botón "INICIAR PARTIDO"

- **Visible en:** Estado "configuracion"
- **Validación:** Exactamente 5 jugadores en pista
- **Efecto:**
  - Cambia estado a "primera_parte"
  - Establece `periodoActual = 1`
  - Inicia cronómetro automáticamente
  - Registra tiempo de entrada de jugadores

#### Botón "Finalizar Primera Parte"

- **Visible en:** Estado "primera_parte"
- **Confirmación:** Modal de confirmación estándar
- **Efecto:**
  - Cambia estado a "descanso"
  - Detiene cronómetro
  - Conserva faltas del primer período

#### Botón "Iniciar Segunda Parte"

- **Visible en:** Estado "descanso"
- **Confirmación:** Modal de confirmación estándar
- **Efecto:**
  - Cambia estado a "segunda_parte"
  - Establece `periodoActual = 2`
  - Reactiva cronómetro

### 5. Modificaciones en el Componente Marcador

**Props actualizadas:**

```javascript
// ANTES (deprecated)
setGolesLocal = { setGolesLocal };
setGolesVisitante = { setGolesVisitante };
onCronometroChange = { setCronometroActivo };

// AHORA (con confirmación)
onIncrementarGolLocal = { handleIncrementarGolLocal };
onDecrementarGolLocal = { handleDecrementarGolLocal };
onIncrementarGolVisitante = { handleIncrementarGolVisitante };
onDecrementarGolVisitante = { handleDecrementarGolVisitante };
onCronometroChange = { handleToggleCronometro };
estadoPartido = { estadoPartido };
```

**Botones del marcador:**

- Todos los botones +/- se deshabilitan en estado "configuracion"
- Los botones - se deshabilitan cuando goles = 0
- Tienen estilos `disabled:opacity-50 disabled:cursor-not-allowed`

### 6. Modal de Confirmación Visual

Se ha creado un modal elegante con:

- Fondo con blur (`backdrop-blur-sm`)
- Icono de advertencia
- Mensaje descriptivo según el tipo de acción
- **Countdown circular animado** (SVG con strokeDashoffset)
- Botones "Cancelar" y "Confirmar"

**Código del countdown circular:**

```javascript
<svg className="transform -rotate-90 w-20 h-20">
  <circle
    cx="40"
    cy="40"
    r="36"
    stroke="#3b82f6"
    strokeWidth="8"
    strokeDasharray={226.19}
    strokeDashoffset={226.19 * (1 - tiempoRestanteConfirmacion / 5)}
    strokeLinecap="round"
    className="transition-all duration-100"
  />
</svg>
```

## Archivos Modificados

### ConfigurarPartido.jsx

- **Líneas 44-54:** Nuevos estados (estadoPartido, periodoActual, faltas por período, confirmaciones)
- **Líneas 60-84:** useEffect para cálculo de faltas totales y countdown
- **Líneas 907-1033:** Funciones de transición de estado y confirmaciones
- **Líneas 475-527:** Modificación de `registrarAccion` para usar períodos
- **Líneas 564-630:** Modificación de `deshacer` para respetar períodos
- **Líneas 1183-1201:** Props actualizadas para Marcador
- **Líneas 2602-2695:** Botones de control de flujo
- **Líneas 2760-2847:** Modal de confirmación con countdown

### Marcador.jsx

- **Líneas 3-19:** Props actualizadas (sin setGoles, con funciones individuales)
- **Líneas 68-82:** Funciones `iniciarPausar` y `reiniciar` modificadas
- **Líneas 87-94:** Eliminadas funciones incrementar/decrementar locales
- **Líneas 132-147, 253-268:** Botones con `onClick` de props y `disabled`

## Validaciones Implementadas

1. ✅ No se puede iniciar sin 5 jugadores en pista
2. ✅ Botones deshabilitados durante configuración
3. ✅ Confirmación obligatoria para acciones críticas
4. ✅ Timeout automático de 5 segundos
5. ✅ No se pueden decrementar goles por debajo de 0
6. ✅ Las faltas se registran en el período correcto
7. ✅ El deshacer respeta el período de la acción

## Pendiente para Futura Implementación

### Backend

- [ ] Actualizar esquema de base de datos:

  - Agregar columnas `faltas_local_primera`, `faltas_local_segunda`
  - Agregar columnas `faltas_visitante_primera`, `faltas_visitante_segunda`
  - En tabla `estadisticas_partidos`

- [ ] Modificar endpoint `/api/partidos/:id/finalizar` para recibir:
  ```javascript
  {
    faltasLocalPrimera: number,
    faltasLocalSegunda: number,
    faltasVisitantePrimera: number,
    faltasVisitanteSegunda: number
  }
  ```

### Frontend

- [ ] Enviar faltas por período en `handleFinalizarPartido`
- [ ] Agregar indicador visual del período actual en el marcador
- [ ] Persistir estado del partido en localStorage (por si recarga página)
- [ ] Agregar sonidos para confirmaciones y timeouts

## Testing Recomendado

1. **Flujo completo:**

   - Crear partido
   - Intentar iniciar sin 5 jugadores (debe fallar)
   - Colocar 5 jugadores
   - Iniciar partido
   - Verificar que botones se habilitan
   - Registrar gol (debe pedir confirmación)
   - Esperar 5 segundos sin confirmar (debe cancelar)
   - Registrar falta en primera parte
   - Finalizar primera parte
   - Verificar que faltas se resetean visualmente
   - Iniciar segunda parte
   - Registrar falta en segunda parte
   - Verificar que faltas totales = primera + segunda
   - Finalizar partido

2. **Edge cases:**
   - Intentar decrementar goles a -1 (debe estar disabled)
   - Intentar usar deshacer en configuración (debe estar disabled)
   - Verificar que deshacer respeta el período correcto
   - Cancelar confirmaciones manualmente

## Notas Técnicas

- Se usa `Date.now()` para timestamps precisos
- El intervalo del countdown es 100ms para suavidad visual
- Los estados se persisten en React state (no localStorage aún)
- Las animaciones usan Tailwind CSS transitions
- El cronómetro se maneja en dos lugares (Marcador UI y ConfigurarPartido lógica)

## Autor

GitHub Copilot - Implementación completa del flujo de partido según especificaciones del usuario
