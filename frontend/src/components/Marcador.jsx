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

  return (
    <div className="bg-black rounded-2xl shadow-2xl p-6 mb-6 border-8 border-gray-900 w-full mx-auto">
      <div className="flex items-center justify-between gap-8 px-2">
        {/* Equipo Local */}
        <div className="flex flex-col items-center gap-2 min-w-0">
          <h3 className="text-white text-sm font-bold uppercase tracking-widest whitespace-nowrap">
            {equipoLocal}
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={decrementarLocal}
              className="bg-red-600 hover:bg-red-700 text-white font-bold text-xl w-12 h-12 rounded-md shadow-lg transition-all flex items-center justify-center flex-shrink-0"
            >
              -
            </button>
            <div
              className={`bg-black text-yellow-400 text-5xl font-bold py-3 px-4 rounded-lg border-2 border-gray-700 w-[110px] h-[80px] flex items-center justify-center transition-all duration-300 tabular-nums flex-shrink-0 ${
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
            <button
              onClick={incrementarLocal}
              className="bg-green-600 hover:bg-green-700 text-white font-bold text-xl w-12 h-12 rounded-md shadow-lg transition-all flex items-center justify-center flex-shrink-0"
            >
              +
            </button>
          </div>
        </div>

        {/* Cronómetro con indicadores de faltas */}
        <div className="flex flex-col items-center gap-3 flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* Indicador de faltas LOCAL - 5 bolas blancas */}
            <div
              className={`flex flex-col gap-1.5 transition-all duration-300 ${
                flashFaltasLocal ? "scale-110" : ""
              }`}
            >
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
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
              className="bg-black text-red-500 text-5xl font-bold px-6 py-5 rounded-xl border-4 border-gray-800 w-[220px] h-[90px] flex items-center justify-center tabular-nums"
              style={{
                fontFamily: "'Orbitron', monospace",
                letterSpacing: "0.12em",
                textShadow:
                  "0 0 15px rgba(239, 68, 68, 0.9), 0 0 30px rgba(239, 68, 68, 0.6)",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {String(minutos).padStart(2, "0")}:
              {String(segundos).padStart(2, "0")}
            </div>

            {/* Indicador de faltas VISITANTE - 5 bolas blancas */}
            <div
              className={`flex flex-col gap-1.5 transition-all duration-300 ${
                flashFaltasVisitante ? "scale-110" : ""
              }`}
            >
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
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

          {/* Botones de control debajo del cronómetro */}
          <div className="flex justify-center gap-2">
            <button
              onClick={iniciarPausar}
              className={`${
                corriendo
                  ? "bg-yellow-500 hover:bg-yellow-600"
                  : "bg-green-500 hover:bg-green-600"
              } text-white font-semibold px-6 py-1.5 rounded text-sm shadow-lg transition-all`}
            >
              {corriendo ? "⏸ Pausar" : "▶ Iniciar"}
            </button>
            <button
              onClick={reiniciar}
              className="bg-gray-600 hover:bg-gray-700 text-white font-semibold px-4 py-1.5 rounded text-sm shadow-lg transition-all"
            >
              ⟲ Reset
            </button>
          </div>
        </div>

        {/* Equipo Visitante */}
        <div className="flex flex-col items-center gap-2 min-w-0">
          <h3 className="text-white text-sm font-bold uppercase tracking-widest whitespace-nowrap">
            {equipoVisitante}
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={decrementarVisitante}
              className="bg-red-600 hover:bg-red-700 text-white font-bold text-xl w-12 h-12 rounded-md shadow-lg transition-all flex items-center justify-center flex-shrink-0"
            >
              -
            </button>
            <div
              className={`bg-black text-yellow-400 text-5xl font-bold py-3 px-4 rounded-lg border-2 border-gray-700 w-[110px] h-[80px] flex items-center justify-center transition-all duration-300 tabular-nums flex-shrink-0 ${
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
            <button
              onClick={incrementarVisitante}
              className="bg-green-600 hover:bg-green-700 text-white font-bold text-xl w-12 h-12 rounded-md shadow-lg transition-all flex items-center justify-center flex-shrink-0"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Marcador;
