import React from "react";

const BotonesAccion = ({
  deshacer,
  historialAcciones,
  estadoPartido,
  handleDragOver,
  handleAccionDrop,
  setPosicionSeleccionada,
  setAccionActiva,
  accionActiva,
}) => {
  return (
    <div className="flex justify-center items-center gap-3">
      <button
        onClick={deshacer}
        disabled={
          historialAcciones.length === 0 || estadoPartido === "configuracion"
        }
        className="w-24 h-[74px] bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-lg shadow-lg transition-all hover:scale-105 flex flex-col items-center justify-center cursor-pointer border-2 border-transparent hover:border-white"
      >
        <svg
          className="w-10 h-10"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
          />
        </svg>
      </button>
      <div
        onDragOver={handleDragOver}
        onDrop={(e) => handleAccionDrop(e, "gol")}
        onClick={() => {
          setPosicionSeleccionada(null);
          setAccionActiva(accionActiva === "gol" ? null : "gol");
        }}
        className={`w-24 h-[74px] bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg shadow-lg transition-all flex flex-col items-center justify-center gap-2 cursor-pointer border-2 ${
          accionActiva === "gol"
            ? "ring-4 ring-green-300 scale-125 border-white shadow-2xl"
            : "border-transparent hover:border-white hover:scale-105"
        } ${
          accionActiva === "gol"
            ? "animate-[pulse_0.8s_ease-in-out_infinite]"
            : ""
        }`}
        style={{
          animation:
            accionActiva === "gol" ? "pulse 0.8s ease-in-out infinite" : "none",
        }}
        title={
          accionActiva === "gol"
            ? "Click en un jugador para anotar gol"
            : "Click para activar o arrastra jugador aquí"
        }
      >
        <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
        </svg>
      </div>
      <div
        onDragOver={handleDragOver}
        onDrop={(e) => handleAccionDrop(e, "falta")}
        onClick={() => {
          setPosicionSeleccionada(null);
          setAccionActiva(accionActiva === "falta" ? null : "falta");
        }}
        className={`w-24 h-[74px] bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg shadow-lg transition-all flex flex-col items-center justify-center gap-2 cursor-pointer border-2 ${
          accionActiva === "falta"
            ? "ring-4 ring-orange-300 scale-125 border-white shadow-2xl"
            : "border-transparent hover:border-white hover:scale-105"
        } ${
          accionActiva === "falta"
            ? "animate-[pulse_0.8s_ease-in-out_infinite]"
            : ""
        }`}
        style={{
          animation:
            accionActiva === "falta"
              ? "pulse 0.8s ease-in-out infinite"
              : "none",
        }}
        title={
          accionActiva === "falta"
            ? "Click en un jugador para anotar falta"
            : "Click para activar o arrastra jugador aquí"
        }
      >
        <svg
          className="w-10 h-10"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <div
        onDragOver={handleDragOver}
        onDrop={(e) => handleAccionDrop(e, "amarilla")}
        onClick={() => {
          setPosicionSeleccionada(null);
          setAccionActiva(accionActiva === "amarilla" ? null : "amarilla");
        }}
        className={`w-24 h-[74px] bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-bold rounded-lg shadow-lg transition-all flex flex-col items-center justify-center gap-2 cursor-pointer border-2 ${
          accionActiva === "amarilla"
            ? "ring-4 ring-yellow-300 scale-125 border-gray-800 shadow-2xl"
            : "border-transparent hover:border-gray-800 hover:scale-105"
        } ${
          accionActiva === "amarilla"
            ? "animate-[pulse_0.8s_ease-in-out_infinite]"
            : ""
        }`}
        style={{
          animation:
            accionActiva === "amarilla"
              ? "pulse 0.8s ease-in-out infinite"
              : "none",
        }}
        title={
          accionActiva === "amarilla"
            ? "Click en un jugador para tarjeta amarilla"
            : "Click para activar o arrastra jugador aquí"
        }
      >
        <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
          <rect x="6" y="4" width="12" height="16" rx="2" strokeWidth={2} />
        </svg>
      </div>
      <div
        onDragOver={handleDragOver}
        onDrop={(e) => handleAccionDrop(e, "roja")}
        onClick={() => {
          setPosicionSeleccionada(null);
          setAccionActiva(accionActiva === "roja" ? null : "roja");
        }}
        className={`w-24 h-[74px] bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg shadow-lg transition-all flex flex-col items-center justify-center gap-2 cursor-pointer border-2 ${
          accionActiva === "roja"
            ? "ring-4 ring-red-300 scale-125 border-white shadow-2xl"
            : "border-transparent hover:border-white hover:scale-105"
        } ${
          accionActiva === "roja"
            ? "animate-[pulse_0.8s_ease-in-out_infinite]"
            : ""
        }`}
        style={{
          animation:
            accionActiva === "roja"
              ? "pulse 0.8s ease-in-out infinite"
              : "none",
        }}
        title={
          accionActiva === "roja"
            ? "Click en un jugador para tarjeta roja"
            : "Click para activar o arrastra jugador aquí"
        }
      >
        <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
          <rect x="6" y="4" width="12" height="16" rx="2" strokeWidth={2} />
        </svg>
      </div>
    </div>
  );
};

export default BotonesAccion;
