export type TabJugador = "todos" | "entrenamientos" | "partidos";

type TabsJugadorProps = {
  activeTab: TabJugador;
  onTabChange: (tab: TabJugador) => void;
};

export default function TabsJugador({
  activeTab,
  onTabChange,
}: TabsJugadorProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
      <button
        onClick={() => onTabChange("todos")}
        className={`px-4 sm:px-6 py-2 rounded-lg font-medium whitespace-nowrap text-sm sm:text-base flex-shrink-0 ${
          activeTab === "todos"
            ? "bg-blue-500 text-white"
            : "bg-white text-gray-700 hover:bg-gray-100"
        }`}
      >
        📊 Todos
      </button>
      <button
        onClick={() => onTabChange("entrenamientos")}
        className={`px-4 sm:px-6 py-2 rounded-lg font-medium whitespace-nowrap text-sm sm:text-base flex-shrink-0 ${
          activeTab === "entrenamientos"
            ? "bg-blue-500 text-white"
            : "bg-white text-gray-700 hover:bg-gray-100"
        }`}
      >
        📋 Entrenamientos
      </button>
      <button
        onClick={() => onTabChange("partidos")}
        className={`px-4 sm:px-6 py-2 rounded-lg font-medium whitespace-nowrap text-sm sm:text-base flex-shrink-0 ${
          activeTab === "partidos"
            ? "bg-blue-500 text-white"
            : "bg-white text-gray-700 hover:bg-gray-100"
        }`}
      >
        ⚽ Partidos
      </button>
    </div>
  );
}
