import { BolaStaff } from "./BolaStaff";

/**
 * Panel con las 3 bolas de staff técnico (Entrenador, Delegado, Auxiliar)
 */
export const PanelStaff = ({
  estadisticas,
  accionActiva,
  handleDragStart,
  ejecutarAccion,
}) => {
  const staffMembers = [
    { id: "staff-E", letra: "E", nombre: "Entrenador" },
    { id: "staff-D", letra: "D", nombre: "Delegado" },
    { id: "staff-A", letra: "A", nombre: "Auxiliar" },
  ];

  return (
    <div className="flex justify-center gap-2 mb-3">
      {staffMembers.map((staff) => (
        <BolaStaff
          key={staff.id}
          id={staff.id}
          letra={staff.letra}
          nombre={staff.nombre}
          estadisticas={estadisticas}
          accionActiva={accionActiva}
          onDragStart={(e) =>
            handleDragStart(e, {
              id: staff.id,
              nombre: staff.nombre,
              numero_dorsal: staff.letra,
            })
          }
          onDragEnd={(e) => {
            e.target.style.opacity = "1";
          }}
          onClick={() => {
            if (accionActiva) {
              ejecutarAccion(
                {
                  id: staff.id,
                  nombre: staff.nombre,
                  numero_dorsal: staff.letra,
                },
                accionActiva
              );
            }
          }}
        />
      ))}
    </div>
  );
};
