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
    <div className="bg-gradient-to-r from-blue-900 to-blue-700 rounded-lg shadow-xl p-6 mb-6">
      <div className="flex items-center justify-between gap-4">
        {/* Equipo Local */}
        <div className="flex-1 text-center">
          <h3 className="text-white text-xl font-bold mb-2 uppercase tracking-wide">
            {equipoLocal}
          </h3>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={decrementarLocal}
              className="bg-red-500 hover:bg-red-600 text-white font-bold text-2xl px-4 py-6 rounded-lg shadow-lg transition-all"
            >
              -
            </button>
            <div
              className={`bg-white text-gray-900 text-5xl font-bold px-6 py-4 rounded-lg shadow-inner min-w-[100px] transition-all duration-300 ${
                flashGolLocal ? "scale-125 bg-yellow-300 shadow-2xl" : ""
              }`}
            >
              {golesLocal}
            </div>
            <button
              onClick={incrementarLocal}
              className="bg-green-500 hover:bg-green-600 text-white font-bold text-2xl px-4 py-6 rounded-lg shadow-lg transition-all"
            >
              +
            </button>
          </div>
          {/* Indicador de faltas - 5 bolas */}
          <div
            className={`flex gap-1 mt-2 justify-center transition-all duration-300 ${
              flashFaltasLocal ? "scale-110" : ""
            }`}
          >
            {[1, 2, 3, 4, 5].map((i) => {
              let bgColor = "";
              let borderColor = "";
              if (i <= 3) {
                bgColor = i <= faltasLocal ? "bg-green-500" : "bg-green-500/30";
                borderColor = "border-green-700";
              } else if (i === 4) {
                bgColor =
                  i <= faltasLocal ? "bg-yellow-500" : "bg-yellow-500/30";
                borderColor = "border-yellow-600";
              } else {
                bgColor = i <= faltasLocal ? "bg-red-500" : "bg-red-500/30";
                borderColor = "border-red-700";
              }
              return (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-full border-2 ${bgColor} ${borderColor} transition-all duration-300 ${
                    flashFaltasLocal && i === faltasLocal
                      ? "shadow-lg shadow-white"
                      : ""
                  }`}
                ></div>
              );
            })}
          </div>
        </div>

        {/* Cronómetro en el centro */}
        <div className="flex flex-col items-center gap-2">
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
              className="bg-gray-500 hover:bg-gray-600 text-white font-semibold px-3 py-1 rounded text-xs shadow-lg transition-all"
            >
              ⟲ Reset
            </button>
          </div>
          <div className="bg-white text-gray-900 text-6xl font-bold px-8 py-6 rounded-lg shadow-inner min-w-[180px] text-center">
            {String(minutos).padStart(2, "0")}:
            {String(segundos).padStart(2, "0")}
          </div>
        </div>

        {/* Equipo Visitante */}
        <div className="flex-1 text-center">
          <h3 className="text-white text-xl font-bold mb-2 uppercase tracking-wide">
            {equipoVisitante}
          </h3>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={decrementarVisitante}
              className="bg-red-500 hover:bg-red-600 text-white font-bold text-2xl px-4 py-6 rounded-lg shadow-lg transition-all"
            >
              -
            </button>
            <div
              className={`bg-white text-gray-900 text-5xl font-bold px-6 py-4 rounded-lg shadow-inner min-w-[100px] transition-all duration-300 ${
                flashGolVisitante ? "scale-125 bg-yellow-300 shadow-2xl" : ""
              }`}
            >
              {golesVisitante}
            </div>
            <button
              onClick={incrementarVisitante}
              className="bg-green-500 hover:bg-green-600 text-white font-bold text-2xl px-4 py-6 rounded-lg shadow-lg transition-all"
            >
              +
            </button>
          </div>
          {/* Indicador de faltas - 5 bolas */}
          <div
            className={`flex gap-1 mt-2 justify-center transition-all duration-300 ${
              flashFaltasVisitante ? "scale-110" : ""
            }`}
          >
            {[1, 2, 3, 4, 5].map((i) => {
              let bgColor = "";
              let borderColor = "";
              if (i <= 3) {
                bgColor =
                  i <= faltasVisitante ? "bg-green-500" : "bg-green-500/30";
                borderColor = "border-green-700";
              } else if (i === 4) {
                bgColor =
                  i <= faltasVisitante ? "bg-yellow-500" : "bg-yellow-500/30";
                borderColor = "border-yellow-600";
              } else {
                bgColor = i <= faltasVisitante ? "bg-red-500" : "bg-red-500/30";
                borderColor = "border-red-700";
              }
              return (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-full border-2 ${bgColor} ${borderColor} transition-all duration-300 ${
                    flashFaltasVisitante && i === faltasVisitante
                      ? "shadow-lg shadow-white"
                      : ""
                  }`}
                ></div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Marcador;
