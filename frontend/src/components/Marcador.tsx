import { useState, useEffect } from "react";

interface Jugador {
  id: number;
  nombre: string;
  alias?: string;
  dorsal?: number;
}

interface TiempoMuerto {
  timestampInicio: number;
}

interface Estadisticas {
  [jugadorId: number]: {
    minutos?: number;
    minutosAcumulados?: number;
    goles?: number;
    asistencias?: number;
    amarillas?: number;
    rojas?: number;
  };
}

interface FlashEffect {
  type: "gol" | "falta" | null;
  equipo?: "local" | "visitante";
  jugadorId?: number | null;
  timestamp?: number | null;
}

interface TiemposMuertos {
  primera: boolean;
  segunda: boolean;
}

interface MarcadorProps {
  equipoLocal?: string;
  equipoVisitante?: string;
  onDeshacer?: () => void;
  deshabilitarDeshacer?: boolean;
  golesLocal?: number;
  golesVisitante?: number;
  faltasLocal?: number;
  faltasVisitante?: number;
  onIncrementarGolLocal?: () => void;
  onDecrementarGolLocal?: () => void;
  onIncrementarGolVisitante?: () => void;
  onDecrementarGolVisitante?: () => void;
  onCronometroChange?: () => void;
  cronometroActivo?: boolean;
  tiempoCronometro?: number;
  timestampInicioCronometro?: number | null;
  estadoPartido?: string;
  flashEffect?: FlashEffect;
  jugadoresLocal?: Jugador[];
  jugadoresAsignados?: { [posicion: string]: Jugador | null };
  estadisticas?: Estadisticas;
  onIniciarPartido?: () => void;
  onFinalizarPrimeraParte?: () => void;
  onIniciarSegundaParte?: () => void;
  onFinalizarPartido?: () => void;
  finalizandoPartido?: boolean;
  onTiempoMuertoLocal?: () => void;
  onTiempoMuertoVisitante?: () => void;
  tiemposMuertosLocal?: TiemposMuertos;
  tiemposMuertosVisitante?: TiemposMuertos;
  periodoActual?: number;
  tiempoMuertoActivo?: boolean;
  contadorTiempoMuerto?: TiempoMuerto | null;
}

