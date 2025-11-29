export type VistaMode = "lista" | "calendario";

type ViewModeSelectorProps = {
  vistaMode: VistaMode;
  onViewModeChange: (mode: VistaMode) => void;
};

/**
 * Selector de vista compartido entre dashboards
 * Permite cambiar entre vista de lista y calendario
 */
export default function ViewModeSelector({
  vistaMode,
  onViewModeChange,
}: ViewModeSelectorProps) {
  return (
    <div className="flex gap-2">
      <button
        onClick={() => onViewModeChange("lista")}
        className={`flex-1 sm:flex-none px-4 py-2 rounded-lg font-medium text-sm sm:text-base ${
          vistaMode === "lista"
            ? "bg-gray-700 text-white"
            : "bg-white text-gray-700 hover:bg-gray-100"
        }`}
      >
        📋 Lista
      </button>
      <button
        onClick={() => onViewModeChange("calendario")}
        className={`flex-1 sm:flex-none px-4 py-2 rounded-lg font-medium text-sm sm:text-base ${
          vistaMode === "calendario"
            ? "bg-gray-700 text-white"
            : "bg-white text-gray-700 hover:bg-gray-100"
        }`}
      >
        📅 Calendario
      </button>
    </div>
  );
}
