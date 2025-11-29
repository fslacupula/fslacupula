type VistaMode = "lista" | "calendario";

interface ViewModeSelectorProps {
  mode: VistaMode;
  onModeChange: (mode: VistaMode) => void;
}

/**
 * Selector de modo de vista (Lista vs Calendario)
 */
export function ViewModeSelector({
  mode,
  onModeChange,
}: ViewModeSelectorProps) {
  return (
    <div className="flex gap-2">
      <button
        onClick={() => onModeChange("lista")}
        className={`px-3 sm:px-4 py-2 rounded-md font-medium text-sm sm:text-base transition-colors ${
          mode === "lista"
            ? "bg-indigo-600 text-white"
            : "bg-white text-gray-700 hover:bg-gray-50"
        }`}
      >
        📋 Lista
      </button>
      <button
        onClick={() => onModeChange("calendario")}
        className={`px-3 sm:px-4 py-2 rounded-md font-medium text-sm sm:text-base transition-colors ${
          mode === "calendario"
            ? "bg-indigo-600 text-white"
            : "bg-white text-gray-700 hover:bg-gray-50"
        }`}
      >
        📅 Calendario
      </button>
    </div>
  );
}

export type { VistaMode };
