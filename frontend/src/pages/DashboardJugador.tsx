import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { entrenamientos, partidos, motivos } from "../services/api";
import { useAuthContext } from "@contexts";
import {
  HeaderJugador,
  TabsJugador,
  ViewModeSelectorJugador,
  EventosListaJugador,
  CalendarioEventosJugador,
  ModalAsistencia,
} from "../components/jugador";
import type {
  TabJugador,
  VistaMode,
  AsistenciaFormData,
  MotivoAusenciaDTO,
} from "../components/jugador";
import type {
  EntrenamientoWithAsistenciaDTO,
  PartidoWithAsistenciaDTO,
  EventoWithTipoDTO,
} from "../components/jugador/EventoCardJugador";

export default function DashboardJugador() {
  const { usuario, logout } = useAuthContext();
  const [misEntrenamientos, setMisEntrenamientos] = useState<
    EntrenamientoWithAsistenciaDTO[]
  >([]);
  const [misPartidos, setMisPartidos] = useState<PartidoWithAsistenciaDTO[]>(
    []
  );
  const [motivosAusencia, setMotivosAusencia] = useState<MotivoAusenciaDTO[]>(
    []
  );
  const [showModal, setShowModal] = useState(false);
  const [eventoSeleccionado, setEventoSeleccionado] = useState<
    (EventoWithTipoDTO & { tipo: "entrenamiento" | "partido" }) | null
  >(null);
  const [asistenciaForm, setAsistenciaForm] = useState<AsistenciaFormData>({
    estado: "",
    motivo_ausencia_id: null,
    comentarios: "",
  });
  const [activeTab, setActiveTab] = useState<TabJugador>("todos");
  const [vistaMode, setVistaMode] = useState<VistaMode>("calendario");
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
      setMisEntrenamientos(
        (entRes.data.entrenamientos as EntrenamientoWithAsistenciaDTO[]) || []
      );
      setMisPartidos(
        (partRes.data.partidos as PartidoWithAsistenciaDTO[]) || []
      );
      setMotivosAusencia(motRes.data.motivos || []);
    } catch (error) {
      console.error("Error al cargar datos:", error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const abrirModalAsistencia = (
    evento: EventoWithTipoDTO,
    tipo: "entrenamiento" | "partido"
  ) => {
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

  const handleSubmitAsistencia = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!eventoSeleccionado) return;

    const data: {
      estado: string;
      comentario?: string;
      motivoAusenciaId?: number;
    } = {
      estado: asistenciaForm.estado,
      comentario: asistenciaForm.comentarios || undefined,
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
    } catch (error: any) {
      console.error("Error completo:", error);
      alert(
        error.response?.data?.error ||
          error.message ||
          "Error al registrar asistencia"
      );
    }
  };

  const cambiarMes = (direccion: number) => {
    const nuevaFecha = new Date(mesActual);
    nuevaFecha.setMonth(mesActual.getMonth() + direccion);
    setMesActual(nuevaFecha);
  };

  const handleFormChange = (data: Partial<AsistenciaFormData>) => {
    setAsistenciaForm((prev) => ({ ...prev, ...data }));
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <HeaderJugador userName={usuario?.nombre ?? ""} onLogout={handleLogout} />

      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          <TabsJugador activeTab={activeTab} onTabChange={setActiveTab} />
          <ViewModeSelectorJugador
            vistaMode={vistaMode}
            onViewModeChange={setVistaMode}
          />
        </div>

        {vistaMode === "lista" ? (
          <EventosListaJugador
            entrenamientos={misEntrenamientos}
            partidos={misPartidos}
            activeTab={activeTab}
            onModificarAsistencia={abrirModalAsistencia}
          />
        ) : (
          <CalendarioEventosJugador
            entrenamientos={misEntrenamientos}
            partidos={misPartidos}
            activeTab={activeTab}
            mesActual={mesActual}
            onCambiarMes={cambiarMes}
            onModificarAsistencia={abrirModalAsistencia}
          />
        )}
      </div>

      <ModalAsistencia
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmitAsistencia}
        formData={asistenciaForm}
        onFormChange={handleFormChange}
        motivosAusencia={motivosAusencia}
      />
    </div>
  );
}
