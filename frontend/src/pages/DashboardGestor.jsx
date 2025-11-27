import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  entrenamientos,
  partidos,
  auth,
  posiciones as posicionesApi,
} from "../services/api";

export default function DashboardGestor({ user, setUser }) {
  const [activeTab, setActiveTab] = useState("todos");
  const [vistaMode, setVistaMode] = useState("calendario"); // "lista" o "calendario"
  const [listaEntrenamientos, setListaEntrenamientos] = useState([]);
  const [listaPartidos, setListaPartidos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showJugadorModal, setShowJugadorModal] = useState(false);
  const [eventoSeleccionado, setEventoSeleccionado] = useState(null);
  const [tipoEvento, setTipoEvento] = useState("entrenamiento"); // Para el modal
  const [mesActual, setMesActual] = useState(new Date());
  const [formData, setFormData] = useState({
    fecha: "",
    hora: "",
    ubicacion: "",
    descripcion: "",
    rival: "",
    tipo: "amistoso",
    es_local: true,
    resultado: "",
  });
  const [jugadorFormData, setJugadorFormData] = useState({
    nombre: "",
    email: "",
    password: "",
    alias: "",
    dorsal: "",
    posicion: "",
  });
  const [listaJugadores, setListaJugadores] = useState([]);
  const [posiciones, setPosiciones] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    cargarPosiciones();
  }, []);

  useEffect(() => {
    if (activeTab === "jugadores") {
      cargarJugadores();
    } else {
      cargarDatos();
    }
  }, [activeTab]);

  const cargarPosiciones = async () => {
    try {
      const response = await posicionesApi.listar();
      setPosiciones(response.data.posiciones);
    } catch (err) {
      console.error("Error al cargar posiciones:", err);
    }
  };

  const cargarDatos = async () => {
    try {
      if (activeTab === "todos") {
        const [resEnt, resPart] = await Promise.all([
          entrenamientos.listar(),
          partidos.listar(),
        ]);
        setListaEntrenamientos(resEnt.data.entrenamientos || []);
        setListaPartidos(resPart.data.partidos || []);
      } else if (activeTab === "entrenamientos") {
        const res = await entrenamientos.listar();
        setListaEntrenamientos(res.data.entrenamientos || []);
      } else {
        const res = await partidos.listar();
        setListaPartidos(res.data.partidos || []);
      }
    } catch (error) {
      console.error("Error al cargar datos:", error);
    }
  };

  const cargarJugadores = async () => {
    try {
      const res = await auth.listarJugadores();
      setListaJugadores(res.data.jugadores || []);
    } catch (error) {
      console.error("Error al cargar jugadores:", error);
    }
  };

  const handleCambiarEstadoJugador = async (jugadorId, nuevoEstado) => {
    try {
      await auth.cambiarEstadoJugador(jugadorId, nuevoEstado);
      await cargarJugadores();
      alert(
        nuevoEstado
          ? "Jugador activado correctamente"
          : "Jugador desactivado correctamente"
      );
    } catch (error) {
      console.error("Error al cambiar estado del jugador:", error);
      alert("Error al cambiar el estado del jugador");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };

  const handleRegistrarJugador = async (e) => {
    e.preventDefault();
    try {
      const data = {
        nombre: jugadorFormData.nombre,
        email: jugadorFormData.email,
        password: jugadorFormData.password,
        datosJugador: {
          numeroDorsal: jugadorFormData.dorsal || null,
          posicionId: jugadorFormData.posicion
            ? parseInt(jugadorFormData.posicion)
            : null,
          alias: jugadorFormData.alias || null,
        },
      };

      await auth.registrarJugador(data);
      alert("Jugador registrado exitosamente");
      setShowJugadorModal(false);
      setJugadorFormData({
        nombre: "",
        email: "",
        password: "",
        alias: "",
        dorsal: "",
        posicion: "",
      });
      cargarJugadores(); // Recargar lista de jugadores
    } catch (error) {
      console.error("Error al registrar jugador:", error);
      alert(error.response?.data?.error || "Error al registrar jugador");
    }
  };

  const abrirModal = (evento = null, tipo = null) => {
    if (evento) {
      setEventoSeleccionado(evento);
      // Detectar el tipo de evento basado en sus propiedades
      const tipoDetectado = evento.rival ? "partidos" : "entrenamientos";
      setTipoEvento(tipoDetectado);
      setFormData({
        fecha: evento.fecha.split("T")[0],
        hora: evento.hora,
        ubicacion: evento.ubicacion,
        descripcion: evento.descripcion || "",
        rival: evento.rival || "",
        tipo: evento.tipo || "amistoso",
        es_local: evento.es_local !== undefined ? evento.es_local : true,
        resultado: evento.resultado || "",
      });
    } else {
      setEventoSeleccionado(null);
      setFormData({
        fecha: "",
        hora: "",
        ubicacion: "",
        descripcion: "",
        rival: "",
        tipo: "amistoso",
        es_local: true,
        resultado: "",
      });
      // Si estamos en vista 'todos', establecer el tipo específico para crear
      if (tipo) {
        setTipoEvento(tipo);
      }
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Determinar el tipo de evento a usar
      const tipoAUsar = activeTab === "todos" ? tipoEvento : activeTab;

      if (tipoAUsar === "entrenamientos") {
        const data = {
          fecha: formData.fecha,
          hora: formData.hora,
          ubicacion: formData.ubicacion,
          descripcion: formData.descripcion || null,
        };
        if (eventoSeleccionado) {
          await entrenamientos.actualizar(eventoSeleccionado.id, data);
        } else {
          await entrenamientos.crear(data);
        }
      } else {
        const data = {
          fecha: formData.fecha,
          hora: formData.hora,
          ubicacion: formData.ubicacion,
          rival: formData.rival,
          tipo: formData.tipo,
          es_local: formData.es_local,
          resultado: formData.resultado || null,
        };
        if (eventoSeleccionado) {
          await partidos.actualizar(eventoSeleccionado.id, data);
        } else {
          await partidos.crear(data);
        }
      }
      setShowModal(false);
      cargarDatos();
    } catch (error) {
      alert(error.response?.data?.error || "Error al guardar");
    }
  };

  const handleEliminar = async (id, tipoEventoParam = null) => {
    if (!confirm("¿Estás seguro de eliminar este evento?")) return;
    try {
      const tipoAUsar = tipoEventoParam || activeTab;
      if (tipoAUsar === "entrenamientos") {
        await entrenamientos.eliminar(id);
      } else {
        await partidos.eliminar(id);
      }
      cargarDatos();
    } catch (error) {
      alert(error.response?.data?.error || "Error al eliminar");
    }
  };

  const verDetalle = (id, tipoEvento = null) => {
    let tipo;
    if (tipoEvento) {
      // Si se pasa el tipo directamente (desde vista "todos")
      tipo = tipoEvento;
    } else {
      // Si no se pasa, usar el activeTab
      tipo = activeTab;
    }
    navigate(`/asistencia/${tipo}/${id}`);
  };

  // Funciones para el calendario
  const getDiasDelMes = () => {
    const year = mesActual.getFullYear();
    const month = mesActual.getMonth();
    const primerDia = new Date(year, month, 1);
    const ultimoDia = new Date(year, month + 1, 0);
    const diasEnMes = ultimoDia.getDate();
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
    const fechaStr = fecha.toISOString().split("T")[0];
    let eventos = [];
    if (activeTab === "todos") {
      const entrenamientos = listaEntrenamientos
        .filter((e) => e.fecha.split("T")[0] === fechaStr)
        .map((e) => ({ ...e, tipoEvento: "entrenamientos" }));
      const partidos = listaPartidos
        .filter((e) => e.fecha.split("T")[0] === fechaStr)
        .map((e) => ({ ...e, tipoEvento: "partidos" }));
      eventos = [...entrenamientos, ...partidos].sort((a, b) =>
        a.hora.localeCompare(b.hora)
      );
    } else {
      eventos =
        activeTab === "entrenamientos" ? listaEntrenamientos : listaPartidos;
      eventos = eventos.filter((e) => e.fecha.split("T")[0] === fechaStr);
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
      // Combinar entrenamientos y partidos
      const entrenamientosConTipo = listaEntrenamientos.map((e) => ({
        ...e,
        tipoEvento: "entrenamientos",
      }));
      const partidosConTipo = listaPartidos.map((p) => ({
        ...p,
        tipoEvento: "partidos",
      }));
      eventos = [...entrenamientosConTipo, ...partidosConTipo].sort((a, b) => {
        const fechaA = new Date(a.fecha);
        const fechaB = new Date(b.fecha);
        return fechaB.getTime() - fechaA.getTime(); // Más recientes primero
      });
    } else {
      eventos =
        activeTab === "entrenamientos" ? listaEntrenamientos : listaPartidos;
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
                className="bg-white rounded-lg shadow p-3 sm:p-4"
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                  <div className="flex-1 text-center sm:text-left">
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
                    <h4 className="font-semibold text-xl sm:text-lg">
                      {new Date(evento.fecha).toLocaleDateString("es-ES", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </h4>
                    {!esEntrenamiento && (
                      <p className="text-gray-800 font-medium text-lg sm:text-base">
                        {evento.es_local ? "🏠" : "✈️"} vs {evento.rival}
                      </p>
                    )}
                    <p className="text-gray-600 text-lg sm:text-sm">
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
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:flex-shrink-0">
                    <button
                      onClick={() => {
                        if (activeTab === "todos") {
                          navigate(
                            `/asistencia/${evento.tipoEvento}/${evento.id}`
                          );
                        } else {
                          verDetalle(evento.id);
                        }
                      }}
                      className="bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600 whitespace-nowrap"
                    >
                      Ver Asistencia
                    </button>
                    <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-2">
                      <button
                        onClick={() => abrirModal(evento)}
                        className="bg-yellow-500 text-white px-3 py-2 rounded text-sm hover:bg-yellow-600"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() =>
                          handleEliminar(evento.id, evento.tipoEvento)
                        }
                        className="bg-red-500 text-white px-3 py-2 rounded text-sm hover:bg-red-600"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
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

    // Función para calcular estadísticas de asistencia
    const getEstadisticasEvento = (evento) => {
      if (!evento.asistencias)
        return { confirmados: 0, noAsisten: 0, pendientes: 0 };
      return {
        confirmados: evento.asistencias.filter((a) => a.estado === "confirmado")
          .length,
        noAsisten: evento.asistencias.filter((a) => a.estado === "no_asiste")
          .length,
        pendientes: evento.asistencias.filter((a) => a.estado === "pendiente")
          .length,
      };
    };

    const nombresDiasCortos = ["L", "M", "X", "J", "V", "S", "D"];

    return (
      <div className="bg-white rounded-lg shadow p-2 sm:p-4">
        {/* Navegación del mes */}
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <button
            onClick={() => cambiarMes(-1)}
            className="bg-gray-200 hover:bg-gray-300 px-2 sm:px-4 py-1.5 sm:py-2 rounded text-sm sm:text-base"
          >
            ←
          </button>
          <h3 className="text-base sm:text-xl font-bold capitalize">
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

        {/* Cabecera días de la semana */}
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
                        const stats = getEstadisticasEvento(evento);
                        const esEntrenamiento =
                          activeTab === "todos"
                            ? evento.tipoEvento === "entrenamientos"
                            : activeTab === "entrenamientos";

                        return (
                          <div
                            key={`${evento.tipoEvento || activeTab}-${
                              evento.id
                            }`}
                            onClick={() => {
                              if (activeTab === "todos") {
                                navigate(
                                  `/asistencia/${evento.tipoEvento}/${evento.id}`
                                );
                              } else {
                                verDetalle(evento.id);
                              }
                            }}
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
                              <span className="truncate text-[8px] sm:text-xs">
                                {evento.hora}
                              </span>
                              <span className="text-xs sm:text-sm">
                                {esEntrenamiento ? "📋" : "⚽"}
                              </span>
                            </div>
                            <div className="text-[8px] sm:text-[10px] truncate mb-0.5 sm:mb-1 text-gray-600 hidden sm:block">
                              {esEntrenamiento
                                ? evento.ubicacion
                                : `vs ${evento.rival}`}
                            </div>
                            <div className="flex gap-0.5 sm:gap-1 text-[8px] sm:text-[10px]">
                              <span
                                className="bg-green-200 text-green-800 px-0.5 sm:px-1 rounded"
                                title="Confirmados"
                              >
                                ✓ {stats.confirmados}
                              </span>
                              <span
                                className="bg-red-200 text-red-800 px-0.5 sm:px-1 rounded"
                                title="No asisten"
                              >
                                ✗ {stats.noAsisten}
                              </span>
                              <span
                                className="bg-yellow-200 text-yellow-800 px-0.5 sm:px-1 rounded hidden sm:inline"
                                title="Pendientes"
                              >
                                ⏳ {stats.pendientes}
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
          <h1 className="text-lg sm:text-2xl font-bold text-gray-800">
            ⚽ <span className="hidden sm:inline">FútbolClub - </span>Gestor
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
            <button
              onClick={() => setActiveTab("jugadores")}
              className={`px-4 sm:px-6 py-2 rounded-lg font-medium whitespace-nowrap text-sm sm:text-base flex-shrink-0 ${
                activeTab === "jugadores"
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              👥 Jugadores
            </button>
          </div>

          {/* Botones de vista */}
          {activeTab !== "jugadores" && (
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
          )}
        </div>

        <div className="mb-3 sm:mb-4">
          {activeTab === "jugadores" ? (
            <button
              onClick={() => setShowJugadorModal(true)}
              className="bg-green-500 text-white px-4 sm:px-6 py-2 rounded hover:bg-green-600 text-sm sm:text-base"
            >
              + Registrar Jugador
            </button>
          ) : activeTab === "todos" ? (
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={() => abrirModal(null, "entrenamientos")}
                className="bg-green-500 text-white px-4 sm:px-6 py-2 rounded hover:bg-green-600 text-sm sm:text-base"
              >
                + Crear Entrenamiento
              </button>
              <button
                onClick={() => abrirModal(null, "partidos")}
                className="bg-blue-600 text-white px-4 sm:px-6 py-2 rounded hover:bg-blue-700 text-sm sm:text-base"
              >
                + Crear Partido
              </button>
            </div>
          ) : (
            <button
              onClick={() => abrirModal()}
              className="bg-green-500 text-white px-4 sm:px-6 py-2 rounded hover:bg-green-600 w-full sm:w-auto text-sm sm:text-base"
            >
              + Crear{" "}
              {activeTab === "entrenamientos" ? "Entrenamiento" : "Partido"}
            </button>
          )}
        </div>

        {activeTab === "jugadores" ? (
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">
              Lista de Jugadores ({listaJugadores.length})
            </h3>

            {listaJugadores.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                No hay jugadores registrados. Haz clic en "Registrar Jugador"
                para añadir el primero.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {listaJugadores.map((jugador) => (
                  <div
                    key={jugador.id}
                    className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
                      jugador.activo
                        ? "border-gray-200 bg-white"
                        : "border-gray-300 bg-gray-50 opacity-60"
                    }`}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div
                        className={`${
                          jugador.color === "red"
                            ? "bg-red-500"
                            : jugador.color === "orangered"
                            ? "bg-orange-600"
                            : "bg-blue-500"
                        } text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold flex-shrink-0`}
                      >
                        {jugador.abreviatura || "J"}
                        {jugador.numero_dorsal || ""}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-lg font-semibold text-gray-800 truncate">
                            {jugador.nombre}
                            {jugador.alias && (
                              <span className="text-blue-600 ml-2">
                                "{jugador.alias}"
                              </span>
                            )}
                          </h4>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              jugador.activo
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {jugador.activo ? "Activo" : "Inactivo"}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 truncate">
                          {jugador.email}
                        </p>
                        {jugador.posicion && (
                          <p className="text-sm text-gray-500 mt-1">
                            📍 {jugador.posicion}
                          </p>
                        )}
                        {jugador.telefono && (
                          <p className="text-sm text-gray-500">
                            📞 {jugador.telefono}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        handleCambiarEstadoJugador(jugador.id, !jugador.activo)
                      }
                      className={`w-full text-sm px-3 py-2 rounded font-medium transition ${
                        jugador.activo
                          ? "bg-red-100 text-red-700 hover:bg-red-200"
                          : "bg-green-100 text-green-700 hover:bg-green-200"
                      }`}
                    >
                      {jugador.activo ? "🔒 Desactivar" : "✅ Activar"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : vistaMode === "lista" ? (
          renderVistaLista()
        ) : (
          renderVistaCalendario()
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto z-50">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md my-4 sm:my-8 max-h-[95vh] overflow-y-auto">
            <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">
              {eventoSeleccionado ? "Editar" : "Crear"}{" "}
              {activeTab === "todos"
                ? tipoEvento === "entrenamientos"
                  ? "Entrenamiento"
                  : "Partido"
                : activeTab === "entrenamientos"
                ? "Entrenamiento"
                : "Partido"}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-2 sm:mb-3">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Fecha
                </label>
                <input
                  type="date"
                  required
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-md text-sm sm:text-base"
                  value={formData.fecha}
                  onChange={(e) =>
                    setFormData({ ...formData, fecha: e.target.value })
                  }
                />
              </div>

              <div className="mb-2 sm:mb-3">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Hora
                </label>
                <input
                  type="time"
                  required
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-md text-sm sm:text-base"
                  value={formData.hora}
                  onChange={(e) =>
                    setFormData({ ...formData, hora: e.target.value })
                  }
                />
              </div>

              <div className="mb-2 sm:mb-3">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Ubicación
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-md text-sm sm:text-base"
                  value={formData.ubicacion}
                  onChange={(e) =>
                    setFormData({ ...formData, ubicacion: e.target.value })
                  }
                />
              </div>

              {activeTab === "entrenamientos" ||
              (activeTab === "todos" && tipoEvento === "entrenamientos") ? (
                <div className="mb-2 sm:mb-3">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-md text-sm sm:text-base"
                    rows="2"
                    value={formData.descripcion}
                    onChange={(e) =>
                      setFormData({ ...formData, descripcion: e.target.value })
                    }
                  />
                </div>
              ) : (
                <>
                  <div className="mb-2 sm:mb-3">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Rival
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-md text-sm sm:text-base"
                      value={formData.rival}
                      onChange={(e) =>
                        setFormData({ ...formData, rival: e.target.value })
                      }
                    />
                  </div>

                  <div className="mb-2 sm:mb-3">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Tipo
                    </label>
                    <select
                      required
                      className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-md text-sm sm:text-base"
                      value={formData.tipo}
                      onChange={(e) =>
                        setFormData({ ...formData, tipo: e.target.value })
                      }
                    >
                      <option value="amistoso">Amistoso</option>
                      <option value="liga">Liga</option>
                      <option value="copa">Copa</option>
                      <option value="torneo">Torneo</option>
                    </select>
                  </div>

                  <div className="mb-2 sm:mb-3 flex items-center">
                    <input
                      type="checkbox"
                      id="esLocal"
                      className="mr-2 w-4 h-4"
                      checked={formData.es_local}
                      onChange={(e) =>
                        setFormData({ ...formData, es_local: e.target.checked })
                      }
                    />
                    <label
                      htmlFor="esLocal"
                      className="text-xs sm:text-sm font-medium text-gray-700"
                    >
                      Partido en casa
                    </label>
                  </div>

                  <div className="mb-2 sm:mb-3">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Resultado (opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: 3-1"
                      className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-md text-sm sm:text-base"
                      value={formData.resultado}
                      onChange={(e) =>
                        setFormData({ ...formData, resultado: e.target.value })
                      }
                    />
                  </div>
                </>
              )}

              <div className="flex gap-2 mt-3 sm:mt-4">
                <button
                  type="submit"
                  className="flex-1 bg-green-500 text-white py-2.5 sm:py-2 px-4 rounded hover:bg-green-600 text-sm sm:text-base font-medium"
                >
                  Guardar
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2.5 sm:py-2 px-4 rounded hover:bg-gray-400 text-sm sm:text-base font-medium"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showJugadorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto z-50">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md my-4 sm:my-8 max-h-[95vh] overflow-y-auto">
            <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">
              Registrar Nuevo Jugador
            </h3>
            <form onSubmit={handleRegistrarJugador}>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={jugadorFormData.nombre}
                  onChange={(e) =>
                    setJugadorFormData({
                      ...jugadorFormData,
                      nombre: e.target.value,
                    })
                  }
                />
              </div>

              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={jugadorFormData.email}
                  onChange={(e) =>
                    setJugadorFormData({
                      ...jugadorFormData,
                      email: e.target.value,
                    })
                  }
                />
              </div>

              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alias
                </label>
                <input
                  type="text"
                  placeholder="Nombre de pila o apodo"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={jugadorFormData.alias}
                  onChange={(e) =>
                    setJugadorFormData({
                      ...jugadorFormData,
                      alias: e.target.value,
                    })
                  }
                />
              </div>

              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña *
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={jugadorFormData.password}
                  onChange={(e) =>
                    setJugadorFormData({
                      ...jugadorFormData,
                      password: e.target.value,
                    })
                  }
                />
                <p className="text-xs text-gray-500 mt-1">
                  Mínimo 6 caracteres
                </p>
              </div>

              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dorsal
                </label>
                <input
                  type="number"
                  min="1"
                  max="99"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={jugadorFormData.dorsal}
                  onChange={(e) =>
                    setJugadorFormData({
                      ...jugadorFormData,
                      dorsal: e.target.value,
                    })
                  }
                />
              </div>

              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Posición
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={jugadorFormData.posicion}
                  onChange={(e) =>
                    setJugadorFormData({
                      ...jugadorFormData,
                      posicion: e.target.value,
                    })
                  }
                >
                  <option value="">Seleccionar...</option>
                  {posiciones.map((pos) => (
                    <option key={pos.id} value={pos.id}>
                      {pos.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  type="submit"
                  className="flex-1 bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 font-medium"
                >
                  Registrar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowJugadorModal(false);
                    setJugadorFormData({
                      nombre: "",
                      email: "",
                      password: "",
                      alias: "",
                      dorsal: "",
                      posicion: "",
                    });
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400 font-medium"
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
