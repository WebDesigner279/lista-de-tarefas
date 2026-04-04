/* @vitest-environment jsdom */

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TaskInput } from "@/components/tasks/task-input";

afterEach(() => {
  cleanup();
});

describe("TaskInput", () => {
  it("dispara a criacao da tarefa e limpa o campo quando a submissao da certo", async () => {
    const onCreateTask = vi.fn().mockResolvedValue(true);

    render(<TaskInput onCreateTask={onCreateTask} />);

    const input = screen.getByPlaceholderText("Adicionar tarefa ou varias...");
    const submitButton = screen.getByRole("button", { name: "Cadastrar" });

    fireEvent.change(input, { target: { value: "Comprar leite" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(onCreateTask).toHaveBeenCalledWith("Comprar leite");
    });

    expect((input as HTMLInputElement).value).toBe("");
  });

  it("mantem o valor digitado quando a submissao falha", async () => {
    const onCreateTask = vi.fn().mockResolvedValue(false);

    render(<TaskInput onCreateTask={onCreateTask} />);

    const input = screen.getByPlaceholderText("Adicionar tarefa ou varias...");
    const submitButton = screen.getByRole("button", { name: "Cadastrar" });

    fireEvent.change(input, { target: { value: "Estudar" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(onCreateTask).toHaveBeenCalledWith("Estudar");
    });

    expect((input as HTMLInputElement).value).toBe("Estudar");
  });

  it("mantem o botao desabilitado quando nao ha texto valido", () => {
    render(<TaskInput onCreateTask={vi.fn()} />);

    const submitButton = screen.getByRole("button", { name: "Cadastrar" });
    expect((submitButton as HTMLButtonElement).disabled).toBe(true);
  });
});
