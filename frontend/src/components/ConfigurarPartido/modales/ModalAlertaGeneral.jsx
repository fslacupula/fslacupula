import React from "react";

const ModalAlertaGeneral = ({ modalAlerta, setModalAlerta }) => {
  if (!modalAlerta.visible) return null;

  const getIconConfig = () => {
    switch (modalAlerta.tipo) {
      case "success":
        return {
          bg: "bg-green-100",
          icon: (
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          ),
          buttonClass: "bg-green-600",
        };
      case "error":
        return {
          bg: "bg-red-100",
          icon: (
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ),
          buttonClass: "bg-red-600",
        };
      case "warning":
        return {
          bg: "bg-yellow-100",
          icon: (
            <svg
              className="w-8 h-8 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          ),
          buttonClass: "bg-yellow-600",
        };
      default: // info
        return {
          bg: "bg-blue-100",
          icon: (
            <svg
              className="w-8 h-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ),
          buttonClass: "bg-blue-600",
        };
    }
  };

  const iconConfig = getIconConfig();

  const handleClose = () => {
    setModalAlerta({
      visible: false,
      titulo: "",
      mensaje: "",
      tipo: "info",
    });
  };

  const hasWarningActions =
    modalAlerta.tipo === "warning" &&
    (modalAlerta.onConfirm || modalAlerta.onCancel);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
        <div className="text-center mb-4">
          <div
            className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${iconConfig.bg}`}
          >
            {iconConfig.icon}
          </div>
          <h3 className="text-xl font-bold text-gray-800">
            {modalAlerta.titulo}
          </h3>
        </div>
        <p className="text-gray-600 text-center mb-6 whitespace-pre-line">
          {modalAlerta.mensaje}
        </p>
        {hasWarningActions ? (
          <div className="flex gap-3">
            <button
              onClick={() => {
                if (modalAlerta.onCancel) modalAlerta.onCancel();
                handleClose();
              }}
              className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                if (modalAlerta.onConfirm) modalAlerta.onConfirm();
                handleClose();
              }}
              className={`flex-1 px-4 py-3 ${iconConfig.buttonClass} text-white rounded-lg hover:opacity-90 transition-colors font-medium`}
            >
              Continuar
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              if (modalAlerta.onConfirm) modalAlerta.onConfirm();
              handleClose();
            }}
            className={`w-full px-4 py-3 rounded-lg hover:opacity-90 transition-colors font-medium text-white ${iconConfig.buttonClass}`}
          >
            Entendido
          </button>
        )}
      </div>
    </div>
  );
};

export default ModalAlertaGeneral;
