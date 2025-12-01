import React from "react";

const AnimacionTarjeta = ({ mostrarTarjeta }) => {
  if (!mostrarTarjeta.visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="relative animate-slideUp">
        {/* Mano sosteniendo la tarjeta o balón */}
        <div className="relative">
          {mostrarTarjeta.tipo === "5faltas" ? (
            /* Mano con 5 dedos para indicar 5 faltas */
            <div className="flex flex-col items-center gap-6 animate-pulse">
              <div className="text-6xl font-bold text-red-600 drop-shadow-lg animate-bounce">
                ¡5 FALTAS!
              </div>

              {/* Mano con 5 dedos extendidos */}
              <div className="relative w-64 h-80 animate-wiggle">
                {/* Palma de la mano */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-40 h-48 bg-gradient-to-b from-amber-500 to-amber-600 rounded-t-full rounded-b-3xl shadow-2xl border-4 border-amber-700"></div>

                {/* Los 5 dedos */}
                {/* Pulgar (izquierda, más bajo) */}
                <div className="absolute bottom-32 left-2 w-10 h-24 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full shadow-xl transform -rotate-45 border-4 border-amber-700">
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    1
                  </div>
                </div>

                {/* Índice */}
                <div className="absolute bottom-48 left-8 w-9 h-32 bg-gradient-to-t from-amber-500 to-amber-600 rounded-full shadow-xl transform -rotate-12 border-4 border-amber-700">
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    2
                  </div>
                </div>

                {/* Medio (el más largo) */}
                <div className="absolute bottom-48 left-1/2 -translate-x-1/2 w-9 h-36 bg-gradient-to-t from-amber-500 to-amber-600 rounded-full shadow-xl border-4 border-amber-700">
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    3
                  </div>
                </div>

                {/* Anular */}
                <div className="absolute bottom-48 right-8 w-9 h-32 bg-gradient-to-t from-amber-500 to-amber-600 rounded-full shadow-xl transform rotate-12 border-4 border-amber-700">
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    4
                  </div>
                </div>

                {/* Meñique (derecha, más corto) */}
                <div className="absolute bottom-44 right-2 w-8 h-28 bg-gradient-to-t from-amber-500 to-amber-600 rounded-full shadow-xl transform rotate-20 border-4 border-amber-700">
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    5
                  </div>
                </div>
              </div>

              <div className="text-4xl font-bold text-white drop-shadow-lg mt-4 bg-red-600 px-8 py-4 rounded-lg shadow-2xl">
                {mostrarTarjeta.equipo === "visitante" ? "VISITANTE" : "LOCAL"}
              </div>
            </div>
          ) : mostrarTarjeta.tipo === "gol" ? (
            /* Balón de fútbol grande para gol */
            <div className="w-56 h-56 animate-bounce-custom">
              <div className="relative w-full h-full bg-white rounded-full shadow-2xl border-4 border-gray-800 flex items-center justify-center">
                {/* Patrón del balón */}
                <svg className="w-full h-full" viewBox="0 0 200 200">
                  <circle
                    cx="100"
                    cy="100"
                    r="95"
                    fill="white"
                    stroke="#000"
                    strokeWidth="3"
                  />
                  {/* Pentágonos negros del balón */}
                  <path
                    d="M100 20 L120 40 L110 65 L90 65 L80 40 Z"
                    fill="#000"
                  />
                  <path
                    d="M180 100 L170 125 L145 135 L130 115 L145 90 Z"
                    fill="#000"
                  />
                  <path
                    d="M100 180 L80 160 L90 135 L110 135 L120 160 Z"
                    fill="#000"
                  />
                  <path
                    d="M20 100 L30 75 L55 65 L70 85 L55 110 Z"
                    fill="#000"
                  />
                  <path
                    d="M145 40 L165 50 L170 75 L150 85 L130 70 Z"
                    fill="#000"
                  />
                  <path d="M55 40 L75 30 L95 35 L90 60 L65 60 Z" fill="#000" />
                </svg>
                {/* Dorsal en el centro del balón */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-7xl font-bold text-green-600 drop-shadow-lg bg-white/90 rounded-full w-28 h-28 flex items-center justify-center border-4 border-green-600">
                    {mostrarTarjeta.dorsal}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Tarjeta amarilla o roja */
            <div
              className={`w-40 h-56 ${
                mostrarTarjeta.tipo === "amarilla"
                  ? "bg-yellow-400"
                  : "bg-red-600"
              } rounded-lg shadow-2xl flex items-center justify-center transform rotate-12 animate-wiggle`}
            >
              <div className="text-8xl font-bold text-white drop-shadow-lg">
                {mostrarTarjeta.dorsal}
              </div>
            </div>
          )}

          {/* Mano (brazo y mano simplificada) - Solo para tarjetas */}
          {mostrarTarjeta.tipo !== "gol" && (
            <div className="absolute -bottom-32 left-1/2 -translate-x-1/2">
              {/* Brazo */}
              <div className="w-16 h-40 bg-gradient-to-b from-amber-700 to-amber-800 rounded-full transform origin-top"></div>
              {/* Muñeca */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-8 bg-amber-700 rounded-full"></div>
              {/* Mano */}
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2">
                <div className="w-20 h-16 bg-amber-600 rounded-full"></div>
                {/* Dedos */}
                <div className="absolute top-0 left-2 w-3 h-12 bg-amber-600 rounded-full transform -rotate-12"></div>
                <div className="absolute top-0 left-6 w-3 h-14 bg-amber-600 rounded-full transform rotate-0"></div>
                <div className="absolute top-0 left-10 w-3 h-13 bg-amber-600 rounded-full transform rotate-0"></div>
                <div className="absolute top-0 right-2 w-3 h-11 bg-amber-600 rounded-full transform rotate-12"></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnimacionTarjeta;
