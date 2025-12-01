import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { partidos } from "../../services/api";
import { contarTarjetasHistorial } from "./utils/actaHelpers";
import CabeceraPartido from "./components/CabeceraPartido";
import MarcadorPartido from "./components/MarcadorPartido";
import TiempoJugado from "./components/TiempoJugado";
import CronologiaPartido from "./components/CronologiaPartido";

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

  const { partido, estadisticas, jugadores, historial, staff } = acta;

  // Cálculo de totales de tarjetas
  const tarjetasAmarillasLocal =
    jugadores
      .filter((j) => j.equipo === "local")
      .reduce((sum, j) => sum + (j.tarjetas_amarillas || 0), 0) +
    contarTarjetasHistorial(historial, "local", "amarilla");

  const tarjetasRojasLocal =
    jugadores
      .filter((j) => j.equipo === "local")
      .reduce((sum, j) => sum + (j.tarjetas_rojas || 0), 0) +
    contarTarjetasHistorial(historial, "local", "roja");

  const tarjetasAmarillasVisitante =
    jugadores
      .filter((j) => j.equipo === "visitante")
      .reduce((sum, j) => sum + (j.tarjetas_amarillas || 0), 0) +
    contarTarjetasHistorial(historial, "visitante", "amarilla");

  const tarjetasRojasVisitante =
    jugadores
      .filter((j) => j.equipo === "visitante")
      .reduce((sum, j) => sum + (j.tarjetas_rojas || 0), 0) +
    contarTarjetasHistorial(historial, "visitante", "roja");

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

        {/* Cabecera con información del partido */}
        <CabeceraPartido partido={partido} estadisticas={estadisticas} />

        {/* Marcador con goles, tarjetas y faltas */}
        <MarcadorPartido
          partido={partido}
          estadisticas={estadisticas}
          jugadores={jugadores}
          historial={historial}
          tarjetasAmarillasLocal={tarjetasAmarillasLocal}
          tarjetasRojasLocal={tarjetasRojasLocal}
          tarjetasAmarillasVisitante={tarjetasAmarillasVisitante}
          tarjetasRojasVisitante={tarjetasRojasVisitante}
        />

        {/* Layout de 5 columnas: Tiempo Jugado (1/5) y Cronología (4/5) */}
        <div className="grid grid-cols-5 gap-6 mt-6">
          <TiempoJugado jugadores={jugadores} staff={staff} />
          <CronologiaPartido
            historial={historial}
            estadisticas={estadisticas}
          />
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
