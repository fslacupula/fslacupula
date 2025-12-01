import React from "react";

const DialogoGenerico = ({
  visible,
  titulo,
  mensaje,
  icono,
  iconoBg,
  contenidoExtra,
  botones,
  colorTitulo = "text-gray-800",
}) => {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
        <div className="text-center mb-4">
          {icono && (
            <div
              className={`inline-flex items-center justify-center w-16 h-16 ${iconoBg} rounded-full mb-4`}
            >
              {icono}
            </div>
          )}
          <h3 className={`text-xl font-bold ${colorTitulo}`}>{titulo}</h3>
        </div>

        {mensaje && <p className="text-gray-700 text-center mb-6">{mensaje}</p>}

        {contenidoExtra}

        {botones && <div className="flex gap-3">{botones}</div>}
      </div>
    </div>
  );
};

export default DialogoGenerico;
