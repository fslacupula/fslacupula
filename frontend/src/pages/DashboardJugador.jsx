import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { entrenamientos, partidos, motivos } from "../services/api";

// Helper para extraer fecha en formato YYYY-MM-DD sin conversión de zona horaria
const getFechaString = (fecha) => {
  if (!fecha) return "";
  if (typeof fecha === "string") {
    return fecha.split("T")[0];
  }
  return fecha;
};

// Helper para comparar fechas sin conversión de zona horaria
const compararFechas = (fechaStr1, fechaStr2) => {
  const f1 = getFechaString(fechaStr1);
  const f2 = getFechaString(fechaStr2);
  return f1.localeCompare(f2);
};

export default function DashboardJugador({ user, setUser }) {
  const [misEntrenamientos, setMisEntrenamientos] = useState([]);
  const [misPartidos, setMisPartidos] = useState([]);
  const [motivosAusencia, setMotivosAusencia] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [eventoSeleccionado, setEventoSeleccionado] = useState(null);
  const [asistenciaForm, setAsistenciaForm] = useState({
    estado: "",
    motivo_ausencia_id: null,
    comentarios: "",
  });
  const [activeTab, setActiveTab] = useState("todos");
  // Detectar si es mobile y establecer vista por defecto
  const isMobile = window.innerWidth < 640; // sm breakpoint de Tailwind
  const [vistaMode, setVistaMode] = useState(isMobile ? "lista" : "calendario");
  const [mesActual, setMesActual] = useState(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [entRes, partRes, motRes] = await Promise.all([
        entrenamientos.misEntrenamientos(),
        partidos.misPartidos(),
        motivos.listar(),
      ]);
      console.log("Datos recibidos:", {
        entrenamientos: entRes.data.entrenamientos,
        partidos: partRes.data.partidos,
        motivos: motRes.data.motivos,
      });
      setMisEntrenamientos(entRes.data.entrenamientos || []);
      setMisPartidos(partRes.data.partidos || []);
      setMotivosAusencia(motRes.data.motivos || []);
    } catch (error) {
      console.error("Error al cargar datos:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };

  const abrirModalAsistencia = (evento, tipo) => {
    setEventoSeleccionado({ ...evento, tipo });
    setAsistenciaForm({
      estado:
        evento.estado === "pendiente"
          ? "confirmado"
          : evento.estado || "confirmado",
      motivo_ausencia_id: evento.motivo_ausencia_id
        ? evento.motivo_ausencia_id.toString()
        : null,
      comentarios: evento.comentarios || "",
    });
    setShowModal(true);
  };

  const handleSubmitAsistencia = async (e) => {
    e.preventDefault();

    const data = {
      estado: asistenciaForm.estado,
      comentario: asistenciaForm.comentarios || null,
    };

    if (
      asistenciaForm.estado === "no_asiste" &&
      asistenciaForm.motivo_ausencia_id
    ) {
      data.motivoAusenciaId = parseInt(asistenciaForm.motivo_ausencia_id);
    }

    console.log("Enviando asistencia:", {
      tipo: eventoSeleccionado.tipo,
      id: eventoSeleccionado.id,
      data,
    });

    try {
      if (eventoSeleccionado.tipo === "entrenamiento") {
        await entrenamientos.registrarAsistencia(eventoSeleccionado.id, data);
      } else if (eventoSeleccionado.tipo === "partido") {
        await partidos.registrarAsistencia(eventoSeleccionado.id, data);
      } else {
        throw new Error(`Tipo de evento no válido: ${eventoSeleccionado.tipo}`);
      }
      console.log("Asistencia registrada exitosamente");
      setShowModal(false);
      cargarDatos();
    } catch (error) {
      console.error("Error completo:", error);
      alert(
        error.response?.data?.error ||
          error.message ||
          "Error al registrar asistencia"
      );
    }
  };

  const getEstadoBadge = (estado) => {
    const colores = {
      confirmado: "bg-green-100 text-green-800",
      no_asiste: "bg-red-100 text-red-800",
      pendiente: "bg-yellow-100 text-yellow-800",
    };
    return colores[estado] || colores.pendiente;
  };

  const getDiasDelMes = () => {
    const year = mesActual.getFullYear();
    const month = mesActual.getMonth();
    const primerDia = new Date(year, month, 1);
    const diasEnMes = new Date(year, month + 1, 0).getDate();
    let primerDiaSemana = primerDia.getDay();

    // Ajustar para que lunes sea 0 (domingo es 6)
    primerDiaSemana = primerDiaSemana === 0 ? 6 : primerDiaSemana - 1;

    const dias = [];
    // Días vacíos al inicio
    for (let i = 0; i < primerDiaSemana; i++) {
      dias.push(null);
    }
    // Días del mes
    for (let i = 1; i <= diasEnMes; i++) {
      dias.push(new Date(year, month, i));
    }
    return dias;
  };

  const getEventosDelDia = (fecha) => {
    if (!fecha) return [];
    // Formatear fecha sin conversión de zona horaria
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, "0");
    const day = String(fecha.getDate()).padStart(2, "0");
    const fechaStr = `${year}-${month}-${day}`;

    let eventos = [];
    if (activeTab === "todos") {
      const entrenamientos = misEntrenamientos
        .filter((e) => getFechaString(e.fecha) === fechaStr)
        .map((e) => ({ ...e, tipoEvento: "entrenamientos" }));
      const partidos = misPartidos
        .filter((e) => getFechaString(e.fecha) === fechaStr)
        .map((e) => ({ ...e, tipoEvento: "partidos" }));
      eventos = [...entrenamientos, ...partidos].sort((a, b) =>
        a.hora.localeCompare(b.hora)
      );
    } else {
      eventos =
        activeTab === "entrenamientos" ? misEntrenamientos : misPartidos;
      eventos = eventos.filter((e) => getFechaString(e.fecha) === fechaStr);
    }
    return eventos;
  };

  const cambiarMes = (direccion) => {
    const nuevaFecha = new Date(mesActual);
    nuevaFecha.setMonth(mesActual.getMonth() + direccion);
    setMesActual(nuevaFecha);
  };

  const renderVistaLista = () => {
    let eventos = [];

    if (activeTab === "todos") {
      const entrenamientosConTipo = misEntrenamientos.map((e) => ({
        ...e,
        tipoEvento: "entrenamientos",
      }));
      const partidosConTipo = misPartidos.map((p) => ({
        ...p,
        tipoEvento: "partidos",
      }));
      eventos = [...entrenamientosConTipo, ...partidosConTipo].sort((a, b) => {
        return -compararFechas(a.fecha, b.fecha); // Más recientes primero (negativo invierte el orden)
      });
    } else {
      eventos =
        activeTab === "entrenamientos" ? misEntrenamientos : misPartidos;
    }

    return (
      <div className="grid gap-3 sm:gap-4">
        {eventos.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No hay eventos</p>
        ) : (
          eventos.map((evento) => {
            const esEntrenamiento =
              activeTab === "todos"
                ? evento.tipoEvento === "entrenamientos"
                : activeTab === "entrenamientos";

            return (
              <div
                key={`${evento.tipoEvento || activeTab}-${evento.id}`}
                className="bg-white rounded-lg shadow p-3 sm:p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3"
              >
                <div className="flex-1">
                  {activeTab === "todos" && (
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-semibold mb-2 ${
                        esEntrenamiento
                          ? "bg-green-100 text-green-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {esEntrenamiento ? "📋 Entrenamiento" : "⚽ Partido"}
                    </span>
                  )}
                  <h4 className="font-semibold text-base sm:text-lg">
                    {(() => {
                      const fechaStr = getFechaString(evento.fecha);
                      const [year, month, day] = fechaStr.split("-");
                      const fecha = new Date(year, month - 1, day);
                      return fecha.toLocaleDateString("es-ES", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      });
                    })()}
                  </h4>
                  {!esEntrenamiento && (
                    <p className="text-gray-800 font-medium text-sm sm:text-base">
                      {evento.es_local ? "🏠" : "✈️"} vs {evento.rival}
                    </p>
                  )}
                  <p className="text-gray-600 text-sm">
                    🕒 {evento.hora} - 📍 {evento.ubicacion}
                  </p>
                  {esEntrenamiento && evento.descripcion && (
                    <p className="text-gray-500 text-xs sm:text-sm mt-1 line-clamp-2">
                      {evento.descripcion}
                    </p>
                  )}
                  {!esEntrenamiento && (
                    <>
                      <p className="text-gray-500 text-xs sm:text-sm">
                        Tipo: {evento.tipo}
                      </p>
                      {evento.resultado && (
                        <p className="text-xs sm:text-sm text-gray-600">
                          Resultado: {evento.resultado}
                        </p>
                      )}
                    </>
                  )}
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${getEstadoBadge(
                        evento.estado
                      )}`}
                    >
                      {evento.estado === "confirmado"
                        ? "Confirmado"
                        : evento.estado === "no_asiste"
                        ? "No asiste"
                        : "Pendiente"}
                    </span>
                    {evento.motivo_nombre && (
                      <span className="text-xs sm:text-sm text-gray-600">
                        ({evento.motivo_nombre})
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() =>
                    abrirModalAsistencia(
                      evento,
                      esEntrenamiento ? "entrenamiento" : "partido"
                    )
                  }
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm sm:text-base whitespace-nowrap w-full sm:w-auto"
                >
                  {evento.estado === "pendiente" ? "Confirmar" : "Modificar"}
                </button>
              </div>
            );
          })
        )}
      </div>
    );
  };

  const renderVistaCalendario = () => {
    const dias = getDiasDelMes();
    const nombresDias = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
    const nombresDiasCortos = ["L", "M", "X", "J", "V", "S", "D"];

    return (
      <div className="bg-white rounded-lg shadow p-2 sm:p-4">
        {/* Controles de navegación */}
        <div className="flex justify-between items-center mb-3 sm:mb-4">
          <button
            onClick={() => cambiarMes(-1)}
            className="bg-gray-200 hover:bg-gray-300 px-2 sm:px-4 py-1.5 sm:py-2 rounded text-sm sm:text-base"
          >
            ←
          </button>
          <h3 className="text-base sm:text-xl font-semibold capitalize">
            {mesActual.toLocaleDateString("es-ES", {
              month: "long",
              year: "numeric",
            })}
          </h3>
          <button
            onClick={() => cambiarMes(1)}
            className="bg-gray-200 hover:bg-gray-300 px-2 sm:px-4 py-1.5 sm:py-2 rounded text-sm sm:text-base"
          >
            →
          </button>
        </div>

        {/* Nombres de días */}
        <div className="grid grid-cols-7 gap-0.5 sm:gap-2 mb-1 sm:mb-2">
          {nombresDias.map((dia, index) => (
            <div
              key={dia}
              className="text-center font-semibold text-gray-600 text-xs sm:text-sm py-1 sm:py-2"
            >
              <span className="hidden sm:inline">{dia}</span>
              <span className="sm:hidden">{nombresDiasCortos[index]}</span>
            </div>
          ))}
        </div>

        {/* Días del calendario */}
        <div className="grid grid-cols-7 gap-0.5 sm:gap-2">
          {dias.map((fecha, index) => {
            const eventosDelDia = fecha ? getEventosDelDia(fecha) : [];
            const esHoy =
              fecha && fecha.toDateString() === new Date().toDateString();

            return (
              <div
                key={index}
                className={`min-h-[60px] sm:min-h-[100px] border rounded p-0.5 sm:p-1 ${
                  fecha ? "bg-white" : "bg-gray-100"
                } ${esHoy ? "border-blue-500 border-2" : "border-gray-200"}`}
              >
                {fecha && (
                  <>
                    <div
                      className={`text-right text-[10px] sm:text-sm font-semibold mb-0.5 sm:mb-1 px-0.5 sm:px-1 ${
                        esHoy ? "text-blue-600" : "text-gray-700"
                      }`}
                    >
                      {fecha.getDate()}
                    </div>
                    <div className="space-y-0.5 sm:space-y-1">
                      {eventosDelDia.map((evento) => {
                        const esEntrenamiento =
                          activeTab === "todos"
                            ? evento.tipoEvento === "entrenamientos"
                            : activeTab === "entrenamientos";

                        return (
                          <div
                            key={`${evento.tipoEvento || activeTab}-${
                              evento.id
                            }`}
                            onClick={() =>
                              abrirModalAsistencia(
                                evento,
                                esEntrenamiento ? "entrenamiento" : "partido"
                              )
                            }
                            className={`text-[8px] sm:text-xs p-1 sm:p-2 rounded cursor-pointer ${
                              esEntrenamiento
                                ? "bg-green-50 hover:bg-green-100 border border-green-200"
                                : "bg-blue-50 hover:bg-blue-100 border border-blue-200"
                            }`}
                            title={
                              esEntrenamiento
                                ? `${evento.hora} - ${evento.ubicacion}`
                                : `${evento.hora} - vs ${evento.rival}`
                            }
                          >
                            <div className="font-semibold mb-0.5 sm:mb-1 flex items-center justify-between">
                              <span className="truncate">{evento.hora}</span>
                              <span className="text-xs sm:text-sm">
                                {esEntrenamiento ? "📋" : "⚽"}
                              </span>
                            </div>
                            <div className="text-[8px] sm:text-[10px] truncate mb-0.5 sm:mb-1 text-gray-600 hidden sm:block">
                              {esEntrenamiento
                                ? evento.ubicacion
                                : `vs ${evento.rival}`}
                            </div>
                            <div className="text-[8px] sm:text-[10px]">
                              <span
                                className={`px-0.5 sm:px-1 rounded ${
                                  evento.estado === "confirmado"
                                    ? "bg-green-200 text-green-800"
                                    : evento.estado === "no_asiste"
                                    ? "bg-red-200 text-red-800"
                                    : "bg-yellow-200 text-yellow-800"
                                }`}
                              >
                                {evento.estado === "confirmado"
                                  ? "✓"
                                  : evento.estado === "no_asiste"
                                  ? "✗"
                                  : "⏳"}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex justify-between items-center">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
            ⚽ FútbolClub
          </h1>
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="text-sm sm:text-base text-gray-600 hidden sm:inline">
              Hola, {user.nombre}
            </span>
            <span className="text-sm text-gray-600 sm:hidden">
              {user.nombre}
            </span>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded hover:bg-red-600 text-sm sm:text-base"
            >
              Salir
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
            <button
              onClick={() => setActiveTab("todos")}
              className={`px-4 sm:px-6 py-2 rounded-lg font-medium whitespace-nowrap text-sm sm:text-base flex-shrink-0 ${
                activeTab === "todos"
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              📊 Todos
            </button>
            <button
              onClick={() => setActiveTab("entrenamientos")}
              className={`px-4 sm:px-6 py-2 rounded-lg font-medium whitespace-nowrap text-sm sm:text-base flex-shrink-0 ${
                activeTab === "entrenamientos"
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              📋 Entrenamientos
            </button>
            <button
              onClick={() => setActiveTab("partidos")}
              className={`px-4 sm:px-6 py-2 rounded-lg font-medium whitespace-nowrap text-sm sm:text-base flex-shrink-0 ${
                activeTab === "partidos"
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              ⚽ Partidos
            </button>
          </div>

          {/* Botones de vista */}
          <div className="flex gap-2">
            <button
              onClick={() => setVistaMode("lista")}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-lg font-medium text-sm sm:text-base ${
                vistaMode === "lista"
                  ? "bg-gray-700 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              📋 Lista
            </button>
            <button
              onClick={() => setVistaMode("calendario")}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-lg font-medium text-sm sm:text-base ${
                vistaMode === "calendario"
                  ? "bg-gray-700 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              📅 Calendario
            </button>
          </div>
        </div>

        {vistaMode === "lista" ? renderVistaLista() : renderVistaCalendario()}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">
              Confirmar Asistencia
            </h3>
            <form onSubmit={handleSubmitAsistencia}>
              <div className="mb-4 sm:mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2 sm:mb-3">
                  Estado de Asistencia
                </label>
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setAsistenciaForm({
                        ...asistenciaForm,
                        estado: "confirmado",
                        motivo_ausencia_id: null,
                      })
                    }
                    className={`px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border-2 transition-all font-medium flex items-center justify-center gap-1.5 sm:gap-2 text-sm sm:text-base ${
                      asistenciaForm.estado === "confirmado"
                        ? "bg-green-500 text-white border-green-600 shadow-lg scale-105"
                        : "bg-white text-gray-700 border-gray-300 hover:border-green-400 hover:bg-green-50"
                    }`}
                  >
                    <span className="text-xl">✓</span>
                    <span>Confirmo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setAsistenciaForm({
                        ...asistenciaForm,
                        estado: "no_asiste",
                      })
                    }
                    className={`px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border-2 transition-all font-medium flex items-center justify-center gap-1.5 sm:gap-2 text-sm sm:text-base ${
                      asistenciaForm.estado === "no_asiste"
                        ? "bg-red-500 text-white border-red-600 shadow-lg scale-105"
                        : "bg-white text-gray-700 border-gray-300 hover:border-red-400 hover:bg-red-50"
                    }`}
                  >
                    <span className="text-xl">✗</span>
                    <span>No puedo</span>
                  </button>
                </div>
              </div>

              {asistenciaForm.estado === "no_asiste" && (
                <div className="mb-3 sm:mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2 sm:mb-3">
                    Motivo de ausencia
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {motivosAusencia.length === 0 ? (
                      <p className="text-gray-500 text-sm italic">
                        No hay motivos disponibles
                      </p>
                    ) : (
                      motivosAusencia.map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => {
                            setAsistenciaForm({
                              ...asistenciaForm,
                              motivo_ausencia_id: m.id.toString(),
                            });
                          }}
                          className={`px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border-2 transition-all text-left font-medium text-sm sm:text-base ${
                            asistenciaForm.motivo_ausencia_id ===
                            m.id.toString()
                              ? "bg-blue-500 text-white border-blue-600 shadow-md"
                              : "bg-white text-gray-800 border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                          }`}
                        >
                          {m.motivo}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}

              <div className="mb-3 sm:mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Comentarios (opcional)
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  rows="2"
                  placeholder="Añade cualquier comentario adicional..."
                  value={asistenciaForm.comentarios}
                  onChange={(e) =>
                    setAsistenciaForm({
                      ...asistenciaForm,
                      comentarios: e.target.value,
                    })
                  }
                />
              </div>

              <div className="flex gap-2 sm:gap-3 mt-4">
                <button
                  type="submit"
                  disabled={
                    asistenciaForm.estado === "no_asiste" &&
                    !asistenciaForm.motivo_ausencia_id
                  }
                  className="flex-1 bg-green-500 text-white py-2.5 sm:py-2 px-4 rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium text-sm sm:text-base"
                >
                  Guardar
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2.5 sm:py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors font-medium text-sm sm:text-base"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
