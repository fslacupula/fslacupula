type Tab = "todos" | "entrenamientos" | "partidos" | "jugadores";

interface TabsGestorProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const tabs: { id: Tab; label: string }[] = [
  { id: "todos", label: "Todos los Eventos" },
  { id: "entrenamientos", label: "Entrenamientos" },
  { id: "partidos", label: "Partidos" },
  { id: "jugadores", label: "Jugadores" },
];

/**
 * Sistema de pestañas para navegar entre secciones
 */
export function TabsGestor({ activeTab, onTabChange }: TabsGestorProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-3 sm:px-4 py-2 rounded-md font-medium whitespace-nowrap text-sm sm:text-base transition-colors ${
            activeTab === tab.id
              ? "bg-indigo-600 text-white"
              : "bg-white text-gray-700 hover:bg-gray-50"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export type { Tab };
