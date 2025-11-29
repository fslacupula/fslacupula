import type { Entrenamiento, Partido } from "@domain";

interface CalendarioEventosProps {
  entrenamientos: Entrenamiento[];
  partidos: Partido[];
  mesActual: Date;
  onMesAnterior: () => void;
  onMesSiguiente: () => void;
  onEventoClick: (id: number, tipo: "entrenamiento" | "partido") => void;
}

/**
 * Vista de calendario con eventos
 * Muestra eventos agrupados por día
 */
export function CalendarioEventos({
  entrenamientos,
  partidos,
  mesActual,
  onMesAnterior,
  onMesSiguiente,
  onEventoClick,
}: CalendarioEventosProps) {
  const nombresMeses = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  const nombresDias = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  // Calcular días del mes
  const primerDia = new Date(mesActual.getFullYear(), mesActual.getMonth(), 1);
  const ultimoDia = new Date(
    mesActual.getFullYear(),
    mesActual.getMonth() + 1,
    0
  );
  const diasEnMes = ultimoDia.getDate();
  const primerDiaSemana = primerDia.getDay();

  // Crear array de días
  const dias: (number | null)[] = [];
  for (let i = 0; i < primerDiaSemana; i++) {
    dias.push(null);
  }
  for (let i = 1; i <= diasEnMes; i++) {
    dias.push(i);
  }

  // Función para obtener eventos de un día
  const getEventosDia = (dia: number) => {
    const fechaBuscada = new Date(
      mesActual.getFullYear(),
      mesActual.getMonth(),
      dia
    );
    const fechaStr = fechaBuscada.toISOString().split("T")[0];

    const entrenamientosDelDia = entrenamientos.filter(
      (e) => e.fechaHora.getFechaString() === fechaStr
    );
    const partidosDelDia = partidos.filter(
      (p) => p.fechaHora.getFechaString() === fechaStr
    );

    return {
      entrenamientos: entrenamientosDelDia,
      partidos: partidosDelDia,
      total: entrenamientosDelDia.length + partidosDelDia.length,
    };
  };

  const hoy = new Date();
  const esHoy = (dia: number) => {
    return (
      dia === hoy.getDate() &&
      mesActual.getMonth() === hoy.getMonth() &&
      mesActual.getFullYear() === hoy.getFullYear()
    );
  };

  return (
    <div className="bg-white rounded-lg shadow p-2 sm:p-4">
      {/* Encabezado del calendario */}
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <button
          onClick={onMesAnterior}
          className="px-2 sm:px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm sm:text-base"
        >
          ← Anterior
        </button>
        <h3 className="text-base sm:text-lg font-bold">
          {nombresMeses[mesActual.getMonth()]} {mesActual.getFullYear()}
        </h3>
        <button
          onClick={onMesSiguiente}
          className="px-2 sm:px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm sm:text-base"
        >
          Siguiente →
        </button>
      </div>

      {/* Nombres de días */}
      <div className="grid grid-cols-7 gap-0.5 sm:gap-2 mb-1 sm:mb-2">
        {nombresDias.map((nombre) => (
          <div
            key={nombre}
            className="text-center font-semibold text-gray-700 text-[10px] sm:text-sm py-1 sm:py-2"
          >
            {nombre}
          </div>
        ))}
      </div>

      {/* Días del mes */}
      <div className="grid grid-cols-7 gap-0.5 sm:gap-2">
        {dias.map((dia, index) => {
          if (dia === null) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }

          const {
            entrenamientos: ents,
            partidos: parts,
            total,
          } = getEventosDia(dia);
          const hayEventos = total > 0;

          return (
            <div
              key={dia}
              className={`aspect-square border rounded p-0.5 sm:p-2 text-xs sm:text-sm ${
                esHoy(dia)
                  ? "bg-indigo-100 border-indigo-500 border-2"
                  : "bg-white border-gray-200"
              } ${hayEventos ? "cursor-pointer hover:bg-gray-50" : ""}`}
            >
              <div className="font-semibold text-gray-900">{dia}</div>
              {hayEventos && (
                <div className="space-y-0.5 sm:space-y-1 mt-1">
                  {ents.map((e) => (
                    <div
                      key={`ent-${e.id}`}
                      onClick={() => onEventoClick(e.id, "entrenamiento")}
                      className="text-[8px] sm:text-[10px] bg-blue-100 text-blue-800 p-0.5 sm:p-1 rounded truncate cursor-pointer hover:bg-blue-200"
                      title={`Entrenamiento: ${
                        e.descripcion || "Sin descripción"
                      }`}
                    >
                      🏃 {e.hora}
                    </div>
                  ))}
                  {parts.map((p) => (
                    <div
                      key={`part-${p.id}`}
                      onClick={() => onEventoClick(p.id, "partido")}
                      className="text-[8px] sm:text-[10px] bg-green-100 text-green-800 p-0.5 sm:p-1 rounded truncate cursor-pointer hover:bg-green-200"
                      title={`Partido vs ${p.rival}`}
                    >
                      ⚽ {p.hora}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
