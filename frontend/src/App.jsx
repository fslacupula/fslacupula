import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import DashboardJugador from "./pages/DashboardJugador";
import DashboardGestor from "./pages/DashboardGestor";
import DetalleAsistencia from "./pages/DetalleAsistencia";
import Alineacion from "./pages/Alineacion";
import ConfigurarPartido from "./pages/ConfigurarPartido";
import ActaPartido from "./pages/ActaPartido";
import { AuthProvider, useAuthContext } from "@contexts";

function AppRoutes() {
  const { usuario, isLoading } = useAuthContext();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Cargando...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={!usuario ? <Login /> : <Navigate to="/dashboard" />}
      />
      <Route
        path="/register"
        element={!usuario ? <Register /> : <Navigate to="/dashboard" />}
      />
      <Route
        path="/dashboard"
        element={
          usuario ? (
            usuario.rol === "gestor" ? (
              <DashboardGestor />
            ) : (
              <DashboardJugador />
            )
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/asistencia/:tipo/:id"
        element={usuario ? <DetalleAsistencia /> : <Navigate to="/login" />}
      />
      <Route
        path="/alineacion"
        element={usuario ? <Alineacion /> : <Navigate to="/login" />}
      />
      <Route
        path="/configurar-partido/:partidoId?"
        element={
          usuario && usuario.rol === "gestor" ? (
            <ConfigurarPartido />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/acta-partido/:id"
        element={usuario ? <ActaPartido /> : <Navigate to="/login" />}
      />
      <Route
        path="/"
        element={<Navigate to={usuario ? "/dashboard" : "/login"} />}
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
