export default function MarcadorPartido({
  partido,
  estadisticas,
  jugadores,
  historial,
  tarjetasAmarillasLocal,
  tarjetasRojasLocal,
  tarjetasAmarillasVisitante,
  tarjetasRojasVisitante,
}) {
  return (
    <div className="mt-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
      {/* Fila superior con grid de 7 columnas */}
      <div className="grid grid-cols-7 gap-4 mb-6">
        {/* Col 1: LOCAL + Marcador */}
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">LOCAL</h2>
          <p className="text-7xl font-bold">{estadisticas.goles_local}</p>
        </div>

        {/* Col 2: Goleadores locales */}
        <div className="text-sm space-y-1">
          {estadisticas.goles_local > 0 && (
            <>
              <p className="font-bold mb-1 text-center">Goleadores</p>
              {historial
                .filter(
                  (accion) =>
                    accion.accion === "gol" && accion.equipo === "local"
                )
                .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
                .map((gol, idx) => {
                  const jugador = jugadores.find(
                    (j) => j.jugador_id === gol.jugador_id
                  );
                  const minuto = gol.minuto_partido || gol.minuto || 0;
                  return (
                    <div key={idx} className="flex items-center gap-1">
                      <span>⚽</span>
                      <span className="font-semibold text-xs">
                        {jugador?.jugador_nombre_completo || `#${gol.dorsal}`}
                      </span>
                      <span className="text-blue-200 text-xs">({minuto}')</span>
                    </div>
                  );
                })}
            </>
          )}
        </div>

        {/* Col 3: Tarjetas locales */}
        <div className="text-sm space-y-1">
          <p className="font-bold mb-1 text-center">Tarjetas</p>
          {historial
            .filter(
              (accion) =>
                (accion.accion === "amarilla" || accion.accion === "roja") &&
                accion.equipo === "local"
            )
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
            .map((tarjeta, idx) => {
              const jugador = jugadores.find(
                (j) => j.jugador_id === tarjeta.jugador_id
              );
              const minuto = tarjeta.minuto_partido || tarjeta.minuto || 0;
              return (
                <div key={idx} className="flex items-center gap-1">
                  <span>{tarjeta.accion === "amarilla" ? "🟨" : "🟥"}</span>
                  <span className="font-semibold text-xs">
                    {jugador?.alias ||
                      jugador?.jugador_nombre_completo ||
                      tarjeta.jugador_nombre ||
                      `#${tarjeta.dorsal}`}
                  </span>
                  <span className="text-blue-200 text-xs">({minuto}')</span>
                </div>
              );
            })}
        </div>

        {/* Col 4: Centro - separador */}
        <div className="border-l border-r border-blue-400 flex items-center justify-center">
          <span className="text-4xl font-bold">-</span>
        </div>

        {/* Col 5: VISITANTE + Marcador */}
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">{partido.rival}</h2>
          <p className="text-7xl font-bold">{estadisticas.goles_visitante}</p>
        </div>

        {/* Col 6: Goleadores visitantes */}
        <div className="text-sm space-y-1">
          {estadisticas.goles_visitante > 0 && (
            <>
              <p className="font-bold mb-1 text-center">Goleadores</p>
              {historial
                .filter(
                  (accion) =>
                    accion.accion === "gol" && accion.equipo === "visitante"
                )
                .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
                .map((gol, idx) => {
                  const minuto = gol.minuto_partido || gol.minuto || 0;
                  return (
                    <div key={idx} className="flex items-center gap-1">
                      <span>⚽</span>
                      <span className="font-semibold text-xs">
                        #{gol.dorsal || "?"}
                      </span>
                      <span className="text-blue-200 text-xs">({minuto}')</span>
                    </div>
                  );
                })}
            </>
          )}
        </div>

        {/* Col 7: Tarjetas visitantes */}
        <div className="text-sm space-y-1">
          <p className="font-bold mb-1 text-center">Tarjetas</p>
          {historial
            .filter(
              (accion) =>
                (accion.accion === "amarilla" || accion.accion === "roja") &&
                accion.equipo === "visitante"
            )
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
            .map((tarjeta, idx) => {
              const minuto = tarjeta.minuto_partido || tarjeta.minuto || 0;
              return (
                <div key={idx} className="flex items-center gap-1">
                  <span>{tarjeta.accion === "amarilla" ? "🟨" : "🟥"}</span>
                  <span className="font-semibold text-xs">
                    #{tarjeta.dorsal || "?"}
                  </span>
                  <span className="text-blue-200 text-xs">({minuto}')</span>
                </div>
              );
            })}
        </div>
      </div>

      {/* Faltas y Tarjetas */}
      <div className="pt-4 border-t border-blue-400">
        <div className="grid grid-cols-7 gap-4 text-center items-end">
          <div>
            <p className="text-sm mb-1">Faltas 1ª Parte</p>
            <p className="text-2xl font-bold">
              {estadisticas.faltas_local_primera || 0}
            </p>
          </div>
          <div>
            <p className="text-sm mb-1">Faltas 2ª Parte</p>
            <p className="text-2xl font-bold">
              {estadisticas.faltas_local_segunda || 0}
            </p>
          </div>
          <div>
            <p className="text-sm mb-1">Tarjetas</p>
            <div className="flex justify-center gap-2 text-xl font-bold">
              <span className="text-yellow-300">
                🟨 {tarjetasAmarillasLocal}
              </span>
              <span className="text-red-300">🟥 {tarjetasRojasLocal}</span>
            </div>
          </div>
          <div className="border-l border-r border-blue-400">
            <p className="text-sm mb-1">Total Faltas</p>
            <p className="text-2xl font-bold">
              {estadisticas.faltas_local} - {estadisticas.faltas_visitante}
            </p>
          </div>
          <div>
            <p className="text-sm mb-1">Tarjetas</p>
            <div className="flex justify-center gap-2 text-xl font-bold">
              <span className="text-yellow-300">
                🟨 {tarjetasAmarillasVisitante}
              </span>
              <span className="text-red-300">🟥 {tarjetasRojasVisitante}</span>
            </div>
          </div>
          <div>
            <p className="text-sm mb-1">Faltas 1ª Parte</p>
            <p className="text-2xl font-bold">
              {estadisticas.faltas_visitante_primera || 0}
            </p>
          </div>
          <div>
            <p className="text-sm mb-1">Faltas 2ª Parte</p>
            <p className="text-2xl font-bold">
              {estadisticas.faltas_visitante_segunda || 0}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
