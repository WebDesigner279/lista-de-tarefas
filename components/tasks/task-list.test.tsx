/* @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TaskList } from "@/components/tasks/task-list";
import { TaskRecord } from "@/features/tasks/types";

afterEach(() => {
  cleanup();
});

const buildTask = (overrides: Partial<TaskRecord>): TaskRecord => ({
  id: "task-1",
  task: "Primeira tarefa",
  done: false,
  userId: "user-1",
  ...overrides,
});

describe("TaskList", () => {
  it("prioriza tarefas concluidas na visao geral", () => {
    const { container } = render(
      <TaskList
        tasks={[
          buildTask({ id: "open-1", task: "Tarefa não concluída", done: false }),
          buildTask({ id: "done-1", task: "Tarefa concluída", done: true }),
        ]}
        onToggleTaskStatus={vi.fn()}
        onSaveTask={vi.fn()}
        onDeleteTask={vi.fn()}
      />,
    );

    const renderedRows = Array.from(container.querySelectorAll("[data-task-row]"));

    expect(renderedRows).toHaveLength(2);
    expect(renderedRows[0]?.getAttribute("data-task-state")).toBe("done");
    expect(renderedRows[0]?.textContent).toContain("Tarefa concluída");
    expect(renderedRows[1]?.getAttribute("data-task-state")).toBe("open");
    expect(renderedRows[1]?.textContent).toContain("Tarefa não concluída");
  });

  it("expõe a ação correta para alternar o estado da tarefa", () => {
    render(
      <TaskList
        tasks={[
          buildTask({ id: "open-1", task: "Enviar relatório", done: false }),
          buildTask({ id: "done-1", task: "Revisar lista", done: true }),
        ]}
        onToggleTaskStatus={vi.fn()}
        onSaveTask={vi.fn()}
        onDeleteTask={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", {
        name: "Marcar Enviar relatório como concluída",
      }),
    ).toBeDefined();
    expect(
      screen.getByRole("button", {
        name: "Marcar Revisar lista como não concluída",
      }),
    ).toBeDefined();
  });

  it("deixa o card mobile crescer conforme o texto e preserva truncamento no desktop", () => {
    const { container } = render(
      <TaskList
        tasks={[
          buildTask({
            id: "open-1",
            task: "Uma tarefa com texto bem longo para validar o comportamento responsivo do card na versão mobile",
            done: false,
          }),
        ]}
        onToggleTaskStatus={vi.fn()}
        onSaveTask={vi.fn()}
        onDeleteTask={vi.fn()}
      />,
    );

    const taskText = screen.getByText(
      "Uma tarefa com texto bem longo para validar o comportamento responsivo do card na versão mobile",
    );
    const taskRow = container.querySelector("[data-task-row]");

    expect(taskRow?.className).toContain("grid-cols-[auto_minmax(0,1fr)_auto]");
    expect(taskRow?.className).toContain("items-stretch");
    expect(taskRow?.className).not.toContain("overflow-hidden");
    expect(taskText.className).not.toContain("[-webkit-line-clamp:2]");
    expect(taskText.className).toContain("max-w-full");
    expect(taskText.className).toContain("break-words");
    expect(taskText.parentElement?.className).toContain("block");
    expect(taskText.parentElement?.className).toContain("self-stretch");
    expect(taskText.parentElement?.className).toContain("py-1");
    expect(taskText.parentElement?.className).toContain("leading-5");
    expect(taskText.parentElement?.className).toContain("sm:leading-6");
    expect(taskText.parentElement?.className).toContain("w-full");
    expect(taskText.parentElement?.className).toContain("pr-2");
    expect(taskText.className).toContain("sm:truncate");
  });
});