import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ViewModeSelector } from "./ViewModeSelector";
import userEvent from "@testing-library/user-event";

describe("ViewModeSelector", () => {
  it("debe renderizar ambos botones", () => {
    render(<ViewModeSelector vista="lista" onVistaChange={() => {}} />);

    expect(screen.getByText("Lista")).toBeInTheDocument();
    expect(screen.getByText("Calendario")).toBeInTheDocument();
  });

  it("debe resaltar el botón activo", () => {
    const { rerender } = render(
      <ViewModeSelector vista="lista" onVistaChange={() => {}} />
    );

    const listaButton = screen.getByText("Lista");
    expect(listaButton.className).toContain("bg-blue-500");

    rerender(<ViewModeSelector vista="calendario" onVistaChange={() => {}} />);

    const calendarioButton = screen.getByText("Calendario");
    expect(calendarioButton.className).toContain("bg-blue-500");
  });

  it("debe llamar onVistaChange con 'lista' al hacer clic", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <ViewModeSelector vista="calendario" onVistaChange={handleChange} />
    );

    const listaButton = screen.getByText("Lista");
    await user.click(listaButton);

    expect(handleChange).toHaveBeenCalledWith("lista");
  });

  it("debe llamar onVistaChange con 'calendario' al hacer clic", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(<ViewModeSelector vista="lista" onVistaChange={handleChange} />);

    const calendarioButton = screen.getByText("Calendario");
    await user.click(calendarioButton);

    expect(handleChange).toHaveBeenCalledWith("calendario");
  });
});
