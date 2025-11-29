type HeaderProps = {
  userName: string;
  onLogout: () => void;
  title?: string;
};

/**
 * Header compartido entre dashboards
 * Muestra el título de la aplicación, nombre de usuario y botón de logout
 */
export default function Header({
  userName,
  onLogout,
  title = "⚽ FútbolClub",
}: HeaderProps) {
  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex justify-between items-center">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{title}</h1>
        <div className="flex items-center gap-2 sm:gap-4">
          <span className="text-sm sm:text-base text-gray-600 hidden sm:inline">
            Hola, {userName}
          </span>
          <span className="text-sm text-gray-600 sm:hidden">{userName}</span>
          <button
            onClick={onLogout}
            className="bg-red-500 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded hover:bg-red-600 text-sm sm:text-base"
          >
            Salir
          </button>
        </div>
      </div>
    </nav>
  );
}
