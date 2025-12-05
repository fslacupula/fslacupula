import { formatearFecha } from "../utils/actaHelpers";

interface Partido {
  id: number;
  fecha_hora: string;
  lugar: string;
  rival: string;
  tipo?: string;
  estado: string;
}

interface Estadisticas {
  duracion_minutos: number;
  goles_local: number;
  goles_visitante: number;
  faltas_local: number;
  faltas_visitante: number;
  faltas_local_primera?: number;
  faltas_local_segunda?: number;
  faltas_visitante_primera?: number;
  faltas_visitante_segunda?: number;
}

interface CabeceraPartidoProps {
  partido: Partido;
  estadisticas: Estadisticas;
}

export default function CabeceraPartido({
  partido,
  estadisticas,
}: CabeceraPartidoProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h1 className="text-3xl font-bold text-center mb-6 text-blue-600">
        ACTA DEL PARTIDO
      </h1>

      {/* Card con información del partido */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6 border-2 border-gray-200 shadow-md">
        <div className="grid grid-cols-6 gap-4">
          {/* Fecha */}
          <div className="flex flex-col items-center text-center">
            <span className="text-3xl mb-2">📅</span>
            <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
              Fecha
            </p>
            <p className="text-sm font-bold text-gray-800">
              {formatearFecha(partido.fecha_hora)}
            </p>
          </div>

          {/* Lugar */}
          <div className="flex flex-col items-center text-center">
            <span className="text-3xl mb-2">📍</span>
            <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
              Lugar
            </p>
            <p className="text-sm font-bold text-gray-800">{partido.lugar}</p>
          </div>

          {/* Rival */}
          <div className="flex flex-col items-center text-center">
            <span className="text-3xl mb-2">🆚</span>
            <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
              Rival
            </p>
            <p className="text-sm font-bold text-gray-800">{partido.rival}</p>
          </div>

          {/* Tipo */}
          <div className="flex flex-col items-center text-center">
            <span className="text-3xl mb-2">🏆</span>
            <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
              Tipo
            </p>
            <p className="text-sm font-bold text-gray-800 capitalize">
              {partido.tipo || "Amistoso"}
            </p>
          </div>

          {/* Duración */}
          <div className="flex flex-col items-center text-center">
            <span className="text-3xl mb-2">⏱️</span>
            <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
              Duración
            </p>
            <p className="text-sm font-bold text-gray-800">
              {estadisticas.duracion_minutos}'
            </p>
          </div>

          {/* Estado */}
          <div className="flex flex-col items-center text-center">
            <span className="text-3xl mb-2">✅</span>
            <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
              Estado
            </p>
            <p className="text-sm font-bold text-green-600 capitalize">
              {partido.estado}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
