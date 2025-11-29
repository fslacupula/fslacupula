import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
// @ts-ignore - Login es un archivo .jsx sin tipos
import Login from "./Login";
import { AuthProvider } from "@contexts";
import { auth } from "../services/api";

// Mock de la API
vi.mock("../services/api", () => ({
  auth: {
    login: vi.fn(),
  },
}));

// Mock de react-router-dom
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("Login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  const renderLogin = () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    );
  };

  it("renderiza el formulario de login", () => {
    renderLogin();

    expect(screen.getByText("⚽ FútbolClub")).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Contraseña/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Iniciar Sesión/i })
    ).toBeInTheDocument();
  });

  it("muestra enlace de registro", () => {
    renderLogin();

    expect(screen.getByText(/¿No tienes cuenta\?/i)).toBeInTheDocument();
    expect(screen.getByText(/Regístrate/i)).toBeInTheDocument();
  });

  it("permite ingresar email y contraseña", () => {
    renderLogin();

    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Contraseña/i);

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    expect(emailInput).toHaveValue("test@example.com");
    expect(passwordInput).toHaveValue("password123");
  });

  it("envía el formulario con las credenciales correctas", async () => {
    const mockResponse: any = {
      data: {
        token: "fake-token",
        usuario: {
          id: 1,
          nombre: "Test User",
          rol: "gestor",
          email: "test@example.com",
          activo: true,
        },
      },
      status: 200,
      statusText: "OK",
      headers: {},
      config: {} as any,
    };

    vi.mocked(auth.login).mockResolvedValue(mockResponse);

    renderLogin();

    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Contraseña/i);
    const submitButton = screen.getByRole("button", {
      name: /Iniciar Sesión/i,
    });

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(auth.login).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
    });
  });

  it("guarda el token en localStorage al iniciar sesión exitosamente", async () => {
    const mockResponse: any = {
      data: {
        token: "fake-token",
        usuario: {
          id: 1,
          nombre: "Test User",
          rol: "gestor",
          email: "test@example.com",
          activo: true,
        },
      },
      status: 200,
      statusText: "OK",
      headers: {},
      config: {} as any,
    };

    vi.mocked(auth.login).mockResolvedValue(mockResponse);

    renderLogin();

    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Contraseña/i);
    const submitButton = screen.getByRole("button", {
      name: /Iniciar Sesión/i,
    });

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(localStorage.getItem("token")).toBe("fake-token");
    });
  });

  it("navega al dashboard después de login exitoso", async () => {
    const mockResponse: any = {
      data: {
        token: "fake-token",
        usuario: {
          id: 1,
          nombre: "Test User",
          rol: "gestor",
          email: "test@example.com",
          activo: true,
        },
      },
      status: 200,
      statusText: "OK",
      headers: {},
      config: {} as any,
    };

    vi.mocked(auth.login).mockResolvedValue(mockResponse);

    renderLogin();

    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Contraseña/i);
    const submitButton = screen.getByRole("button", {
      name: /Iniciar Sesión/i,
    });

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("muestra error cuando las credenciales son incorrectas", async () => {
    const mockError = {
      response: {
        data: {
          error: "Credenciales inválidas",
        },
      },
    };

    vi.mocked(auth.login).mockRejectedValue(mockError);

    renderLogin();

    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Contraseña/i);
    const submitButton = screen.getByRole("button", {
      name: /Iniciar Sesión/i,
    });

    fireEvent.change(emailInput, { target: { value: "wrong@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "wrongpassword" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Credenciales inválidas")).toBeInTheDocument();
    });
  });

  it("muestra error genérico cuando no hay mensaje de error específico", async () => {
    vi.mocked(auth.login).mockRejectedValue(new Error("Network error"));

    renderLogin();

    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Contraseña/i);
    const submitButton = screen.getByRole("button", {
      name: /Iniciar Sesión/i,
    });

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Error al iniciar sesión")).toBeInTheDocument();
    });
  });

  it("limpia el error al enviar el formulario nuevamente", async () => {
    const mockError = {
      response: {
        data: {
          error: "Credenciales inválidas",
        },
      },
    };

    vi.mocked(auth.login).mockRejectedValueOnce(mockError);

    renderLogin();

    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Contraseña/i);
    const submitButton = screen.getByRole("button", {
      name: /Iniciar Sesión/i,
    });

    // Primer intento fallido
    fireEvent.change(emailInput, { target: { value: "wrong@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "wrongpassword" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Credenciales inválidas")).toBeInTheDocument();
    });

    // Segundo intento - el error debería limpiarse
    vi.mocked(auth.login).mockResolvedValue({
      data: {
        token: "fake-token",
        usuario: {
          id: 1,
          nombre: "Test User",
          rol: "gestor",
          email: "test@example.com",
          activo: true,
        },
      },
      status: 200,
      statusText: "OK",
      headers: {},
      config: {} as any,
    } as any);

    fireEvent.change(emailInput, { target: { value: "correct@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "correctpassword" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.queryByText("Credenciales inválidas")
      ).not.toBeInTheDocument();
    });
  });

  it("requiere email y contraseña para enviar", () => {
    renderLogin();

    const emailInput = screen.getByLabelText(/Email/i) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(
      /Contraseña/i
    ) as HTMLInputElement;

    expect(emailInput.required).toBe(true);
    expect(passwordInput.required).toBe(true);
  });
});
