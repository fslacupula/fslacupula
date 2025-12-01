import React from "react";

const ModalAlertaJugadoresFaltantes = ({ visible, onClose }) => {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-red-600 bg-opacity-95 flex items-center justify-center z-[60] p-4 animate-pulse">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full p-12 border-8 border-red-600">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-32 h-32 bg-red-100 rounded-full mb-6 animate-bounce">
            <svg
              className="w-20 h-20 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="text-6xl font-black text-red-600 mb-6 uppercase tracking-wider">
            ¡CUIDADOOOOOO!
          </h3>
          <p className="text-4xl font-bold text-gray-800 mb-8">
            TE FALTAN JUGADORES EN PISTA
          </p>
          <div className="bg-red-50 border-4 border-red-300 rounded-xl p-6 mb-8">
            <p className="text-2xl font-semibold text-red-800">
              ⚠️ Debes tener 5 jugadores en pista en todo momento
            </p>
          </div>
          <button
            onClick={onClose}
            className="px-12 py-6 bg-red-600 text-white text-2xl font-bold rounded-xl hover:bg-red-700 transition-colors shadow-lg"
          >
            ¡ENTENDIDO!
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalAlertaJugadoresFaltantes;
