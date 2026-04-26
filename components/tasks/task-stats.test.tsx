/* @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TaskStats } from "@/components/tasks/task-stats";

afterEach(() => {
  cleanup();
});

describe("TaskStats", () => {
  it("mostra o resumo correto para o filtro aberto", () => {
    render(
      <TaskStats
        activeFilter="open"
        totalTasks={5}
        openTasks={3}
        completedTasks={2}
        completionPercentage={40}
        onClearCompletedTasks={vi.fn()}
      />,
    );

    expect(screen.getByText("Não finalizadas 3 / 5")).toBeDefined();
    expect(screen.getByText("5 tarefas no total")).toBeDefined();
  });

  it("desabilita o botao de limpar quando nao existem concluidas", () => {
    render(
      <TaskStats
        activeFilter="all"
        totalTasks={0}
        openTasks={0}
        completedTasks={0}
        completionPercentage={0}
        onClearCompletedTasks={vi.fn()}
      />,
    );

    const clearButton = screen.getByRole("button", {
      name: "Limpar concluídas",
    });

    expect((clearButton as HTMLButtonElement).disabled).toBe(true);
  });

  it("aciona a limpeza quando existem tarefas concluidas", () => {
    const onClearCompletedTasks = vi.fn();

    render(
      <TaskStats
        activeFilter="done"
        totalTasks={4}
        openTasks={1}
        completedTasks={3}
        completionPercentage={75}
        onClearCompletedTasks={onClearCompletedTasks}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Limpar concluídas" }));

    expect(onClearCompletedTasks).toHaveBeenCalledTimes(1);
  });
});