function Marcador({
  equipoLocal = "LOCAL",
  equipoVisitante = "VISITANTE",
  golesLocal = 0,
  golesVisitante = 0,
  faltasLocal = 0,
  faltasVisitante = 0,
  onIncrementarGolLocal,
  onDecrementarGolLocal,
  onIncrementarGolVisitante,
  onDecrementarGolVisitante,
  onCronometroChange,
  cronometroActivo = false,
  tiempoCronometro = 0,
  timestampInicioCronometro = null,
  estadoPartido = "configuracion",
  flashEffect = { type: null, jugadorId: null, timestamp: null },
  jugadoresLocal = [],
  jugadoresAsignados = {},
  estadisticas = {},
  onIniciarPartido,
  onFinalizarPrimeraParte,
  onIniciarSegundaParte,
  onFinalizarPartido,
  finalizandoPartido = false,
  onTiempoMuertoLocal,
  onTiempoMuertoVisitante,
  tiemposMuertosLocal = { primera: false, segunda: false },
  tiemposMuertosVisitante = { primera: false, segunda: false },
  periodoActual = 1,
  tiempoMuertoActivo = false,
  contadorTiempoMuerto = null,
}: MarcadorProps) {
  const [minutos, setMinutos] = useState<number>(0);
  const [segundos, setSegundos] = useState<number>(0);
  const [corriendo, setCorriendo] = useState<boolean>(false);
  const [flashGolLocal, setFlashGolLocal] = useState<boolean>(false);
  const [flashGolVisitante, setFlashGolVisitante] = useState<boolean>(false);
  const [flashFaltasLocal, setFlashFaltasLocal] = useState<boolean>(false);
  const [flashFaltasVisitante, setFlashFaltasVisitante] =
    useState<boolean>(false);

  // Estados para tiempo muerto
  const [segundosTiempoMuerto, setSegundosTiempoMuerto] = useState<number>(0);

  // Sincronizar cronometroActivo del padre con el estado local
  useEffect(() => {
    setCorriendo(cronometroActivo);
  }, [cronometroActivo]);

  // Actualizar el cronómetro visual basado en el tiempo del padre
  useEffect(() => {
    if (cronometroActivo && timestampInicioCronometro) {
      // Actualizar cada 100ms para mayor precisión
      const intervalo = setInterval(() => {
        const tiempoTranscurrido =
          (Date.now() - timestampInicioCronometro) / 1000;
        const tiempoTotal = tiempoCronometro + tiempoTranscurrido;

        setMinutos(Math.floor(tiempoTotal / 60));
        setSegundos(Math.floor(tiempoTotal % 60));
      }, 100);

      return () => clearInterval(intervalo);
    } else if (!cronometroActivo) {
      // Cuando está pausado, mostrar el tiempo acumulado
      setMinutos(Math.floor(tiempoCronometro / 60));
      setSegundos(Math.floor(tiempoCronometro % 60));
    }
  }, [cronometroActivo, tiempoCronometro, timestampInicioCronometro]);

  // Actualizar contador de tiempo muerto
  useEffect(() => {
    if (tiempoMuertoActivo && contadorTiempoMuerto) {
      const intervalo = setInterval(() => {
        const tiempoTranscurrido =
          (Date.now() - contadorTiempoMuerto.timestampInicio) / 1000;
        const segundosRestantes = Math.max(
          0,
          60 - Math.floor(tiempoTranscurrido)
        );
        setSegundosTiempoMuerto(segundosRestantes);
      }, 100);

      return () => clearInterval(intervalo);
    } else {
      setSegundosTiempoMuerto(0);
    }
  }, [tiempoMuertoActivo, contadorTiempoMuerto]);

  // Efecto para detectar animaciones de gol/falta
  useEffect(() => {
    if (flashEffect.type === "gol" && flashEffect.timestamp) {
      if (flashEffect.equipo === "visitante") {
        setFlashGolVisitante(true);
        setTimeout(() => setFlashGolVisitante(false), 500);
      } else {
        setFlashGolLocal(true);
        setTimeout(() => setFlashGolLocal(false), 500);
      }
    } else if (flashEffect.type === "falta" && flashEffect.timestamp) {
      if (flashEffect.equipo === "visitante") {
        setFlashFaltasVisitante(true);
        setTimeout(() => setFlashFaltasVisitante(false), 500);
      } else {
        setFlashFaltasLocal(true);
        setTimeout(() => setFlashFaltasLocal(false), 500);
      }
    }
  }, [flashEffect.timestamp]);

  const iniciarPausar = () => {
    // Llamar a la función del padre que maneja la confirmación
    if (onCronometroChange) {
      onCronometroChange();
    }
  };

  const reiniciar = () => {
    if (estadoPartido === "configuracion") {
      return; // No permitir resetear en estado de configuración
    }

    const confirmar = confirm(
      "¿Resetear el cronómetro a 0?\n\nEsto no afectará las estadísticas registradas."
    );
    if (!confirmar) return;

    setCorriendo(false);
    setMinutos(0);
    setSegundos(0);
  };

  // Calcular minutos jugados de cada jugador
  const calcularMinutos = (jugadorId: number): number => {
    const stats = estadisticas[jugadorId];
    if (!stats) return 0;

    // Si está en pista, usar minutos actuales, si no, usar minutos acumulados
    const estaEnPista = Object.values(jugadoresAsignados).some(
      (j) => j && j.id === jugadorId
    );
    return Math.floor(
      estaEnPista ? stats.minutos || 0 : stats.minutosAcumulados || 0
    );
  };

  // Obtener jugadores en pista ordenados por alias
  const jugadoresEnPista = jugadoresLocal
    .filter((j) =>
      Object.values(jugadoresAsignados).some((ja) => ja && ja.id === j.id)
    )
    .sort((a, b) => (a.alias || a.nombre).localeCompare(b.alias || b.nombre));

  return (
    <div className="bg-black rounded-2xl shadow-2xl p-6 mb-6 border-8 border-gray-900 w-full mx-auto">
      <div className="flex items-start justify-between gap-6">
        {/* Sección LOCAL */}
        <div className="flex flex-col items-center gap-3 min-w-0">
          <div className="flex items-center gap-3">
            {/* Botón Tiempo Muerto LOCAL - a la izquierda del marcador */}
            {estadoPartido !== "configuracion" &&
              estadoPartido !== "finalizado" &&
              !tiemposMuertosLocal[
                periodoActual === 1 ? "primera" : "segunda"
              ] && (
                <button
                  onClick={onTiempoMuertoLocal}
                  disabled={tiempoMuertoActivo}
                  className="bg-white hover:bg-gray-100 text-blue-600 font-bold text-2xl w-14 h-14 rounded-md shadow-lg transition-all flex items-center justify-center flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
                  title={`Tiempo Muerto ${
                    periodoActual === 1 ? "1ª" : "2ª"
                  } Parte`}
                >
                  ⏸️
                </button>
              )}

            {/* Marcador más grande */}
            <div
              className={`bg-black text-yellow-400 text-8xl font-bold py-6 px-6 rounded-xl border-3 border-gray-700 w-[150px] h-[120px] flex items-center justify-center transition-all duration-300 tabular-nums flex-shrink-0 ${
                flashGolLocal
                  ? "scale-105 text-yellow-300 shadow-2xl shadow-yellow-400/50"
                  : ""
              }`}
              style={{
                fontFamily: "'Orbitron', monospace",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {String(golesLocal).padStart(2, "0")}
            </div>
          </div>
          <img
            src="/img/logocupula.jpg"
            alt={equipoLocal}
            className="w-14 h-14 rounded-full object-cover"
          />
          <div className="flex justify-center gap-2">
            <button
              onClick={onIncrementarGolLocal}
              disabled={estadoPartido === "configuracion"}
              className="hidden bg-green-600 hover:bg-green-700 text-white font-bold text-2xl w-14 h-14 rounded-md shadow-lg transition-all flex items-center justify-center flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              +
            </button>
            <button
              onClick={onDecrementarGolLocal}
              disabled={estadoPartido === "configuracion" || golesLocal === 0}
              className="hidden bg-red-600 hover:bg-red-700 text-white font-bold text-2xl w-14 h-14 rounded-md shadow-lg transition-all flex items-center justify-center flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              -
            </button>
          </div>
        </div>

        {/* Sección CENTRAL - Lista de jugadores en pista */}
        <div className="flex-1 flex flex-col items-center gap-4">
          {/* Cronómetro */}
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-5">
              {/* Faltas LOCAL */}
              <div
                className={`flex flex-col gap-2 transition-all duration-300 ${
                  flashFaltasLocal ? "scale-110" : ""
                }`}
              >
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className={`w-4 h-4 rounded-full transition-all duration-300 ${
                      i <= faltasLocal
                        ? "bg-white shadow-md shadow-white/70"
                        : "bg-gray-800 border border-gray-700"
                    } ${
                      flashFaltasLocal && i === faltasLocal
                        ? "shadow-lg shadow-white"
                        : ""
                    }`}
                  ></div>
                ))}
              </div>

              {/* Cronómetro LED */}
              <div
                className={`${
                  tiempoMuertoActivo
                    ? "bg-white text-black"
                    : "bg-black text-red-500"
                } text-8xl font-bold px-6 py-5 rounded-2xl border-4 border-gray-800 w-[420px] h-[120px] flex items-center justify-center tabular-nums transition-colors duration-300`}
                style={{
                  fontFamily: "'Orbitron', monospace",
                  letterSpacing: "0.12em",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {tiempoMuertoActivo ? (
                  <>00:{String(segundosTiempoMuerto).padStart(2, "0")}</>
                ) : (
                  <>
                    {String(minutos).padStart(2, "0")}:
                    {String(segundos).padStart(2, "0")}
                  </>
                )}
              </div>

              {/* Faltas VISITANTE */}
              <div
                className={`flex flex-col gap-2 transition-all duration-300 ${
                  flashFaltasVisitante ? "scale-110" : ""
                }`}
              >
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className={`w-4 h-4 rounded-full transition-all duration-300 ${
                      i <= faltasVisitante
                        ? "bg-white shadow-md shadow-white/70"
                        : "bg-gray-800 border border-gray-700"
                    } ${
                      flashFaltasVisitante && i === faltasVisitante
                        ? "shadow-lg shadow-white"
                        : ""
                    }`}
                  ></div>
                ))}
              </div>
            </div>

            {/* Botones de control */}
            <div className="flex justify-center gap-2">
              {estadoPartido === "configuracion" ? (
                <button
                  onClick={onIniciarPartido}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold px-8 py-3 rounded-lg text-2xl shadow-xl transition-all transform hover:scale-105 flex items-center gap-3"
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
                      strokeWidth={2.5}
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Iniciar Partido
                </button>
              ) : (
                <>
                  <button
                    onClick={iniciarPausar}
                    className={`${
                      corriendo
                        ? "bg-yellow-500 hover:bg-yellow-600"
                        : "bg-green-500 hover:bg-green-600"
                    } text-white font-semibold px-6 py-1.5 rounded text-xl w-36 h-14 shadow-lg transition-all`}
                  >
                    {corriendo ? "⏸ Pausar" : "▶ Iniciar"}
                  </button>
                  {estadoPartido === "primera_parte" &&
                    onFinalizarPrimeraParte && (
                      <button
                        onClick={onFinalizarPrimeraParte}
                        className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-1.5 rounded text-xl w-60 h-14 shadow-lg transition-all whitespace-nowrap"
                      >
                        🏁 Finalizar 1ª Parte
                      </button>
                    )}
                  {estadoPartido === "descanso" && onIniciarSegundaParte && (
                    <button
                      onClick={onIniciarSegundaParte}
                      className="bg-purple-500 hover:bg-purple-600 text-white font-semibold px-6 py-1.5 rounded text-xl w-60 h-14 shadow-lg transition-all whitespace-nowrap"
                    >
                      ▶ Iniciar 2ª Parte
                    </button>
                  )}
                  {estadoPartido === "segunda_parte" && onFinalizarPartido && (
                    <button
                      onClick={onFinalizarPartido}
                      disabled={finalizandoPartido}
                      className={`font-semibold px-6 py-1.5 rounded text-xl w-60 h-14 shadow-lg transition-all whitespace-nowrap ${
                        finalizandoPartido
                          ? "bg-gray-400 cursor-not-allowed opacity-60"
                          : "bg-green-600 hover:bg-green-700 text-white"
                      }`}
                    >
                      {finalizandoPartido
                        ? "⏳ Finalizando..."
                        : "✅ Finalizar Partido"}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Sección VISITANTE */}
        <div className="flex flex-col items-center gap-3 min-w-0">
          <div className="flex items-center gap-3">
            {/* Marcador más grande */}
            <div
              className={`bg-black text-yellow-400 text-8xl font-bold py-6 px-6 rounded-xl border-3 border-gray-700 w-[150px] h-[120px] flex items-center justify-center transition-all duration-300 tabular-nums flex-shrink-0 ${
                flashGolVisitante
                  ? "scale-105 text-yellow-300 shadow-2xl shadow-yellow-400/50"
                  : ""
              }`}
              style={{
                fontFamily: "'Orbitron', monospace",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {String(golesVisitante).padStart(2, "0")}
            </div>

            {/* Botón Tiempo Muerto VISITANTE - a la derecha del marcador */}
            {estadoPartido !== "configuracion" &&
              estadoPartido !== "finalizado" &&
              !tiemposMuertosVisitante[
                periodoActual === 1 ? "primera" : "segunda"
              ] && (
                <button
                  onClick={onTiempoMuertoVisitante}
                  disabled={tiempoMuertoActivo}
                  className="bg-white hover:bg-gray-100 text-blue-600 font-bold text-2xl w-14 h-14 rounded-md shadow-lg transition-all flex items-center justify-center flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
                  title={`Tiempo Muerto ${
                    periodoActual === 1 ? "1ª" : "2ª"
                  } Parte`}
                >
                  ⏸️
                </button>
              )}
          </div>
          <h3 className="text-white text-2xl font-bold flex items-center justify-center">
            {equipoVisitante}
          </h3>
          <div className="flex justify-center gap-2">
            <button
              onClick={onIncrementarGolVisitante}
              disabled={estadoPartido === "configuracion"}
              className="hidden bg-green-600 hover:bg-green-700 text-white font-bold text-2xl w-14 h-14 rounded-md shadow-lg transition-all flex items-center justify-center flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              +
            </button>
            <button
              onClick={onDecrementarGolVisitante}
              disabled={
                estadoPartido === "configuracion" || golesVisitante === 0
              }
              className="hidden bg-red-600 hover:bg-red-700 text-white font-bold text-2xl w-14 h-14 rounded-md shadow-lg transition-all flex items-center justify-center flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              -
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Marcador;
