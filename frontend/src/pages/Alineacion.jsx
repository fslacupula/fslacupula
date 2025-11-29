import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PistaFutsal from "../components/PistaFutsal";
import { useAuthContext } from "@contexts";

/**
 * Vista de Alineación - Muestra la pista de fútbol sala con jugadores confirmados
 */
export default function Alineacion() {
  const { logout } = useAuthContext();
  const navigate = useNavigate();
  const [jugadoresConfirmados, setJugadoresConfirmados] = useState([]);

  useEffect(() => {
    // Ejemplo de datos - En producción vendrían de una API
    // Puedes integrar esto con los datos reales de asistencias confirmadas
    const ejemploJugadores = [
      {
        id: 1,
        nombre: "Juan García",
        alias: "JG",
        dorsal: 1,
        posicion: "Portero",
        color: "blue",
      },
      {
        id: 2,
        nombre: "Pedro López",
        alias: "PL",
        dorsal: 5,
        posicion: "Cierre",
        color: "blue",
      },
      {
        id: 3,
        nombre: "Carlos Ruiz",
        alias: "CR",
        dorsal: 7,
        posicion: "Ala",
        color: "blue",
      },
      {
        id: 4,
        nombre: "Miguel Sanz",
        alias: "MS",
        dorsal: 10,
        posicion: "Ala",
        color: "blue",
      },
      {
        id: 5,
        nombre: "David Martín",
        alias: "DM",
        dorsal: 9,
        posicion: "Pivot",
        color: "blue",
      },
    ];
    setJugadoresConfirmados(ejemploJugadores);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleVolver = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">
            ⚽ Alineación - Pista
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Hola, {usuario?.nombre}</span>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Salir
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={handleVolver}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 flex items-center gap-2"
          >
            ← Volver
          </button>
          <h2 className="text-xl font-bold text-gray-800">
            Vista Táctica - 5 Jugadores
          </h2>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <PistaFutsal jugadores={jugadoresConfirmados} />
        </div>

        {/* Lista de jugadores confirmados */}
        <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            Jugadores Confirmados ({jugadoresConfirmados.length})
          </h3>
          <div className="space-y-2">
            {jugadoresConfirmados.map((jugador) => (
              <div
                key={jugador.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full ${
                      jugador.color === "blue"
                        ? "bg-blue-500"
                        : jugador.color === "red"
                        ? "bg-red-500"
                        : "bg-orange-600"
                    } flex items-center justify-center text-white text-xs font-bold`}
                  >
                    {jugador.alias}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">
                      {jugador.nombre}
                    </p>
                    <p className="text-sm text-gray-500">{jugador.posicion}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-gray-700">
                    #{jugador.dorsal}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
