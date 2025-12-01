import React from "react";
import BolaStaff from "./BolaStaff";

const PanelJugadoresVisitantes = ({
  handleDropFueraPista,
  handleDragOverFueraPista,
  estadisticas,
  accionActiva,
  handleDragStart,
  ejecutarAccion,
  editandoDorsal,
  setEditandoDorsal,
  obtenerDorsalVisitante,
  jugadoresVisitantesActivos,
  estadoPartido,
  toggleJugadorVisitante,
  dorsalesVisitantes,
  actualizarDorsalVisitanteLegacy,
}) => {
  const renderColumna = (numeros) => {
    return (
      <div className="flex flex-col items-center gap-2">
        {numeros.map((numero) => {
          const dorsalMostrado = obtenerDorsalVisitante(numero);
          const jugadorId = `visitante-${numero}`;
          const stats = estadisticas[jugadorId];
          const tieneAmarilla = stats?.amarillas > 0;
          const tieneRoja = stats?.rojas > 0;
          const estaActivo = jugadoresVisitantesActivos[numero];
          const dorsalPersonalizado = dorsalesVisitantes[numero] !== undefined;

          // Ocultar jugadores desactivados después de iniciar partido
          if (!estaActivo && estadoPartido !== "configuracion") {
            return null;
          }

          return (
            <div
              key={numero}
              draggable={editandoDorsal !== numero && estaActivo}
              onDragStart={(e) => {
                if (editandoDorsal !== numero && estaActivo) {
                  handleDragStart(e, {
                    id: jugadorId,
                    nombre: `Visitante ${dorsalMostrado}`,
                    numero_dorsal: dorsalMostrado,
                  });
                }
              }}
              onDragEnd={(e) => {
                e.target.style.opacity = "1";
              }}
              onClick={() => {
                if (accionActiva && editandoDorsal !== numero && estaActivo) {
                  ejecutarAccion(
                    {
                      id: jugadorId,
                      nombre: `Visitante ${dorsalMostrado}`,
                      numero_dorsal: dorsalMostrado,
                    },
                    accionActiva
                  );
                } else if (!accionActiva && estaActivo) {
                  setEditandoDorsal(numero);
                }
              }}
              className={`relative w-14 h-14 rounded-full border-2 flex items-center justify-center font-bold text-base shadow-lg transition-transform overflow-visible ${
                !estaActivo
                  ? "bg-gray-400 border-gray-500 opacity-50"
                  : dorsalPersonalizado
                  ? "bg-gray-200 border-gray-400 text-gray-700"
                  : "bg-white border-gray-400 text-gray-700"
              } ${
                editandoDorsal === numero
                  ? "border-blue-500"
                  : accionActiva && estaActivo
                  ? "cursor-pointer hover:scale-125 hover:ring-4 hover:ring-orange-300 hover:border-orange-500"
                  : estaActivo
                  ? "hover:scale-110 hover:border-blue-500"
                  : ""
              }`}
              style={{
                cursor:
                  editandoDorsal === numero
                    ? "text"
                    : accionActiva && estaActivo
                    ? "pointer"
                    : estaActivo
                    ? "grab"
                    : "not-allowed",
              }}
              title={
                !estaActivo
                  ? "Jugador desactivado"
                  : editandoDorsal === numero
                  ? `Editando dorsal ${numero}`
                  : accionActiva
                  ? `Click para aplicar ${accionActiva}`
                  : `Visitante ${dorsalMostrado} - Click para editar, arrastra para tarjeta/falta`
              }
            >
              {/* Botón X/✓ para desactivar/activar jugador - solo en configuración */}
              {estadoPartido === "configuracion" &&
                editandoDorsal !== numero && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleJugadorVisitante(numero);
                    }}
                    className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shadow-md z-10 transition-colors ${
                      estaActivo
                        ? "bg-red-500 hover:bg-red-600 text-white"
                        : "bg-green-500 hover:bg-green-600 text-white"
                    }`}
                    title={
                      estaActivo ? "Desactivar jugador" : "Activar jugador"
                    }
                  >
                    {estaActivo ? "×" : "✓"}
                  </button>
                )}
              {editandoDorsal === numero ? (
                <input
                  type="text"
                  defaultValue={dorsalMostrado}
                  onBlur={(e) =>
                    actualizarDorsalVisitanteLegacy(numero, e.target.value)
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      actualizarDorsalVisitanteLegacy(numero, e.target.value);
                    }
                    if (e.key === "Escape") {
                      setEditandoDorsal(null);
                    }
                  }}
                  autoFocus
                  className="w-12 h-12 text-center rounded-full border-2 border-blue-500 text-gray-700 font-bold text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
                  maxLength="3"
                />
              ) : tieneRoja ? (
                <div className="w-6 h-9 bg-red-500 rounded flex items-center justify-center text-white text-sm font-bold shadow-inner">
                  {dorsalMostrado}
                </div>
              ) : tieneAmarilla ? (
                <div className="w-6 h-9 bg-yellow-400 rounded flex items-center justify-center text-gray-800 text-sm font-bold shadow-inner">
                  {dorsalMostrado}
                </div>
              ) : (
                dorsalMostrado
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div
      className="flex-shrink-0 flex flex-col items-center"
      onDrop={handleDropFueraPista}
      onDragOver={handleDragOverFueraPista}
    >
      {/* Bolas de Staff Técnico visitante encima de jugadores - 1 fila */}
      <div className="flex justify-center gap-2 mb-3">
        {/* Entrenador */}
        <BolaStaff
          id="staff-visitante-E"
          letra="E"
          nombre="Entrenador Visitante"
          estadisticas={estadisticas}
          accionActiva={accionActiva}
          handleDragStart={handleDragStart}
          ejecutarAccion={ejecutarAccion}
        />
        {/* Delegado */}
        <BolaStaff
          id="staff-visitante-D"
          letra="D"
          nombre="Delegado Visitante"
          estadisticas={estadisticas}
          accionActiva={accionActiva}
          handleDragStart={handleDragStart}
          ejecutarAccion={ejecutarAccion}
        />
        {/* Auxiliar */}
        <BolaStaff
          id="staff-visitante-A"
          letra="A"
          nombre="Auxiliar Visitante"
          estadisticas={estadisticas}
          accionActiva={accionActiva}
          handleDragStart={handleDragStart}
          ejecutarAccion={ejecutarAccion}
        />
      </div>

      <div className="flex gap-2">
        {/* Columna 1: números 1-4 */}
        {renderColumna([1, 2, 3, 4])}
        {/* Columna 2: números 5-8 */}
        {renderColumna([5, 6, 7, 8])}
        {/* Columna 3: números 9-12 */}
        {renderColumna([9, 10, 11, 12])}
      </div>
    </div>
  );
};

export default PanelJugadoresVisitantes;
