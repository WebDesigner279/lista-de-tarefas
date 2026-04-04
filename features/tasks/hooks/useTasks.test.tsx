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

class MockEventSource {
  listeners = new Map<string, Set<EventListener>>();
  onerror: (() => void) | null = null;
  close = vi.fn();

  addEventListener = vi.fn((event: string, listener: EventListener) => {
    const currentListeners =
      this.listeners.get(event) ?? new Set<EventListener>();
    currentListeners.add(listener);
    this.listeners.set(event, currentListeners);
  });

  removeEventListener = vi.fn((event: string, listener: EventListener) => {
    this.listeners.get(event)?.delete(listener);
  });

  emit(event: string) {
    for (const listener of this.listeners.get(event) ?? []) {
      listener(new Event(event));
    }
  }
}

class MockEventSourceConstructor extends MockEventSource {
  static lastInstance: MockEventSource;

  constructor(url: string) {
    super();
    void url;
    MockEventSourceConstructor.lastInstance = this;
  }
}

const buildTask = (overrides: Partial<TaskRecord> = {}): TaskRecord => ({
  id: "task-1",
  task: "Comprar leite",
  done: false,
  ...overrides,
});

let mockEventSource: MockEventSource;

beforeEach(() => {
  vi.clearAllMocks();
  mockEventSource = new MockEventSource();
  vi.stubGlobal(
    "EventSource",
    MockEventSourceConstructor as typeof EventSource,
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("useTasks", () => {
  it("sincroniza tarefas iniciais e calcula os indicadores derivados", async () => {
    vi.mocked(fetchTasksAction).mockResolvedValue([
      buildTask({ id: "1", done: false }),
      buildTask({ id: "2", task: "Estudar", done: true }),
    ]);

    const { result } = renderHook(() => useTasks());

    mockEventSource = MockEventSourceConstructor.lastInstance;

    await waitFor(() => {
      expect(result.current.taskList).toHaveLength(2);
    });

    expect(result.current.totalTasks).toBe(2);
    expect(result.current.completedTasks).toBe(1);
    expect(result.current.openTasks).toBe(1);
    expect(result.current.completionPercentage).toBe(50);
    expect(result.current.filteredTasks).toHaveLength(2);
  });

  it("cria tarefa, atualiza a lista local e mostra aviso de lote parcial", async () => {
    vi.mocked(fetchTasksAction).mockResolvedValue([]);
    vi.mocked(createTasksAction).mockResolvedValue({
      createdTasks: [buildTask({ id: "created-1", task: "Treinar" })],
      duplicateTasks: ["Estudar"],
      invalidTasks: [],
    });

    const { result } = renderHook(() => useTasks());

    mockEventSource = MockEventSourceConstructor.lastInstance;

    await waitFor(() => {
      expect(fetchTasksAction).toHaveBeenCalled();
    });

    await act(async () => {
      await result.current.createTask("Treinar");
    });

    expect(result.current.taskList).toEqual([
      buildTask({ id: "created-1", task: "Treinar" }),
    ]);
    expect(toast.warning).toHaveBeenCalledTimes(1);
  });

  it("retorna erro amigavel ao editar para um nome duplicado", async () => {
    vi.mocked(fetchTasksAction).mockResolvedValue([buildTask({ id: "1" })]);
    vi.mocked(updateTaskNameAction).mockRejectedValue(
      new TaskError(TaskErrorCode.DuplicateTask),
    );

    const { result } = renderHook(() => useTasks());

    mockEventSource = MockEventSourceConstructor.lastInstance;

    await waitFor(() => {
      expect(result.current.taskList).toHaveLength(1);
    });

    await act(async () => {
      const success = await result.current.editTask("1", "Estudar");
      expect(success).toBe(false);
    });

    expect(toast.error).toHaveBeenCalledWith("Essa tarefa ja existe na lista.");
  });

  it("remove tarefas concluidas do estado local ao limpar concluidas", async () => {
    vi.mocked(fetchTasksAction).mockResolvedValue([
      buildTask({ id: "1", done: false }),
      buildTask({ id: "2", task: "Estudar", done: true }),
    ]);
    vi.mocked(clearCompletedTasksAction).mockResolvedValue(1);

    const { result } = renderHook(() => useTasks());

    mockEventSource = MockEventSourceConstructor.lastInstance;

    await waitFor(() => {
      expect(result.current.completedTasks).toBe(1);
    });

    await act(async () => {
      const success = await result.current.clearCompleted();
      expect(success).toBe(true);
    });

    expect(result.current.taskList).toEqual([
      buildTask({ id: "1", done: false }),
    ]);
    expect(toast.success).toHaveBeenCalledWith("1 tarefa concluida removida.");
  });

  it("sincroniza novamente quando recebe evento tasks-updated", async () => {
    vi.mocked(fetchTasksAction)
      .mockResolvedValueOnce([buildTask({ id: "1", task: "Comprar leite" })])
      .mockResolvedValueOnce([
        buildTask({ id: "1", task: "Comprar leite" }),
        buildTask({ id: "2", task: "Estudar", done: true }),
      ]);

    const { result } = renderHook(() => useTasks());

    mockEventSource = MockEventSourceConstructor.lastInstance;

    await waitFor(() => {
      expect(result.current.taskList).toHaveLength(1);
    });

    act(() => {
      mockEventSource.emit("tasks-updated");
    });

    await waitFor(() => {
      expect(result.current.taskList).toHaveLength(2);
    });
  });

  it("remove tarefa da lista local quando a exclusao e bem-sucedida", async () => {
    vi.mocked(fetchTasksAction).mockResolvedValue([
      buildTask({ id: "1", task: "Comprar leite" }),
      buildTask({ id: "2", task: "Estudar" }),
    ]);
    vi.mocked(deleteTaskAction).mockResolvedValue(true);

    const { result } = renderHook(() => useTasks());

    mockEventSource = MockEventSourceConstructor.lastInstance;

    await waitFor(() => {
      expect(result.current.taskList).toHaveLength(2);
    });

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
    vi.mocked(fetchTasksAction).mockResolvedValue([
      buildTask({ id: "1", done: false }),
      buildTask({ id: "2", task: "Concluir relatorio", done: true }),
    ]);

    const { result } = renderHook(() => useTasks());

    mockEventSource = MockEventSourceConstructor.lastInstance;

    await waitFor(() => {
      expect(result.current.taskList).toHaveLength(2);
    });

    act(() => {
      result.current.setActiveFilter("done");
    });

    expect(result.current.activeFilter).toBe("done");
    expect(result.current.filteredTasks).toEqual([
      buildTask({ id: "2", task: "Concluir relatorio", done: true }),
    ]);
  });
});
