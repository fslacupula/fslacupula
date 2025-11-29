import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { entrenamientos, partidos, motivos } from "../services/api";
import { useAuthContext } from "@contexts";

export default function DetalleAsistencia() {
  const { usuario, logout } = useAuthContext();
  const { tipo, id } = useParams();
  const navigate = useNavigate();
  const [evento, setEvento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [motivosLista, setMotivosLista] = useState([]);
  const [showMotivoModal, setShowMotivoModal] = useState(false);
  const [asistenciaEditar, setAsistenciaEditar] = useState(null);

  useEffect(() => {
    cargarDetalle();
    if (usuario?.rol === "gestor") {
      cargarMotivos();
    }
  }, [tipo, id]);

  const cargarMotivos = async () => {
    try {
      const res = await motivos.listar();
      setMotivosLista(res.data.motivos || []);
    } catch (error) {
      console.error("Error al cargar motivos:", error);
    }
  };

  const cargarDetalle = async () => {
    try {
      setLoading(true);
      const res =
        tipo === "entrenamientos" || tipo === "entrenamiento"
          ? await entrenamientos.obtener(id)
          : await partidos.obtener(id);

      const data =
        tipo === "entrenamientos" || tipo === "entrenamiento"
          ? res.data.entrenamiento
          : res.data.partido;

      console.log("📋 Detalle del evento cargado:", data);
      console.log("👥 Asistencias recibidas:", data.asistencias);
      if (data.asistencias && data.asistencias.length > 0) {
        console.log("🔍 Primera asistencia (estructura):", data.asistencias[0]);
      }

      setEvento(data);
    } catch (error) {
      console.error("Error al cargar detalle:", error);
      alert("Error al cargar el detalle");
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getEstadoBadge = (estado) => {
    const config = {
      confirmado: {
        bg: "bg-green-100",
        text: "text-green-800",
        label: "✓ Confirmado",
      },
      no_asiste: {
        bg: "bg-red-100",
        text: "text-red-800",
        label: "✗ No asiste",
      },
      pendiente: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        label: "⏳ Pendiente",
      },
    };
    return config[estado] || config.pendiente;
  };

  const handleCambiarEstado = async (asistencia, nuevoEstado) => {
    if (nuevoEstado === "ausente") {
      // Abrir modal para seleccionar motivo
      setAsistenciaEditar(asistencia);
      setShowMotivoModal(true);
    } else {
      // Cambiar directamente a confirmado o pendiente
      await actualizarAsistencia(asistencia.jugador_id, nuevoEstado, null);
    }
  };

  const actualizarAsistencia = async (jugadorId, estado, motivoAusenciaId) => {
    try {
      // Guardar posición del scroll antes de actualizar
      const scrollPos = window.scrollY;

      const data = { estado };
      if (motivoAusenciaId) {
        data.motivoAusenciaId = motivoAusenciaId;
      }

      if (tipo === "entrenamientos" || tipo === "entrenamiento") {
        await entrenamientos.actualizarAsistenciaGestor(id, jugadorId, data);
      } else {
        await partidos.actualizarAsistenciaGestor(id, jugadorId, data);
      }

      // Recargar datos
      await cargarDetalle();

      // Restaurar posición del scroll después de que se actualice el DOM
      setTimeout(() => {
        window.scrollTo(0, scrollPos);
      }, 0);

      setShowMotivoModal(false);
      setAsistenciaEditar(null);
    } catch (error) {
      console.error("Error al actualizar asistencia:", error);
      alert("Error al actualizar asistencia");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Cargando...</div>
      </div>
    );
  }

  if (!evento) {
    return null;
  }

  const confirmados =
    evento?.asistencias?.filter((a) => a.estado === "confirmado").length || 0;
  const noAsisten =
    evento?.asistencias?.filter((a) => a.estado === "no_asiste").length || 0;
  const pendientes =
    evento?.asistencias?.filter((a) => a.estado === "pendiente").length || 0;

  // Agrupar asistencias por tipo
  const asistenciasStaff =
    evento?.asistencias?.filter((a) => a.posicion === "Staff") || [];
  const asistenciasJugadores =
    evento?.asistencias?.filter(
      (a) => a.posicion !== "Staff" && a.posicion !== "Extra"
    ) || [];
  const asistenciasExtras =
    evento?.asistencias?.filter((a) => a.posicion === "Extra") || [];

  // Contadores por tipo (solo confirmados)
  const confirmadosStaff = asistenciasStaff.filter(
    (a) => a.estado === "confirmado"
  ).length;
  const confirmadosJugadores = asistenciasJugadores.filter(
    (a) => a.estado === "confirmado"
  ).length;
  const confirmadosExtras = asistenciasExtras.filter(
    (a) => a.estado === "confirmado"
  ).length;

  const renderAsistenciaCard = (asistencia, badge) => (
    <>
      <div className="flex items-center gap-3 sm:gap-4">
        <div
          className={`${
            asistencia.color === "red"
              ? "bg-red-500"
              : asistencia.color === "orangered"
              ? "bg-orange-600"
              : "bg-blue-500"
          } text-white rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-lg sm:text-xl font-bold flex-shrink-0`}
        >
          {asistencia.abreviatura || "J"}
          {asistencia.dorsal || ""}
        </div>
        <div className="flex-1">
          <h4 className="text-base sm:text-lg font-semibold text-gray-800">
            {asistencia.jugador_nombre}
            {asistencia.alias && (
              <span className="text-blue-600 ml-2 text-sm">
                "{asistencia.alias}"
              </span>
            )}
          </h4>
          <p className="text-xs sm:text-sm text-gray-500">
            {asistencia.posicion}
          </p>
        </div>
        <span
          className={`inline-block px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium ${badge.bg} ${badge.text}`}
        >
          {badge.label}
        </span>
      </div>

      {asistencia.estado === "no_asiste" && asistencia.motivo_nombre && (
        <div className="text-xs sm:text-sm text-gray-600 ml-14">
          <span className="font-medium">Motivo:</span>{" "}
          {asistencia.motivo_nombre}
        </div>
      )}

      {asistencia.comentario && (
        <div className="text-xs sm:text-sm text-gray-600 italic ml-14">
          "{asistencia.comentario}"
        </div>
      )}

      {usuario?.rol === "gestor" && (
        <div className="flex flex-wrap gap-2 ml-14">
          <button
            onClick={() => handleCambiarEstado(asistencia, "confirmado")}
            className={`text-xs sm:text-sm px-3 py-1.5 rounded font-medium transition ${
              asistencia.estado === "confirmado"
                ? "bg-green-600 text-white"
                : "bg-green-100 text-green-700 hover:bg-green-200"
            }`}
          >
            ✓ Confirmar
          </button>
          <button
            onClick={() => handleCambiarEstado(asistencia, "ausente")}
            className={`text-xs sm:text-sm px-3 py-1.5 rounded font-medium transition ${
              asistencia.estado === "no_asiste" ||
              asistencia.estado === "ausente"
                ? "bg-red-600 text-white"
                : "bg-red-100 text-red-700 hover:bg-red-200"
            }`}
          >
            ✗ No asiste
          </button>
          <button
            onClick={() => handleCambiarEstado(asistencia, "pendiente")}
            className={`text-xs sm:text-sm px-3 py-1.5 rounded font-medium transition ${
              asistencia.estado === "pendiente"
                ? "bg-yellow-600 text-white"
                : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
            }`}
          >
            ⏳ Pendiente
          </button>
        </div>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
              ⚽ FútbolClub
            </h1>
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={() => navigate("/dashboard")}
                className="text-gray-600 hover:text-gray-800 text-sm sm:text-base"
              >
                ← <span className="hidden sm:inline">Volver</span>
              </button>
              <span className="text-sm sm:text-base text-gray-600 hidden md:inline">
                Hola, {usuario?.nombre}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded hover:bg-red-600 text-sm sm:text-base"
              >
                Salir
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Cabecera del evento */}
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row items-start justify-between mb-3 sm:mb-4 gap-2">
            <div className="flex-1">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                {tipo === "entrenamientos" || tipo === "entrenamiento"
                  ? "📋 Entrenamiento"
                  : "⚽ Partido"}
              </h2>
              {(tipo === "partidos" || tipo === "partido") && (
                <p className="text-xl sm:text-2xl font-semibold text-gray-700 mb-2">
                  {evento.es_local ? "🏠" : "✈️"} vs {evento.rival}
                </p>
              )}
            </div>
            <div className="text-left sm:text-right flex flex-col gap-2">
              <div className="text-xs sm:text-sm text-gray-500 uppercase">
                {tipo === "partidos" || tipo === "partido"
                  ? evento.tipo
                  : "Entrenamiento"}
              </div>
              {usuario?.rol === "gestor" && tipo === "partidos" && (
                <button
                  onClick={() => navigate(`/configurar-partido/${id}`)}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow-md transition-all hover:scale-105 flex items-center gap-2 text-sm sm:text-base whitespace-nowrap"
                  title={`Configurar partido ${
                    evento.asistencias
                      ? `(${
                          evento.asistencias.filter(
                            (a) => a.estado === "confirmado"
                          ).length
                        } confirmados)`
                      : ""
                  }`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z"
                    />
                  </svg>
                  Configurar Partido
                </button>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-3 sm:mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl">📅</span>
              <div>
                <div className="text-xs sm:text-sm text-gray-500">Fecha</div>
                <div className="font-semibold text-sm sm:text-base">
                  {(() => {
                    const fechaStr = evento.fecha.split("T")[0];
                    const [year, month, day] = fechaStr.split("-");
                    const fecha = new Date(year, month - 1, day);
                    return fecha.toLocaleDateString("es-ES", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    });
                  })()}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl">🕒</span>
              <div>
                <div className="text-xs sm:text-sm text-gray-500">Hora</div>
                <div className="font-semibold text-sm sm:text-base">
                  {evento.hora}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl">📍</span>
              <div>
                <div className="text-xs sm:text-sm text-gray-500">
                  Ubicación
                </div>
                <div className="font-semibold text-sm sm:text-base">
                  {evento.ubicacion}
                </div>
              </div>
            </div>
          </div>

          {(tipo === "entrenamientos" || tipo === "entrenamiento") &&
            evento.descripcion && (
              <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-gray-50 rounded">
                <div className="text-xs sm:text-sm text-gray-500 mb-1">
                  Descripción
                </div>
                <div className="text-sm sm:text-base text-gray-700">
                  {evento.descripcion}
                </div>
              </div>
            )}

          {(tipo === "partidos" || tipo === "partido") && evento.resultado && (
            <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-gray-50 rounded">
              <div className="text-xs sm:text-sm text-gray-500 mb-1">
                Resultado
              </div>
              <div className="text-xl sm:text-2xl font-bold text-gray-800">
                {evento.resultado}
              </div>
            </div>
          )}
        </div>

        {/* Resumen de asistencia */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-3 sm:mb-4">
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-3 sm:p-4">
            <div className="text-green-600 text-xs sm:text-sm font-medium mb-1">
              Confirmados
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-green-700">
              {confirmados}
            </div>
          </div>
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3 sm:p-4">
            <div className="text-red-600 text-xs sm:text-sm font-medium mb-1">
              No asisten
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-red-700">
              {noAsisten}
            </div>
          </div>
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-3 sm:p-4">
            <div className="text-yellow-600 text-xs sm:text-sm font-medium mb-1">
              Pendientes
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-yellow-700">
              {pendientes}
            </div>
          </div>
        </div>

        {/* Detalle de confirmados por tipo */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-green-50 border border-green-300 rounded-lg p-2 sm:p-3">
            <div className="text-green-700 text-xs font-medium mb-1">
              Jugadores ✓
            </div>
            <div className="text-xl sm:text-2xl font-bold text-green-800">
              {confirmadosJugadores}
            </div>
          </div>
          <div className="bg-emerald-50 border border-emerald-300 rounded-lg p-2 sm:p-3">
            <div className="text-emerald-700 text-xs font-medium mb-1">
              Staff ✓
            </div>
            <div className="text-xl sm:text-2xl font-bold text-emerald-800">
              {confirmadosStaff}
            </div>
          </div>
          <div className="bg-lime-50 border border-lime-300 rounded-lg p-2 sm:p-3">
            <div className="text-lime-700 text-xs font-medium mb-1">
              Extras ✓
            </div>
            <div className="text-xl sm:text-2xl font-bold text-lime-800">
              {confirmadosExtras}
            </div>
          </div>
        </div>

        {/* Lista de jugadores por grupos */}
        <div className="space-y-4 sm:space-y-6">
          {/* Staff */}
          {asistenciasStaff.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
              <h3 className="text-xl sm:text-2xl font-bold text-red-600 mb-3 sm:mb-4 flex items-center gap-2">
                <span>👔 Staff ({asistenciasStaff.length})</span>
              </h3>
              <div className="space-y-2 sm:space-y-3">
                {asistenciasStaff.map((asistencia) => {
                  const badge = getEstadoBadge(asistencia.estado);
                  return (
                    <div
                      key={asistencia.jugador_id}
                      className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow"
                    >
                      {renderAsistenciaCard(asistencia, badge)}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Jugadores */}
          {asistenciasJugadores.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
              <h3 className="text-xl sm:text-2xl font-bold text-blue-600 mb-3 sm:mb-4 flex items-center gap-2">
                <span>⚽ Jugadores ({asistenciasJugadores.length})</span>
              </h3>
              <div className="space-y-2 sm:space-y-3">
                {asistenciasJugadores.map((asistencia) => {
                  const badge = getEstadoBadge(asistencia.estado);
                  return (
                    <div
                      key={asistencia.jugador_id}
                      className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow"
                    >
                      {renderAsistenciaCard(asistencia, badge)}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Extras */}
          {asistenciasExtras.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
              <h3 className="text-xl sm:text-2xl font-bold text-orange-600 mb-3 sm:mb-4 flex items-center gap-2">
                <span>➕ Extras ({asistenciasExtras.length})</span>
              </h3>
              <div className="space-y-2 sm:space-y-3">
                {asistenciasExtras.map((asistencia) => {
                  const badge = getEstadoBadge(asistencia.estado);
                  return (
                    <div
                      key={asistencia.jugador_id}
                      className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow"
                    >
                      {renderAsistenciaCard(asistencia, badge)}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal seleccionar motivo */}
      {showMotivoModal && asistenciaEditar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Seleccionar Motivo de Ausencia
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Jugador: <strong>{asistenciaEditar.jugador_nombre}</strong>
            </p>
            <div className="space-y-2 mb-6">
              {motivosLista.map((motivo) => (
                <button
                  key={motivo.id}
                  onClick={() =>
                    actualizarAsistencia(
                      asistenciaEditar.jugador_id,
                      "ausente",
                      motivo.id
                    )
                  }
                  className="w-full text-left px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  <div className="font-medium text-gray-800">
                    {motivo.motivo}
                  </div>
                  {motivo.descripcion && (
                    <div className="text-xs text-gray-500 mt-1">
                      {motivo.descripcion}
                    </div>
                  )}
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                setShowMotivoModal(false);
                setAsistenciaEditar(null);
              }}
              className="w-full bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
