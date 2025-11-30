import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { partidos } from "../services/api";

export default function ActaPartido() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [acta, setActa] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarEstadisticas();
  }, [id]);

  const cargarEstadisticas = async () => {
    try {
      const response = await partidos.obtenerEstadisticas(id);
      setActa(response.data);
    } catch (error) {
      console.error("Error al cargar estadísticas:", error);
      if (error.response?.status === 404) {
        alert("Este partido aún no ha sido finalizado");
        navigate(`/partidos/${id}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const formatearFecha = (fechaISO) => {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatearTiempo = (segundos) => {
    // minutos_jugados viene en SEGUNDOS desde la BD (columna INTEGER almacena segundos)
    const minutos = Math.floor((segundos || 0) / 60);
    return `${minutos}'`;
  };

  const obtenerIconoAccion = (accion) => {
    switch (accion) {
      case "gol":
        return "⚽";
      case "asistencia":
        return "👟";
      case "amarilla":
        return "🟨";
      case "roja":
        return "🟥";
      case "falta":
        return "🚫";
      case "parada":
        return "🧤";
      default:
        return "•";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-xl">Cargando acta del partido...</p>
      </div>
    );
  }

  if (!acta) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-xl">No se encontraron estadísticas</p>
      </div>
    );
  }

  const { partido, estadisticas, jugadores, historial, tiemposJuego, staff } =
    acta;

  // Contar tarjetas del historial por equipo
  const contarTarjetasHistorial = (equipo, tipoTarjeta) => {
    return historial.filter(
      (accion) => accion.equipo === equipo && accion.accion === tipoTarjeta
    ).length;
  };

  // Totales de tarjetas incluyendo historial
  const tarjetasAmarillasLocal =
    jugadores
      .filter((j) => j.equipo === "local")
      .reduce((sum, j) => sum + (j.tarjetas_amarillas || 0), 0) +
    contarTarjetasHistorial("local", "amarilla");

  const tarjetasRojasLocal =
    jugadores
      .filter((j) => j.equipo === "local")
      .reduce((sum, j) => sum + (j.tarjetas_rojas || 0), 0) +
    contarTarjetasHistorial("local", "roja");

  const tarjetasAmarillasVisitante =
    jugadores
      .filter((j) => j.equipo === "visitante")
      .reduce((sum, j) => sum + (j.tarjetas_amarillas || 0), 0) +
    contarTarjetasHistorial("visitante", "amarilla");

  const tarjetasRojasVisitante =
    jugadores
      .filter((j) => j.equipo === "visitante")
      .reduce((sum, j) => sum + (j.tarjetas_rojas || 0), 0) +
    contarTarjetasHistorial("visitante", "roja");

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Botón volver */}
        <button
          onClick={() => navigate("/dashboard")}
          className="mb-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          ← Volver
        </button>

        {/* Encabezado del Acta */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-center mb-4">
            ACTA DEL PARTIDO
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-gray-600">
                <strong>Fecha:</strong> {formatearFecha(partido.fecha_hora)}
              </p>
              <p className="text-gray-600">
                <strong>Lugar:</strong> {partido.lugar}
              </p>
              <p className="text-gray-600">
                <strong>Rival:</strong> {partido.rival}
              </p>
            </div>
            <div>
              <p className="text-gray-600">
                <strong>Tipo:</strong> {partido.tipo || "Amistoso"}
              </p>
              <p className="text-gray-600">
                <strong>Duración:</strong> {estadisticas.duracion_minutos}'
              </p>
              <p className="text-gray-600">
                <strong>Estado:</strong>{" "}
                <span className="text-green-600 font-semibold">
                  {partido.estado}
                </span>
              </p>
            </div>
          </div>

          {/* Marcador */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="text-center flex-1">
                <h2 className="text-2xl font-bold mb-2">LOCAL</h2>
                <p className="text-6xl font-bold">{estadisticas.goles_local}</p>
                {/* Goleadores locales */}
                {estadisticas.goles_local > 0 && (
                  <div className="mt-4 text-sm">
                    {historial
                      .filter(
                        (accion) =>
                          accion.accion === "gol" && accion.equipo === "local"
                      )
                      .sort(
                        (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
                      )
                      .map((gol, idx) => {
                        const jugador = jugadores.find(
                          (j) => j.jugador_id === gol.jugador_id
                        );
                        const minuto = gol.minuto_partido || gol.minuto || 0;
                        console.log("🎯 GOL LOCAL:", {
                          jugador: jugador?.jugador_nombre_completo,
                          minuto_partido: gol.minuto_partido,
                          minuto: gol.minuto,
                          minuto_final: minuto,
                          gol_completo: gol,
                        });
                        return (
                          <div
                            key={idx}
                            className="flex items-center justify-center gap-2"
                          >
                            <span>⚽</span>
                            <span className="font-semibold">
                              {jugador?.jugador_nombre_completo ||
                                `#${gol.dorsal}`}
                            </span>
                            <span className="text-blue-200">({minuto}')</span>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>

              <div className="text-4xl font-bold px-8">-</div>

              <div className="text-center flex-1">
                <h2 className="text-2xl font-bold mb-2">{partido.rival}</h2>
                <p className="text-6xl font-bold">
                  {estadisticas.goles_visitante}
                </p>
                {/* Goleadores visitantes */}
                {estadisticas.goles_visitante > 0 && (
                  <div className="mt-4 text-sm">
                    {historial
                      .filter(
                        (accion) =>
                          accion.accion === "gol" &&
                          accion.equipo === "visitante"
                      )
                      .sort(
                        (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
                      )
                      .map((gol, idx) => {
                        const minuto = gol.minuto_partido || gol.minuto || 0;
                        console.log("🎯 GOL VISITANTE:", {
                          dorsal: gol.dorsal,
                          minuto_partido: gol.minuto_partido,
                          minuto: gol.minuto,
                          minuto_final: minuto,
                          gol_completo: gol,
                        });
                        return (
                          <div
                            key={idx}
                            className="flex items-center justify-center gap-2"
                          >
                            <span>⚽</span>
                            <span className="font-semibold">
                              #{gol.dorsal || "?"}
                            </span>
                            <span className="text-blue-200">({minuto}')</span>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            </div>

            {/* Faltas y Tarjetas */}
            <div className="mt-6 pt-4 border-t border-blue-400">
              <div className="grid grid-cols-5 gap-4 text-center">
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
                <div className="border-l border-r border-blue-400">
                  <p className="text-sm mb-1">Total Faltas</p>
                  <p className="text-2xl font-bold">
                    {estadisticas.faltas_local} -{" "}
                    {estadisticas.faltas_visitante}
                  </p>
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
              <div className="grid grid-cols-5 gap-4 text-center mt-4">
                <div className="col-span-2">
                  <p className="text-sm mb-1">Tarjetas</p>
                  <div className="flex justify-center gap-3 text-xl font-bold">
                    <span className="text-yellow-300">
                      🟨 {tarjetasAmarillasLocal}
                    </span>
                    <span className="text-red-300">
                      🟥 {tarjetasRojasLocal}
                    </span>
                  </div>
                </div>
                <div className="border-l border-r border-blue-400"></div>
                <div className="col-span-2">
                  <p className="text-sm mb-1">Tarjetas</p>
                  <div className="flex justify-center gap-3 text-xl font-bold">
                    <span className="text-yellow-300">
                      🟨 {tarjetasAmarillasVisitante}
                    </span>
                    <span className="text-red-300">
                      🟥 {tarjetasRojasVisitante}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Estadísticas de Jugadores - Fichas compactas */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4 text-blue-600">
            Jugadores Locales
          </h2>
          <div className="grid grid-cols-6 gap-2">
            {jugadores
              .filter((j) => j.equipo === "local")
              .sort(
                (a, b) => (b.minutos_jugados || 0) - (a.minutos_jugados || 0)
              )
              .map((jugador, index) => {
                const tieneAmarilla = jugador.tarjetas_amarillas > 0;
                const tieneRoja = jugador.tarjetas_rojas > 0;
                const numGoles = jugador.goles || 0;

                return (
                  <div
                    key={index}
                    className="flex items-stretch p-2 rounded-lg border-2 gap-2 bg-gray-50 border-gray-300"
                  >
                    {/* Columna 1: Dorsal/Alias y Minutos */}
                    <div className="flex flex-col justify-between flex-1">
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-blue-600 text-base">
                          {jugador.dorsal || "?"}
                        </span>
                        <span className="text-gray-700 text-xs truncate max-w-[45px]">
                          {jugador.alias || jugador.jugador_nombre_completo}
                        </span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        <span className="font-bold text-gray-800 text-base font-mono">
                          {formatearTiempo(jugador.minutos_jugados)}
                        </span>
                      </div>
                    </div>

                    {/* Columna 2: Balón con goles */}
                    {numGoles > 0 && (
                      <div className="flex items-center justify-center">
                        <div className="relative w-8 h-8 bg-white rounded-full border-2 border-gray-800 flex items-center justify-center">
                          <span className="text-sm font-bold text-gray-800 relative z-10">
                            {numGoles}
                          </span>
                          {/* Patrón de balón simplificado */}
                          <svg
                            className="absolute inset-0 w-full h-full"
                            viewBox="0 0 20 20"
                          >
                            <circle
                              cx="10"
                              cy="10"
                              r="9"
                              fill="none"
                              stroke="#000"
                              strokeWidth="0.5"
                            />
                            <path
                              d="M10 2 L11 6 L10 10 L9 6 Z"
                              fill="#000"
                              fillOpacity="0.15"
                            />
                            <path
                              d="M18 10 L14 11 L10 10 L14 9 Z"
                              fill="#000"
                              fillOpacity="0.15"
                            />
                          </svg>
                        </div>
                      </div>
                    )}

                    {/* Columna 3: Tarjetas */}
                    <div className="flex flex-col justify-between">
                      <div className="h-1/2 flex items-start">
                        {tieneAmarilla && (
                          <div className="w-4 h-5 bg-yellow-400 rounded-sm border border-yellow-600"></div>
                        )}
                      </div>
                      <div className="h-1/2 flex items-end">
                        {tieneRoja && (
                          <div className="w-4 h-5 bg-red-500 rounded-sm border border-red-700"></div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Staff - Fichas compactas */}
        {staff && staff.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-600">
              Staff Técnico
            </h2>
            <div className="grid grid-cols-6 gap-2">
              {staff
                .filter((miembro) => miembro.equipo === "local")
                .map((miembro, index) => {
                  const tieneAmarilla = miembro.tarjetas_amarillas > 0;
                  const tieneRoja = miembro.tarjetas_rojas > 0;

                  return (
                    <div
                      key={index}
                      className="flex items-stretch p-2 rounded-lg border-2 gap-2 bg-gray-50 border-gray-300"
                    >
                      {/* Columna 1: Tipo y Nombre */}
                      <div className="flex flex-col justify-between flex-1">
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-gray-600 text-xs uppercase">
                            {miembro.tipo_staff || miembro.tipo || "Staff"}
                          </span>
                        </div>
                        <div className="flex items-center gap-0.5">
                          <span className="text-gray-700 text-xs truncate max-w-[80px]">
                            {miembro.nombre}
                          </span>
                        </div>
                      </div>

                      {/* Columna 2: Tarjetas */}
                      <div className="flex flex-col justify-between">
                        <div className="h-1/2 flex items-start">
                          {tieneAmarilla && (
                            <div className="w-4 h-5 bg-yellow-400 rounded-sm border border-yellow-600"></div>
                          )}
                        </div>
                        <div className="h-1/2 flex items-end">
                          {tieneRoja && (
                            <div className="w-4 h-5 bg-red-500 rounded-sm border border-red-700"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Historial de Acciones - Dos columnas */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4 text-center">
            Cronología del Partido
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Columna Izquierda - LOCAL */}
            <div>
              <h3 className="text-lg font-bold text-blue-600 mb-3 text-center">
                LOCAL
              </h3>
              <div className="space-y-2">
                {historial
                  .filter((accion) => accion.equipo === "local")
                  .map((accion, index) => {
                    const minuto = accion.minuto_partido || accion.minuto || 0;
                    return (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 rounded bg-blue-50 border border-blue-200"
                      >
                        <div className="text-2xl">
                          {obtenerIconoAccion(accion.accion)}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800">
                            {accion.jugador_nombre || `Dorsal ${accion.dorsal}`}
                          </p>
                          <p className="text-sm text-gray-600 capitalize">
                            {accion.accion}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-blue-600">
                            {minuto}'
                          </p>
                        </div>
                      </div>
                    );
                  })}
                {historial.filter((a) => a.equipo === "local").length === 0 && (
                  <p className="text-center text-gray-400 py-4">
                    Sin acciones registradas
                  </p>
                )}
              </div>
            </div>

            {/* Columna Derecha - VISITANTE */}
            <div>
              <h3 className="text-lg font-bold text-gray-600 mb-3 text-center">
                {partido.rival}
              </h3>
              <div className="space-y-2">
                {historial
                  .filter((accion) => accion.equipo === "visitante")
                  .map((accion, index) => {
                    const minuto = accion.minuto_partido || accion.minuto || 0;
                    return (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 rounded bg-gray-50 border border-gray-200"
                      >
                        <div className="text-2xl">
                          {obtenerIconoAccion(accion.accion)}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800">
                            Dorsal #{accion.dorsal || "?"}
                          </p>
                          <p className="text-sm text-gray-600 capitalize">
                            {accion.accion}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-600">
                            {minuto}'
                          </p>
                        </div>
                      </div>
                    );
                  })}
                {historial.filter((a) => a.equipo === "visitante").length ===
                  0 && (
                  <p className="text-center text-gray-400 py-4">
                    Sin acciones registradas
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Botón Imprimir */}
        <div className="mt-6 text-center">
          <button
            onClick={() => window.print()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
          >
            🖨️ Imprimir Acta
          </button>
        </div>
      </div>
    </div>
  );
}
