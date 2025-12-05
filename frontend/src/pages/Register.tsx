import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth, posiciones as posicionesApi } from "../services/api";
import { useAuthContext } from "@contexts";

interface Posicion {
  id: number;
  nombre: string;
  abreviatura: string;
}

interface RegisterFormData {
  nombre: string;
  email: string;
  password: string;
  rol: "jugador" | "gestor";
  dorsal: string;
  posicion: string;
}

export default function Register() {
  const [formData, setFormData] = useState<RegisterFormData>({
    nombre: "",
    email: "",
    password: "",
    rol: "jugador",
    dorsal: "",
    posicion: "",
  });
  const [posiciones, setPosiciones] = useState<Posicion[]>([]);
  const [error, setError] = useState<string>("");
  const { login } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    cargarPosiciones();
  }, []);

  const cargarPosiciones = async () => {
    try {
      const response = await posicionesApi.listar();
      setPosiciones(response.data.posiciones);
    } catch (err) {
      console.error("Error al cargar posiciones:", err);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    try {
      const dataToSend: any = {
        nombre: formData.nombre,
        email: formData.email,
        password: formData.password,
        rol: formData.rol,
      };

      if (formData.rol === "jugador") {
        dataToSend.datosJugador = {
          dorsal: parseInt(formData.dorsal),
          posicionId: parseInt(formData.posicion),
        };
      }

      await auth.register(dataToSend);
      // La respuesta de register no incluye token, hacer login después
      await login(formData.email, formData.password);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.error || "Error al registrarse");
    }
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          ⚽ Registro
        </h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre completo
            </label>
            <input
              type="text"
              name="nombre"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              value={formData.nombre}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              name="password"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rol
            </label>
            <select
              name="rol"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              value={formData.rol}
              onChange={handleChange}
            >
              <option value="jugador">Jugador</option>
              <option value="gestor">Gestor</option>
            </select>
          </div>

          {formData.rol === "jugador" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dorsal
                </label>
                <input
                  type="number"
                  name="dorsal"
                  required
                  min="1"
                  max="99"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={formData.dorsal}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Posición
                </label>
                <select
                  name="posicion"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={formData.posicion}
                  onChange={handleChange}
                >
                  <option value="">Selecciona una posición</option>
                  {posiciones.map((pos) => (
                    <option key={pos.id} value={pos.id}>
                      {pos.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <button
            type="submit"
            className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition duration-200 font-medium"
          >
            Registrarse
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          ¿Ya tienes cuenta?{" "}
          <Link
            to="/login"
            className="text-green-500 hover:text-green-600 font-medium"
          >
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
