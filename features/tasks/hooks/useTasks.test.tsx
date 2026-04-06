/* @vitest-environment jsdom */

import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TaskError, TaskErrorCode } from "@/features/tasks/errors";
import { TaskRecord } from "@/features/tasks/types";

vi.mock("@/actions/tasks", () => ({
  clearCompletedTasksAction: vi.fn(),
  createTasksAction: vi.fn(),
  deleteTaskAction: vi.fn(),
  fetchTasksAction: vi.fn(),
  toggleTaskDoneStatusAction: vi.fn(),
  updateTaskNameAction: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    warning: vi.fn(),
  },
}));

import {
  clearCompletedTasksAction,
  createTasksAction,
  deleteTaskAction,
  fetchTasksAction,
  updateTaskNameAction,
} from "@/actions/tasks";
import { useTasks } from "@/features/tasks/hooks/useTasks";
import { toast } from "sonner";

const buildTask = (overrides: Partial<TaskRecord> = {}): TaskRecord => ({
  id: "task-1",
  task: "Comprar leite",
  done: false,
  ...overrides,
});

let pollingCallback: (() => void) | undefined;

const triggerPollingSync = async () => {
  await act(async () => {
    pollingCallback?.();
  });
};

beforeEach(() => {
  vi.clearAllMocks();
  pollingCallback = undefined;
  vi.spyOn(globalThis, "queueMicrotask").mockImplementation(() => undefined);
  vi.spyOn(window, "setInterval").mockImplementation(
    (handler: TimerHandler) => {
      pollingCallback = typeof handler === "function" ? handler : undefined;
      return 1;
    },
  );
  vi.spyOn(window, "clearInterval").mockImplementation(() => undefined);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("useTasks", () => {
  it("sincroniza tarefas iniciais e calcula os indicadores derivados", async () => {
    const { result } = renderHook(() =>
      useTasks({
        initialTasks: [
          buildTask({ id: "1", done: false }),
          buildTask({ id: "2", task: "Estudar", done: true }),
        ],
      }),
    );

    expect(result.current.totalTasks).toBe(2);
    expect(result.current.completedTasks).toBe(1);
    expect(result.current.openTasks).toBe(1);
    expect(result.current.completionPercentage).toBe(50);
    expect(result.current.filteredTasks).toHaveLength(2);
  });

  it("cria tarefa, atualiza a lista local e mostra aviso de lote parcial", async () => {
    vi.mocked(createTasksAction).mockResolvedValue({
      createdTasks: [buildTask({ id: "created-1", task: "Treinar" })],
      duplicateTasks: ["Estudar"],
      invalidTasks: [],
    });

    const { result } = renderHook(() => useTasks({ initialTasks: [] }));

    await act(async () => {
      await result.current.createTask("Treinar");
    });

    expect(result.current.taskList).toEqual([
      buildTask({ id: "created-1", task: "Treinar" }),
    ]);
    expect(toast.warning).toHaveBeenCalledTimes(1);
  });

  it("retorna erro amigavel ao editar para um nome duplicado", async () => {
    vi.mocked(updateTaskNameAction).mockRejectedValue(
      new TaskError(TaskErrorCode.DuplicateTask),
    );

    const { result } = renderHook(() =>
      useTasks({ initialTasks: [buildTask({ id: "1" })] }),
    );

    await act(async () => {
      const success = await result.current.editTask("1", "Estudar");
      expect(success).toBe(false);
    });

    expect(toast.error).toHaveBeenCalledWith("Essa tarefa ja existe na lista.");
  });

  it("remove tarefas concluidas do estado local ao limpar concluidas", async () => {
    vi.mocked(clearCompletedTasksAction).mockResolvedValue(1);

    const { result } = renderHook(() =>
      useTasks({
        initialTasks: [
          buildTask({ id: "1", done: false }),
          buildTask({ id: "2", task: "Estudar", done: true }),
        ],
      }),
    );

    expect(result.current.completedTasks).toBe(1);

    await act(async () => {
      const success = await result.current.clearCompleted();
      expect(success).toBe(true);
    });

    expect(result.current.taskList).toEqual([
      buildTask({ id: "1", done: false }),
    ]);
    expect(toast.success).toHaveBeenCalledWith("1 tarefa concluida removida.");
  });

  it("sincroniza novamente no proximo ciclo de polling", async () => {
    vi.mocked(fetchTasksAction).mockResolvedValue([
      buildTask({ id: "1", task: "Comprar leite" }),
      buildTask({ id: "2", task: "Estudar", done: true }),
    ]);

    const { result } = renderHook(() =>
      useTasks({
        initialTasks: [buildTask({ id: "1", task: "Comprar leite" })],
      }),
    );

    expect(result.current.taskList).toHaveLength(1);

    await triggerPollingSync();

    await waitFor(() => {
      expect(result.current.taskList).toHaveLength(2);
    });
  });

  it("remove tarefa da lista local quando a exclusao e bem-sucedida", async () => {
    vi.mocked(deleteTaskAction).mockResolvedValue(true);

    const { result } = renderHook(() =>
      useTasks({
        initialTasks: [
          buildTask({ id: "1", task: "Comprar leite" }),
          buildTask({ id: "2", task: "Estudar" }),
        ],
      }),
    );

    await act(async () => {
      const success = await result.current.deleteTask("1", "Comprar leite");
      expect(success).toBe(true);
    });

    expect(result.current.taskList).toEqual([
      buildTask({ id: "2", task: "Estudar" }),
    ]);
    expect(toast.success).toHaveBeenCalledWith("Tarefa deletada com sucesso!");
  });

  it("atualiza o filtro ativo e a lista filtrada", async () => {
    const { result } = renderHook(() =>
      useTasks({
        initialTasks: [
          buildTask({ id: "1", done: false }),
          buildTask({ id: "2", task: "Concluir relatorio", done: true }),
        ],
      }),
    );

    act(() => {
      result.current.setActiveFilter("done");
    });

    expect(result.current.activeFilter).toBe("done");
    expect(result.current.filteredTasks).toEqual([
      buildTask({ id: "2", task: "Concluir relatorio", done: true }),
    ]);
  });
});
