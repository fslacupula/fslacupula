interface HeaderGestorProps {
  userName: string;
  onLogout: () => void;
}

/**
 * Header del Dashboard del Gestor
 * Muestra el nombre del usuario y botón de logout
 */
export function HeaderGestor({ userName, onLogout }: HeaderGestorProps) {
  return (
    <header className="bg-indigo-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex justify-between items-center">
        <h1 className="text-xl sm:text-2xl font-bold text-white">
          Panel de Gestor
        </h1>
        <div className="flex items-center gap-2 sm:gap-4">
          <span className="text-white text-sm sm:text-base">
            Hola, <span className="font-semibold">{userName}</span>
          </span>
          <button
            onClick={onLogout}
            className="bg-white text-indigo-600 px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-sm sm:text-base font-medium hover:bg-indigo-50 transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </header>
  );
}
