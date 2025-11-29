interface Posicion {
  id: number;
  nombre: string;
  abreviatura: string;
}

interface ModalJugadorProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formData: {
    nombre: string;
    email: string;
    password: string;
    alias: string;
    dorsal: string;
    posicion: string;
  };
  onFormChange: (field: string, value: string) => void;
  posiciones: Posicion[];
}

/**
 * Modal para crear nuevo jugador
 */
export function ModalJugador({
  isOpen,
  onClose,
  onSubmit,
  formData,
  onFormChange,
  posiciones,
}: ModalJugadorProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-4 sm:px-6 py-3 sm:py-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">
            Añadir Jugador
          </h2>
        </div>

        <form onSubmit={onSubmit} className="p-4 sm:p-6">
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre Completo *
            </label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={formData.nombre}
              onChange={(e) => onFormChange("nombre", e.target.value)}
              placeholder="Ej: Juan Pérez"
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
              value={formData.email}
              onChange={(e) => onFormChange("email", e.target.value)}
              placeholder="jugador@email.com"
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
              value={formData.password}
              onChange={(e) => onFormChange("password", e.target.value)}
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alias
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={formData.alias}
              onChange={(e) => onFormChange("alias", e.target.value)}
              placeholder="Apodo o nombre corto"
            />
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Número de Dorsal
            </label>
            <input
              type="number"
              min="1"
              max="99"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={formData.dorsal}
              onChange={(e) => onFormChange("dorsal", e.target.value)}
              placeholder="1-99"
            />
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Posición
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={formData.posicion}
              onChange={(e) => onFormChange("posicion", e.target.value)}
            >
              <option value="">Seleccionar posición</option>
              {posiciones.map((pos) => (
                <option key={pos.id} value={pos.id}>
                  {pos.nombre} ({pos.abreviatura})
                </option>
              ))}
            </select>
          </div>

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
              Crear Jugador
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
