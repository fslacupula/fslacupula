import { useState, useEffect } from "react";

function Marcador({
  equipoLocal = "LOCAL",
  equipoVisitante = "VISITANTE",
  onDeshacer,
  deshabilitarDeshacer = false,
  golesLocal = 0,
  golesVisitante = 0,
  faltasLocal = 0,
  faltasVisitante = 0,
  setGolesLocal,
  setGolesVisitante,
  onCronometroChange,
  flashEffect = { type: null, jugadorId: null, timestamp: null },
  jugadoresLocal = [],
  jugadoresAsignados = {},
  estadisticas = {},
}) {
  const [minutos, setMinutos] = useState(0);
  const [segundos, setSegundos] = useState(0);
  const [corriendo, setCorriendo] = useState(false);
  const [flashGolLocal, setFlashGolLocal] = useState(false);
  const [flashGolVisitante, setFlashGolVisitante] = useState(false);
  const [flashFaltasLocal, setFlashFaltasLocal] = useState(false);
  const [flashFaltasVisitante, setFlashFaltasVisitante] = useState(false);

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

  useEffect(() => {
    let intervalo;
    if (corriendo) {
      intervalo = setInterval(() => {
        setSegundos((prevSegundos) => {
          if (prevSegundos === 59) {
            setMinutos((prevMinutos) => prevMinutos + 1);
            return 0;
          }
          return prevSegundos + 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalo);
  }, [corriendo]);

  const iniciarPausar = () => {
    const nuevoEstado = !corriendo;
    setCorriendo(nuevoEstado);
    if (onCronometroChange) {
      onCronometroChange(nuevoEstado);
    }
  };

  const reiniciar = () => {
    setCorriendo(false);
    setMinutos(0);
    setSegundos(0);
    if (onCronometroChange) {
      onCronometroChange(false);
    }
  };

  const incrementarLocal = () => setGolesLocal((prev) => prev + 1);
  const decrementarLocal = () => setGolesLocal((prev) => Math.max(0, prev - 1));
  const incrementarVisitante = () => setGolesVisitante((prev) => prev + 1);
  const decrementarVisitante = () =>
    setGolesVisitante((prev) => Math.max(0, prev - 1));

  // Calcular minutos jugados de cada jugador
  const calcularMinutos = (jugadorId) => {
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
          <div className="flex justify-center gap-2">
              <button
                onClick={incrementarLocal}
                className="bg-green-600 hover:bg-green-700 text-white font-bold text-2xl w-14 h-14 rounded-md shadow-lg transition-all flex items-center justify-center flex-shrink-0"
              >
                +
              </button>
              <button
                onClick={decrementarLocal}
                className="bg-red-600 hover:bg-red-700 text-white font-bold text-2xl w-14 h-14 rounded-md shadow-lg transition-all flex items-center justify-center flex-shrink-0"
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
                className="bg-black text-red-500 text-8xl font-bold px-6 py-5 rounded-2xl border-4 border-gray-800 w-[420px] h-[120px] flex items-center justify-center tabular-nums"
                style={{
                  fontFamily: "'Orbitron', monospace",
                  letterSpacing: "0.12em",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {String(minutos).padStart(2, "0")}:
                {String(segundos).padStart(2, "0")}
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
              <button
                onClick={iniciarPausar}
                className={`${
                  corriendo
                    ? "bg-yellow-500 hover:bg-yellow-600"
                    : "bg-green-500 hover:bg-green-600"
                } text-white font-semibold px-6 py-1.5 rounded text-2xl w-40 h-14 shadow-lg transition-all`}
              >
                {corriendo ? "⏸ Pausar" : "▶ Iniciar"}
              </button>
              <button
                onClick={reiniciar}
                className="bg-gray-600 hover:bg-gray-700 text-white font-semibold px-4 py-1.5 rounded text-2xl w-40 h-14 shadow-lg transition-all"
              >
                ⟲ Reset
              </button>
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
          </div>
          <div className="flex justify-center gap-2">
              <button
                onClick={incrementarVisitante}
                className="bg-green-600 hover:bg-green-700 text-white font-bold text-2xl w-14 h-14 rounded-md shadow-lg transition-all flex items-center justify-center flex-shrink-0"
              >
                +
              </button>
              <button
                onClick={decrementarVisitante}
                className="bg-red-600 hover:bg-red-700 text-white font-bold text-2xl w-14 h-14 rounded-md shadow-lg transition-all flex items-center justify-center flex-shrink-0"
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
