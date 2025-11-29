interface ModalEventoProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  tipoEvento: "entrenamiento" | "partido";
  modoEdicion: boolean;
  formData: {
    fecha: string;
    hora: string;
    ubicacion: string;
    descripcion?: string;
    rival?: string;
    tipo?: string;
    es_local?: boolean;
    resultado?: string;
  };
  onFormChange: (field: string, value: any) => void;
}

/**
 * Modal para crear/editar eventos
 * Adaptativo según tipo de evento (entrenamiento o partido)
 */
export function ModalEvento({
  isOpen,
  onClose,
  onSubmit,
  tipoEvento,
  modoEdicion,
  formData,
  onFormChange,
}: ModalEventoProps) {
  if (!isOpen) return null;

  const esPartido = tipoEvento === "partido";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-4 sm:px-6 py-3 sm:py-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">
            {modoEdicion ? "Editar" : "Crear"}{" "}
            {esPartido ? "Partido" : "Entrenamiento"}
          </h2>
        </div>

        <form onSubmit={onSubmit} className="p-4 sm:p-6">
          {/* Fecha */}
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha *
            </label>
            <input
              type="date"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={formData.fecha}
              onChange={(e) => onFormChange("fecha", e.target.value)}
            />
          </div>

          {/* Hora */}
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hora *
            </label>
            <input
              type="time"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={formData.hora}
              onChange={(e) => onFormChange("hora", e.target.value)}
            />
          </div>

          {/* Ubicación */}
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ubicación *
            </label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={formData.ubicacion}
              onChange={(e) => onFormChange("ubicacion", e.target.value)}
              placeholder="Ej: Polideportivo Can Tries"
            />
          </div>

          {/* Campos específicos de ENTRENAMIENTO */}
          {!esPartido && (
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={3}
                value={formData.descripcion || ""}
                onChange={(e) => onFormChange("descripcion", e.target.value)}
                placeholder="Ej: Entrenamiento de táctica"
              />
            </div>
          )}

          {/* Campos específicos de PARTIDO */}
          {esPartido && (
            <>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rival *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={formData.rival || ""}
                  onChange={(e) => onFormChange("rival", e.target.value)}
                  placeholder="Ej: Polinyá B"
                />
              </div>

              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo *
                </label>
                <select
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={formData.tipo || "amistoso"}
                  onChange={(e) => onFormChange("tipo", e.target.value)}
                >
                  <option value="amistoso">Amistoso</option>
                  <option value="liga">Liga</option>
                  <option value="copa">Copa</option>
                  <option value="torneo">Torneo</option>
                </select>
              </div>

              <div className="mb-3 flex items-center">
                <input
                  type="checkbox"
                  id="esLocal"
                  className="mr-2 w-4 h-4"
                  checked={formData.es_local !== false}
                  onChange={(e) => onFormChange("es_local", e.target.checked)}
                />
                <label
                  htmlFor="esLocal"
                  className="text-sm font-medium text-gray-700"
                >
                  Partido en casa
                </label>
              </div>

              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Resultado (opcional)
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={formData.resultado || ""}
                  onChange={(e) => onFormChange("resultado", e.target.value)}
                  placeholder="Ej: 3-1"
                />
              </div>
            </>
          )}

          {/* Botones */}
          <div className="flex gap-2 justify-end mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              {modoEdicion ? "Guardar" : "Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
