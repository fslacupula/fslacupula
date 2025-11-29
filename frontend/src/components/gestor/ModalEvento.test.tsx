import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ModalEvento } from "./ModalEvento";

describe("ModalEvento", () => {
  const defaultFormData = {
    fecha: "2024-03-15",
    hora: "10:00",
    ubicacion: "Polideportivo",
    descripcion: "",
  };

  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onSubmit: vi.fn(),
    tipoEvento: "entrenamiento" as const,
    modoEdicion: false,
    formData: defaultFormData,
    onFormChange: vi.fn(),
  };

  it("no renderiza cuando isOpen es false", () => {
    render(<ModalEvento {...defaultProps} isOpen={false} />);
    expect(screen.queryByText(/Crear/i)).not.toBeInTheDocument();
  });

  it("renderiza modal para crear entrenamiento", () => {
    render(<ModalEvento {...defaultProps} />);

    expect(screen.getByText("Crear Entrenamiento")).toBeInTheDocument();
    expect(screen.getByLabelText(/Fecha/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Hora/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Ubicación/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Descripción/i)).toBeInTheDocument();
  });

  it("renderiza modal para crear partido", () => {
    render(<ModalEvento {...defaultProps} tipoEvento="partido" />);

    expect(screen.getByText("Crear Partido")).toBeInTheDocument();
    expect(screen.getByLabelText(/Rival/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Tipo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Partido en casa/i)).toBeInTheDocument();
  });

  it("muestra título de edición en modo edición", () => {
    render(<ModalEvento {...defaultProps} modoEdicion={true} />);

    expect(screen.getByText("Editar Entrenamiento")).toBeInTheDocument();
  });

  it("llama a onClose al hacer clic en Cancelar", () => {
    const onClose = vi.fn();
    render(<ModalEvento {...defaultProps} onClose={onClose} />);

    fireEvent.click(screen.getByText("Cancelar"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("llama a onSubmit al enviar el formulario", () => {
    const onSubmit = vi.fn((e) => e.preventDefault());
    render(<ModalEvento {...defaultProps} onSubmit={onSubmit} />);

    fireEvent.submit(screen.getByRole("form"));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("llama a onFormChange al cambiar campos", () => {
    const onFormChange = vi.fn();
    render(<ModalEvento {...defaultProps} onFormChange={onFormChange} />);

    const fechaInput = screen.getByLabelText(/Fecha/i);
    fireEvent.change(fechaInput, { target: { value: "2024-03-20" } });

    expect(onFormChange).toHaveBeenCalledWith("fecha", "2024-03-20");
  });

  it("muestra campos específicos de entrenamiento", () => {
    render(<ModalEvento {...defaultProps} tipoEvento="entrenamiento" />);

    expect(screen.getByLabelText(/Descripción/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/Rival/i)).not.toBeInTheDocument();
  });

  it("muestra campos específicos de partido", () => {
    const partidoFormData = {
      ...defaultFormData,
      rival: "Rival FC",
      tipo: "liga",
      es_local: true,
      resultado: "",
    };

    render(
      <ModalEvento
        {...defaultProps}
        tipoEvento="partido"
        formData={partidoFormData}
      />
    );

    expect(screen.getByLabelText(/Rival/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Tipo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Partido en casa/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Resultado/i)).toBeInTheDocument();
  });

  it("maneja cambios en checkbox de es_local", () => {
    const onFormChange = vi.fn();
    const partidoFormData = {
      ...defaultFormData,
      rival: "Rival FC",
      tipo: "liga",
      es_local: true,
    };

    render(
      <ModalEvento
        {...defaultProps}
        tipoEvento="partido"
        formData={partidoFormData}
        onFormChange={onFormChange}
      />
    );

    const checkbox = screen.getByLabelText(/Partido en casa/i);
    fireEvent.click(checkbox);

    expect(onFormChange).toHaveBeenCalledWith("es_local", false);
  });

  it("muestra valores del formulario correctamente", () => {
    render(<ModalEvento {...defaultProps} />);

    expect(screen.getByDisplayValue("2024-03-15")).toBeInTheDocument();
    expect(screen.getByDisplayValue("10:00")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Polideportivo")).toBeInTheDocument();
  });

  it("tiene botón Crear cuando no está en modo edición", () => {
    render(<ModalEvento {...defaultProps} modoEdicion={false} />);

    expect(screen.getByText("Crear")).toBeInTheDocument();
  });

  it("tiene botón Guardar cuando está en modo edición", () => {
    render(<ModalEvento {...defaultProps} modoEdicion={true} />);

    expect(screen.getByText("Guardar")).toBeInTheDocument();
  });
});
