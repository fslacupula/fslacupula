import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ModalAsistencia from "./ModalAsistencia";
import type { AsistenciaFormData, MotivoAusenciaDTO } from "./ModalAsistencia";

describe("ModalAsistencia", () => {
  const mockMotivosAusencia: MotivoAusenciaDTO[] = [
    { id: 1, motivo: "Lesión" },
    { id: 2, motivo: "Trabajo" },
    { id: 3, motivo: "Personal" },
  ];

  const defaultFormData: AsistenciaFormData = {
    estado: "pendiente",
    motivo_ausencia_id: null,
    comentarios: "",
  };

  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onSubmit: vi.fn((e) => e.preventDefault()),
    formData: defaultFormData,
    onFormChange: vi.fn(),
    motivosAusencia: mockMotivosAusencia,
  };

  it("no renderiza cuando isOpen es false", () => {
    render(<ModalAsistencia {...defaultProps} isOpen={false} />);
    expect(screen.queryByText("Confirmar Asistencia")).not.toBeInTheDocument();
  });

  it("renderiza el modal correctamente", () => {
    render(<ModalAsistencia {...defaultProps} />);

    expect(screen.getByText("Confirmar Asistencia")).toBeInTheDocument();
    expect(screen.getByText("Confirmo")).toBeInTheDocument();
    expect(screen.getByText("No puedo")).toBeInTheDocument();
  });

  it("muestra botones de estado de asistencia", () => {
    render(<ModalAsistencia {...defaultProps} />);

    expect(screen.getByText("Confirmo")).toBeInTheDocument();
    expect(screen.getByText("No puedo")).toBeInTheDocument();
  });

  it("llama a onFormChange al confirmar asistencia", () => {
    const onFormChange = vi.fn();
    render(<ModalAsistencia {...defaultProps} onFormChange={onFormChange} />);

    fireEvent.click(screen.getByText("Confirmo"));

    expect(onFormChange).toHaveBeenCalledWith({
      estado: "confirmado",
      motivo_ausencia_id: null,
    });
  });

  it("llama a onFormChange al indicar no asistencia", () => {
    const onFormChange = vi.fn();
    render(<ModalAsistencia {...defaultProps} onFormChange={onFormChange} />);

    fireEvent.click(screen.getByText("No puedo"));

    expect(onFormChange).toHaveBeenCalledWith({
      estado: "no_asiste",
    });
  });

  it("muestra motivos de ausencia cuando estado es no_asiste", () => {
    const formDataNoAsiste: AsistenciaFormData = {
      estado: "no_asiste",
      motivo_ausencia_id: null,
      comentarios: "",
    };

    render(<ModalAsistencia {...defaultProps} formData={formDataNoAsiste} />);

    expect(screen.getByText("Lesión")).toBeInTheDocument();
    expect(screen.getByText("Trabajo")).toBeInTheDocument();
    expect(screen.getByText("Personal")).toBeInTheDocument();
  });

  it("no muestra motivos de ausencia cuando estado es confirmado", () => {
    const formDataConfirmado: AsistenciaFormData = {
      estado: "confirmado",
      motivo_ausencia_id: null,
      comentarios: "",
    };

    render(<ModalAsistencia {...defaultProps} formData={formDataConfirmado} />);

    expect(screen.queryByText("Lesión")).not.toBeInTheDocument();
  });

  it("llama a onFormChange al seleccionar un motivo de ausencia", () => {
    const onFormChange = vi.fn();
    const formDataNoAsiste: AsistenciaFormData = {
      estado: "no_asiste",
      motivo_ausencia_id: null,
      comentarios: "",
    };

    render(
      <ModalAsistencia
        {...defaultProps}
        formData={formDataNoAsiste}
        onFormChange={onFormChange}
      />
    );

    fireEvent.click(screen.getByText("Lesión"));

    expect(onFormChange).toHaveBeenCalledWith({
      motivo_ausencia_id: "1",
    });
  });

  it("permite escribir comentarios", () => {
    const onFormChange = vi.fn();
    render(<ModalAsistencia {...defaultProps} onFormChange={onFormChange} />);

    const textarea = screen.getByPlaceholderText(
      /Añade cualquier comentario adicional/i
    );
    fireEvent.change(textarea, { target: { value: "Comentario de prueba" } });

    expect(onFormChange).toHaveBeenCalledWith({
      comentarios: "Comentario de prueba",
    });
  });

  it("llama a onClose al hacer clic en Cancelar", () => {
    const onClose = vi.fn();
    render(<ModalAsistencia {...defaultProps} onClose={onClose} />);

    fireEvent.click(screen.getByText("Cancelar"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("llama a onSubmit al enviar el formulario", () => {
    const onSubmit = vi.fn((e) => e.preventDefault());
    const formDataConfirmado: AsistenciaFormData = {
      estado: "confirmado",
      motivo_ausencia_id: null,
      comentarios: "",
    };

    render(
      <ModalAsistencia
        {...defaultProps}
        formData={formDataConfirmado}
        onSubmit={onSubmit}
      />
    );

    fireEvent.click(screen.getByText("Guardar"));
    expect(onSubmit).toHaveBeenCalled();
  });

  it("deshabilita el botón Guardar cuando no_asiste y no hay motivo", () => {
    const formDataNoAsiste: AsistenciaFormData = {
      estado: "no_asiste",
      motivo_ausencia_id: null,
      comentarios: "",
    };

    render(<ModalAsistencia {...defaultProps} formData={formDataNoAsiste} />);

    const guardarButton = screen.getByText("Guardar");
    expect(guardarButton).toBeDisabled();
  });

  it("habilita el botón Guardar cuando no_asiste y hay motivo", () => {
    const formDataNoAsiste: AsistenciaFormData = {
      estado: "no_asiste",
      motivo_ausencia_id: "1",
      comentarios: "",
    };

    render(<ModalAsistencia {...defaultProps} formData={formDataNoAsiste} />);

    const guardarButton = screen.getByText("Guardar");
    expect(guardarButton).not.toBeDisabled();
  });

  it("muestra mensaje cuando no hay motivos disponibles", () => {
    const formDataNoAsiste: AsistenciaFormData = {
      estado: "no_asiste",
      motivo_ausencia_id: null,
      comentarios: "",
    };

    render(
      <ModalAsistencia
        {...defaultProps}
        formData={formDataNoAsiste}
        motivosAusencia={[]}
      />
    );

    expect(screen.getByText("No hay motivos disponibles")).toBeInTheDocument();
  });

  it("aplica estilos correctos al botón confirmado seleccionado", () => {
    const formDataConfirmado: AsistenciaFormData = {
      estado: "confirmado",
      motivo_ausencia_id: null,
      comentarios: "",
    };

    render(<ModalAsistencia {...defaultProps} formData={formDataConfirmado} />);

    const confirmoButton = screen.getByText("Confirmo");
    expect(confirmoButton).toHaveClass("bg-green-500");
  });

  it("aplica estilos correctos al botón no_asiste seleccionado", () => {
    const formDataNoAsiste: AsistenciaFormData = {
      estado: "no_asiste",
      motivo_ausencia_id: null,
      comentarios: "",
    };

    render(<ModalAsistencia {...defaultProps} formData={formDataNoAsiste} />);

    const noPuedoButton = screen.getByText("No puedo");
    expect(noPuedoButton).toHaveClass("bg-red-500");
  });
});
