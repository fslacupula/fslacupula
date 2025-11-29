export type MotivoAusenciaDTO = {
  id: number;
  motivo: string;
};

export type AsistenciaFormData = {
  estado: string;
  motivo_ausencia_id: string | null;
  comentarios: string;
};

type ModalAsistenciaProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formData: AsistenciaFormData;
  onFormChange: (data: Partial<AsistenciaFormData>) => void;
  motivosAusencia: MotivoAusenciaDTO[];
};

export default function ModalAsistencia({
  isOpen,
  onClose,
  onSubmit,
  formData,
  onFormChange,
  motivosAusencia,
}: ModalAsistenciaProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50">
      <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">
          Confirmar Asistencia
        </h3>
        <form onSubmit={onSubmit}>
          <div className="mb-4 sm:mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2 sm:mb-3">
              Estado de Asistencia
            </label>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() =>
                  onFormChange({
                    estado: "confirmado",
                    motivo_ausencia_id: null,
                  })
                }
                className={`px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border-2 transition-all font-medium flex items-center justify-center gap-1.5 sm:gap-2 text-sm sm:text-base ${
                  formData.estado === "confirmado"
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
                  onFormChange({
                    estado: "no_asiste",
                  })
                }
                className={`px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border-2 transition-all font-medium flex items-center justify-center gap-1.5 sm:gap-2 text-sm sm:text-base ${
                  formData.estado === "no_asiste"
                    ? "bg-red-500 text-white border-red-600 shadow-lg scale-105"
                    : "bg-white text-gray-700 border-gray-300 hover:border-red-400 hover:bg-red-50"
                }`}
              >
                <span className="text-xl">✗</span>
                <span>No puedo</span>
              </button>
            </div>
          </div>

          {formData.estado === "no_asiste" && (
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
                        onFormChange({
                          motivo_ausencia_id: m.id.toString(),
                        });
                      }}
                      className={`px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border-2 transition-all text-left font-medium text-sm sm:text-base ${
                        formData.motivo_ausencia_id === m.id.toString()
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
              rows={2}
              placeholder="Añade cualquier comentario adicional..."
              value={formData.comentarios}
              onChange={(e) =>
                onFormChange({
                  comentarios: e.target.value,
                })
              }
            />
          </div>

          <div className="flex gap-2 sm:gap-3 mt-4">
            <button
              type="submit"
              disabled={
                formData.estado === "no_asiste" && !formData.motivo_ausencia_id
              }
              className="flex-1 bg-green-500 text-white py-2.5 sm:py-2 px-4 rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium text-sm sm:text-base"
            >
              Guardar
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-2.5 sm:py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors font-medium text-sm sm:text-base"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
