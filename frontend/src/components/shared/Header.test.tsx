import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Header } from "./Header";
import userEvent from "@testing-library/user-event";

describe("Header", () => {
  it("debe renderizar el título correctamente", () => {
    render(
      <Header title="Dashboard" userName="Juan Pérez" onLogout={() => {}} />
    );

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });

  it("debe mostrar el nombre del usuario", () => {
    render(
      <Header title="Dashboard" userName="María García" onLogout={() => {}} />
    );

    expect(screen.getByText("Hola, María García")).toBeInTheDocument();
  });

  it("debe llamar onLogout al hacer clic en cerrar sesión", async () => {
    const user = userEvent.setup();
    const handleLogout = vi.fn();

    render(
      <Header title="Dashboard" userName="Juan Pérez" onLogout={handleLogout} />
    );

    const logoutButton = screen.getByRole("button", { name: /cerrar sesión/i });
    await user.click(logoutButton);

    expect(handleLogout).toHaveBeenCalledTimes(1);
  });

  it("debe mostrar el botón de cerrar sesión", () => {
    render(
      <Header title="Dashboard" userName="Juan Pérez" onLogout={() => {}} />
    );

    expect(
      screen.getByRole("button", { name: /cerrar sesión/i })
    ).toBeInTheDocument();
  });
});
