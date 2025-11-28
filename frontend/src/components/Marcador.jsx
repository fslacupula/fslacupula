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
    <div className="bg-black rounded-lg shadow-xl p-6 mb-6 border-4 border-gray-800">
      <div className="flex items-center justify-between gap-6">
        {/* Equipo Local */}
        <div className="flex-1 text-center">
          <h3 className="text-white text-xl font-bold mb-3 uppercase tracking-wider">
            {equipoLocal}
          </h3>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={decrementarLocal}
              className="bg-red-600 hover:bg-red-700 text-white font-bold text-2xl px-4 py-6 rounded-lg shadow-lg transition-all"
            >
              -
            </button>
            <div
              className={`bg-black text-yellow-400 text-6xl font-bold px-6 py-4 rounded-lg shadow-inner min-w-[100px] border-2 border-gray-700 transition-all duration-300 ${
                flashGolLocal ? "scale-125 text-yellow-300 shadow-2xl shadow-yellow-400/50" : ""
              }`}
              style={{ fontFamily: "'Orbitron', monospace", letterSpacing: '0.1em' }}
            >
              {String(golesLocal).padStart(2, '0')}
            </div>
            <button
              onClick={incrementarLocal}
              className="bg-green-600 hover:bg-green-700 text-white font-bold text-2xl px-4 py-6 rounded-lg shadow-lg transition-all"
            >
              +
            </button>
          </div>
        </div>

        {/* Cronómetro en el centro con faltas a los lados */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex gap-2">
            <button
              onClick={iniciarPausar}
              className={`${
                corriendo
                  ? "bg-yellow-500 hover:bg-yellow-600"
                  : "bg-green-500 hover:bg-green-600"
              } text-white font-semibold px-10 py-2 rounded text-xs shadow-lg transition-all`}
            >
              {corriendo ? "⏸ Pausar" : "▶ Iniciar"}
            </button>
            <button
              onClick={reiniciar}
              className="bg-gray-600 hover:bg-gray-700 text-white font-semibold px-3 py-1 rounded text-xs shadow-lg transition-all"
            >
              ⟲ Reset
            </button>
          </div>
          
          {/* Cronómetro con indicadores de faltas */}
          <div className="flex items-center gap-4">
            {/* Indicador de faltas LOCAL - 5 bolas blancas */}
            <div
              className={`flex flex-col gap-1 transition-all duration-300 ${
                flashFaltasLocal ? "scale-110" : ""
              }`}
            >
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full border-2 transition-all duration-300 ${
                    i <= faltasLocal 
                      ? "bg-white border-white shadow-lg shadow-white/50" 
                      : "bg-gray-800 border-gray-600"
                  } ${
                    flashFaltasLocal && i === faltasLocal
                      ? "shadow-xl shadow-white"
                      : ""
                  }`}
                ></div>
              ))}
            </div>

            {/* Cronómetro LED */}
            <div 
              className="bg-black text-red-500 text-7xl font-bold px-10 py-8 rounded-lg shadow-inner min-w-[220px] text-center border-4 border-gray-800"
              style={{ 
                fontFamily: "'Orbitron', monospace", 
                letterSpacing: '0.15em',
                textShadow: '0 0 10px rgba(239, 68, 68, 0.8), 0 0 20px rgba(239, 68, 68, 0.5)'
              }}
            >
              {String(minutos).padStart(2, "0")}:{String(segundos).padStart(2, "0")}
            </div>

            {/* Indicador de faltas VISITANTE - 5 bolas blancas */}
            <div
              className={`flex flex-col gap-1 transition-all duration-300 ${
                flashFaltasVisitante ? "scale-110" : ""
              }`}
            >
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full border-2 transition-all duration-300 ${
                    i <= faltasVisitante 
                      ? "bg-white border-white shadow-lg shadow-white/50" 
                      : "bg-gray-800 border-gray-600"
                  } ${
                    flashFaltasVisitante && i === faltasVisitante
                      ? "shadow-xl shadow-white"
                      : ""
                  }`}
                ></div>
              ))}
            </div>
          </div>
        </div>

        {/* Equipo Visitante */}
        <div className="flex-1 text-center">
          <h3 className="text-white text-xl font-bold mb-3 uppercase tracking-wider">
            {equipoVisitante}
          </h3>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={decrementarVisitante}
              className="bg-red-600 hover:bg-red-700 text-white font-bold text-2xl px-4 py-6 rounded-lg shadow-lg transition-all"
            >
              -
            </button>
            <div
              className={`bg-black text-yellow-400 text-6xl font-bold px-6 py-4 rounded-lg shadow-inner min-w-[100px] border-2 border-gray-700 transition-all duration-300 ${
                flashGolVisitante ? "scale-125 text-yellow-300 shadow-2xl shadow-yellow-400/50" : ""
              }`}
              style={{ fontFamily: "'Orbitron', monospace", letterSpacing: '0.1em' }}
            >
              {String(golesVisitante).padStart(2, '0')}
            </div>
            <button
              onClick={incrementarVisitante}
              className="bg-green-600 hover:bg-green-700 text-white font-bold text-2xl px-4 py-6 rounded-lg shadow-lg transition-all"
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
