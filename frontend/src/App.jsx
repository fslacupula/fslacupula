import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useState, useEffect } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import DashboardJugador from "./pages/DashboardJugador";
import DashboardGestor from "./pages/DashboardGestor";
import DetalleAsistencia from "./pages/DetalleAsistencia";
import Alineacion from "./pages/Alineacion";
import ConfigurarPartido from "./pages/ConfigurarPartido";
import { auth } from "./services/api";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      auth
        .profile()
        .then((response) => {
          setUser(response.data.usuario);
        })
        .catch(() => {
          localStorage.removeItem("token");
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Cargando...</div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            !user ? <Login setUser={setUser} /> : <Navigate to="/dashboard" />
          }
        />
        <Route
          path="/register"
          element={
            !user ? (
              <Register setUser={setUser} />
            ) : (
              <Navigate to="/dashboard" />
            )
          }
        />
        <Route
          path="/dashboard"
          element={
            user ? (
              user.rol === "gestor" ? (
                <DashboardGestor user={user} setUser={setUser} />
              ) : (
                <DashboardJugador user={user} setUser={setUser} />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/asistencia/:tipo/:id"
          element={
            user ? (
              <DetalleAsistencia user={user} setUser={setUser} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/alineacion"
          element={
            user ? (
              <Alineacion user={user} setUser={setUser} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/configurar-partido/:partidoId?"
          element={
            user && user.rol === "gestor" ? (
              <ConfigurarPartido user={user} setUser={setUser} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/"
          element={<Navigate to={user ? "/dashboard" : "/login"} />}
        />
      </Routes>
    </Router>
  );
}

export default App;
