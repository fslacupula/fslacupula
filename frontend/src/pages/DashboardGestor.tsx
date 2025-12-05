import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, useEventos } from "../application";
import type { Entrenamiento, Partido } from "@domain";
import api from "../services/api";
import {
  HeaderGestor,
  TabsGestor,
  ViewModeSelector,
  EventosLista,
  CalendarioEventos,
  ModalEvento,
  ListaJugadores,
  ModalJugador,
  type Tab,
  type VistaMode,
} from "../components/gestor";

interface Posicion {
  id: number;
  nombre: string;
  abreviatura: string;
}

interface Usuario {
  id: number;
  nombre: string;
  email: string;
  activo: boolean;
}

/**
 * Dashboard del Gestor - Versión Refactorizada
 *
 * Mejoras implementadas:
 * - Componentes modulares y reutilizables
 * - TypeScript con type safety
 * - Hooks personalizados (useAuth, useEventos)
 * - Domain entities (Entrenamiento, Partido)
 * - Arquitectura limpia y mantenible
 */
export default function DashboardGestor() {
  const navigate = useNavigate();
  const { usuario, logout } = useAuth();
  const {
    entrenamientos: listaEntrenamientos,
    partidos: listaPartidos,
    isLoading,
    crearEntrenamiento,
    crearPartido,
    actualizarEntrenamiento,
    actualizarPartido,
    eliminarEntrenamiento,
    eliminarPartido,
    recargar,
  } = useEventos();

  // Estado de UI
  const [activeTab, setActiveTab] = useState<Tab>("todos");
  const [vistaMode, setVistaMode] = useState<VistaMode>("calendario");
  const [mesActual, setMesActual] = useState(new Date());

  // Modales
  const [showModal, setShowModal] = useState(false);
  const [showJugadorModal, setShowJugadorModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [eventoSeleccionado, setEventoSeleccionado] = useState<{
    evento: Entrenamiento | Partido;
    tipo: "entrenamiento" | "partido";
  } | null>(null);

  // Formularios
  const [tipoEvento, setTipoEvento] = useState<"entrenamiento" | "partido">(
    "entrenamiento"
  );
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

  // Datos adicionales
  const [listaJugadores, setListaJugadores] = useState<Usuario[]>([]);
  const [posiciones, setPosiciones] = useState<Posicion[]>([]);

  // Cargar posiciones al montar
  useEffect(() => {
    cargarPosiciones();
  }, []);

  // Cargar jugadores cuando la pestaña cambia
  useEffect(() => {
    if (activeTab === "jugadores") {
      cargarJugadores();
    }
  }, [activeTab]);

  // Verificar autenticación
  useEffect(() => {
    if (!usuario || !usuario.esGestor()) {
      navigate("/login");
    }
  }, [usuario, navigate]);

  const cargarPosiciones = async () => {
    try {
      const response = await api.posiciones.listar();
      setPosiciones(response.data.posiciones);
    } catch (err) {
      console.error("Error al cargar posiciones:", err);
    }
  };

  const cargarJugadores = async () => {
    try {
      const response = await api.auth.listarJugadores();
      setListaJugadores(response.data.jugadores);
    } catch (err) {
      console.error("Error al cargar jugadores:", err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
  };

  const handleAbrirModalCrear = (tipo: "entrenamiento" | "partido") => {
    setTipoEvento(tipo);
    setModoEdicion(false);
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
    setShowModal(true);
  };

  const handleAbrirModalEditar = (
    evento: Entrenamiento | Partido,
    tipo: "entrenamiento" | "partido"
  ) => {
    setTipoEvento(tipo);
    setModoEdicion(true);
    setEventoSeleccionado({ evento, tipo });

    if (tipo === "entrenamiento") {
      const ent = evento as Entrenamiento;
      setFormData({
        fecha: ent.fechaHora.getFechaString(),
        hora: ent.hora,
        ubicacion: ent.ubicacion,
        descripcion: ent.descripcion || "",
        rival: "",
        tipo: "amistoso",
        es_local: true,
        resultado: "",
      });
    } else {
      const part = evento as Partido;
      setFormData({
        fecha: part.fechaHora.getFechaString(),
        hora: part.hora,
        ubicacion: part.ubicacion,
        descripcion: "",
        rival: part.rival,
        tipo: part.tipo,
        es_local: part.esLocal,
        resultado: part.resultado || "",
      });
    }

    setShowModal(true);
  };

  const handleSubmitEvento = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (modoEdicion && eventoSeleccionado) {
        // Actualizar evento existente
        if (tipoEvento === "entrenamiento") {
          await actualizarEntrenamiento(eventoSeleccionado.evento.id, {
            fecha: formData.fecha,
            hora: formData.hora,
            ubicacion: formData.ubicacion,
            descripcion: formData.descripcion,
            duracionMinutos: undefined,
          });
        } else {
          await actualizarPartido(eventoSeleccionado.evento.id, {
            fecha: formData.fecha,
            hora: formData.hora,
            ubicacion: formData.ubicacion,
            rival: formData.rival,
            tipo: formData.tipo as "amistoso" | "liga" | "copa" | "torneo",
            esLocal: formData.es_local,
          });

          // Actualizar resultado si existe
          if (formData.resultado) {
            await actualizarPartido(eventoSeleccionado.evento.id, {
              fecha: formData.fecha,
              hora: formData.hora,
              ubicacion: formData.ubicacion,
              rival: formData.rival,
              tipo: formData.tipo as "amistoso" | "liga" | "copa" | "torneo",
              esLocal: formData.es_local,
            });
          }
        }
      } else {
        // Crear nuevo evento
        if (tipoEvento === "entrenamiento") {
          await crearEntrenamiento({
            fecha: formData.fecha,
            hora: formData.hora,
            ubicacion: formData.ubicacion,
            descripcion: formData.descripcion,
          });
        } else {
          await crearPartido({
            fecha: formData.fecha,
            hora: formData.hora,
            ubicacion: formData.ubicacion,
            rival: formData.rival,
            tipo: formData.tipo as "amistoso" | "liga" | "copa" | "torneo",
            esLocal: formData.es_local,
          });
        }
      }

      setShowModal(false);
      recargar();
    } catch (error) {
      console.error("Error al guardar evento:", error);
      alert("Error al guardar el evento");
    }
  };

  const handleEliminarEvento = async (
    id: number,
    tipo: "entrenamiento" | "partido"
  ) => {
    if (!confirm("¿Estás seguro de eliminar este evento?")) return;

    try {
      if (tipo === "entrenamiento") {
        await eliminarEntrenamiento(id);
      } else {
        await eliminarPartido(id);
      }
      recargar();
    } catch (error) {
      console.error("Error al eliminar evento:", error);
      alert("Error al eliminar el evento");
    }
  };

  const handleVerDetalle = (id: number, tipo: "entrenamiento" | "partido") => {
    navigate(
      `/asistencia/${
        tipo === "entrenamiento" ? "entrenamientos" : "partidos"
      }/${id}`
    );
  };

  const handleSubmitJugador = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await api.auth.registrarJugador({
        nombre: jugadorFormData.nombre,
        email: jugadorFormData.email,
        password: jugadorFormData.password,
        datosJugador: {
          numeroDorsal: jugadorFormData.dorsal
            ? parseInt(jugadorFormData.dorsal)
            : undefined,
          posicionId: jugadorFormData.posicion
            ? parseInt(jugadorFormData.posicion)
            : undefined,
          alias: jugadorFormData.alias || undefined,
        },
      });

      setShowJugadorModal(false);
      setJugadorFormData({
        nombre: "",
        email: "",
        password: "",
        alias: "",
        dorsal: "",
        posicion: "",
      });
      cargarJugadores();
    } catch (error) {
      console.error("Error al crear jugador:", error);
      alert("Error al crear el jugador");
    }
  };

  const handleToggleJugadorEstado = async (
    id: number,
    estadoActual: boolean
  ) => {
    try {
      await api.auth.cambiarEstadoJugador(id, !estadoActual);
      cargarJugadores();
    } catch (error) {
      console.error("Error al cambiar estado:", error);
      alert("Error al cambiar el estado del jugador");
    }
  };

  // Filtrar eventos según pestaña activa
  const entrenamientosFiltrados =
    activeTab === "entrenamientos" || activeTab === "todos"
      ? listaEntrenamientos
      : [];
  const partidosFiltrados =
    activeTab === "partidos" || activeTab === "todos" ? listaPartidos : [];

  if (!usuario) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <HeaderGestor userName={usuario.nombre} onLogout={handleLogout} />

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Tabs y controles */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          <TabsGestor activeTab={activeTab} onTabChange={handleTabChange} />

          <div className="flex gap-2 flex-wrap">
            {activeTab !== "jugadores" && (
              <>
                <ViewModeSelector
                  mode={vistaMode}
                  onModeChange={setVistaMode}
                />

                <button
                  onClick={() =>
                    handleAbrirModalCrear(
                      activeTab === "partidos" ? "partido" : "entrenamiento"
                    )
                  }
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium"
                >
                  + Crear{" "}
                  {activeTab === "partidos" ? "Partido" : "Entrenamiento"}
                </button>
              </>
            )}

            {activeTab === "jugadores" && (
              <button
                onClick={() => setShowJugadorModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium"
              >
                + Añadir Jugador
              </button>
            )}

            {activeTab === "partidos" && (
              <button
                onClick={() => navigate("/configurar-partido")}
                className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors font-medium flex items-center gap-2"
              >
                ⚙️ Configurar Partido
              </button>
            )}
          </div>
        </div>

        {/* Contenido según pestaña */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-gray-600">Cargando...</p>
          </div>
        ) : activeTab === "jugadores" ? (
          <ListaJugadores
            jugadores={listaJugadores}
            onToggleEstado={handleToggleJugadorEstado}
          />
        ) : vistaMode === "lista" ? (
          <EventosLista
            entrenamientos={entrenamientosFiltrados}
            partidos={partidosFiltrados}
            onVerDetalle={handleVerDetalle}
            onEditar={handleAbrirModalEditar}
            onEliminar={handleEliminarEvento}
          />
        ) : (
          <CalendarioEventos
            entrenamientos={entrenamientosFiltrados}
            partidos={partidosFiltrados}
            mesActual={mesActual}
            onMesAnterior={() =>
              setMesActual(
                new Date(mesActual.getFullYear(), mesActual.getMonth() - 1, 1)
              )
            }
            onMesSiguiente={() =>
              setMesActual(
                new Date(mesActual.getFullYear(), mesActual.getMonth() + 1, 1)
              )
            }
            onEventoClick={handleVerDetalle}
          />
        )}
      </div>

      {/* Modales */}
      <ModalEvento
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmitEvento}
        tipoEvento={tipoEvento}
        modoEdicion={modoEdicion}
        formData={formData}
        onFormChange={(field, value) =>
          setFormData({ ...formData, [field]: value })
        }
      />

      <ModalJugador
        isOpen={showJugadorModal}
        onClose={() => setShowJugadorModal(false)}
        onSubmit={handleSubmitJugador}
        formData={jugadorFormData}
        onFormChange={(field, value) =>
          setJugadorFormData({ ...jugadorFormData, [field]: value })
        }
        posiciones={posiciones}
      />
    </div>
  );
}
