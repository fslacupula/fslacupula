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

  const nombresDias = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

  // Calcular días del mes (empezando en lunes)
  const primerDia = new Date(mesActual.getFullYear(), mesActual.getMonth(), 1);
  const ultimoDia = new Date(
    mesActual.getFullYear(),
    mesActual.getMonth() + 1,
    0
  );
  const diasEnMes = ultimoDia.getDate();
  let primerDiaSemana = primerDia.getDay();

  // Ajustar para que lunes sea 0 (domingo es 6)
  primerDiaSemana = primerDiaSemana === 0 ? 6 : primerDiaSemana - 1;

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
                  {ents.map((e) => {
                    const stats = e.contarAsistencias();
                    return (
                      <div
                        key={`ent-${e.id}`}
                        onClick={() => onEventoClick(e.id, "entrenamiento")}
                        className="text-[8px] sm:text-xs bg-green-50 border border-green-200 p-0.5 sm:p-1 rounded cursor-pointer hover:bg-green-100"
                        title={`Entrenamiento ${e.hora} - ${e.ubicacion}`}
                      >
                        <div className="font-semibold flex items-center justify-between">
                          <span className="truncate text-[8px] sm:text-xs">
                            {e.hora}
                          </span>
                          <span className="text-xs sm:text-sm">📋</span>
                        </div>
                        <div className="text-[8px] sm:text-[10px] truncate text-gray-600 hidden sm:block">
                          {e.ubicacion}
                        </div>
                        <div className="flex gap-0.5 sm:gap-1 text-[8px] sm:text-[10px] mt-0.5">
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
                            ✗ {stats.ausentes}
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
                  {parts.map((p) => {
                    const stats = p.contarAsistencias();
                    return (
                      <div
                        key={`part-${p.id}`}
                        onClick={() => onEventoClick(p.id, "partido")}
                        className="text-[8px] sm:text-xs bg-blue-50 border border-blue-200 p-0.5 sm:p-1 rounded cursor-pointer hover:bg-blue-100"
                        title={`Partido vs ${p.rival}`}
                      >
                        <div className="font-semibold flex items-center justify-between">
                          <span className="truncate text-[8px] sm:text-xs">
                            {p.hora}
                          </span>
                          <span className="text-xs sm:text-sm">⚽</span>
                        </div>
                        <div className="text-[8px] sm:text-[10px] truncate text-gray-600 hidden sm:block">
                          vs {p.rival}
                        </div>
                        <div className="flex gap-0.5 sm:gap-1 text-[8px] sm:text-[10px] mt-0.5">
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
                            ✗ {stats.ausentes}
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
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
