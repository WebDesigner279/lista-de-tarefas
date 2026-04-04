import { beforeEach, describe, expect, it, vi } from "vitest";
import { TaskErrorCode } from "@/features/tasks/errors";
import { TaskRecord } from "@/features/tasks/types";

vi.mock("@/features/tasks/repository", () => ({
  createTaskRecord: vi.fn(),
  deleteCompletedTasks: vi.fn(),
  deleteTaskById: vi.fn(),
  deleteTasksByNameInsensitive: vi.fn(),
  findTaskById: vi.fn(),
  findTaskByNameInsensitive: vi.fn(),
  listTasks: vi.fn(),
  updateTaskDoneStatus: vi.fn(),
  updateTaskNameById: vi.fn(),
}));

vi.mock("@/lib/task-events", () => ({
  publishTaskUpdate: vi.fn(),
}));

import {
  createTaskRecord,
  deleteCompletedTasks,
  deleteTaskById,
  deleteTasksByNameInsensitive,
  findTaskById,
  findTaskByNameInsensitive,
  listTasks,
  updateTaskDoneStatus,
  updateTaskNameById,
} from "@/features/tasks/repository";
import { publishTaskUpdate } from "@/lib/task-events";
import {
  clearCompletedTasks,
  createTask,
  createTasks,
  getAllTasks,
  removeTask,
  toggleTaskDoneStatus,
  updateTaskName,
} from "@/features/tasks/service";

const buildTask = (overrides: Partial<TaskRecord> = {}): TaskRecord => ({
  id: "task-1",
  task: "Comprar leite",
  done: false,
  ...overrides,
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe("service", () => {
  it("cria uma tarefa unica e publica atualizacao", async () => {
    vi.mocked(findTaskByNameInsensitive).mockResolvedValue(null);
    vi.mocked(createTaskRecord).mockResolvedValue(buildTask());

    const createdTask = await createTask("  Comprar leite  ");

    expect(findTaskByNameInsensitive).toHaveBeenCalledWith("Comprar leite");
    expect(createTaskRecord).toHaveBeenCalledWith("Comprar leite");
    expect(createdTask).toEqual(buildTask());
    expect(publishTaskUpdate).toHaveBeenCalledTimes(1);
  });

  it("impede criar tarefa duplicada", async () => {
    vi.mocked(findTaskByNameInsensitive).mockResolvedValue(buildTask());

    await expect(createTask("Comprar leite")).rejects.toMatchObject({
      code: TaskErrorCode.DuplicateTask,
    });

    expect(createTaskRecord).not.toHaveBeenCalled();
    expect(publishTaskUpdate).not.toHaveBeenCalled();
  });

  it("cria tarefas em lote e separa duplicadas e invalidas", async () => {
    vi.mocked(findTaskByNameInsensitive)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(buildTask({ id: "db-1", task: "Estudar" }));
    vi.mocked(createTaskRecord).mockResolvedValue(
      buildTask({ id: "created-1", task: "Comprar leite" }),
    );

    const result = await createTasks(
      "Comprar leite, Estudar, comprar leite, " + "x".repeat(35),
    );

    expect(result).toEqual({
      createdTasks: [buildTask({ id: "created-1", task: "Comprar leite" })],
      duplicateTasks: ["comprar leite", "Estudar"],
      invalidTasks: ["xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"],
    });
    expect(publishTaskUpdate).toHaveBeenCalledTimes(1);
  });

  it("nao publica atualizacao quando nenhuma tarefa do lote e criada", async () => {
    vi.mocked(findTaskByNameInsensitive).mockResolvedValue(buildTask());

    const result = await createTasks("Comprar leite");

    expect(result.createdTasks).toEqual([]);
    expect(result.duplicateTasks).toEqual(["Comprar leite"]);
    expect(publishTaskUpdate).not.toHaveBeenCalled();
  });

  it("lista todas as tarefas delegando ao repository", async () => {
    const tasks = [buildTask({ id: "1" }), buildTask({ id: "2", done: true })];
    vi.mocked(listTasks).mockResolvedValue(tasks);

    await expect(getAllTasks()).resolves.toEqual(tasks);
    expect(listTasks).toHaveBeenCalledTimes(1);
  });

  it("remove tarefa por id quando o registro existe", async () => {
    vi.mocked(deleteTaskById).mockResolvedValue(buildTask());

    await expect(removeTask("task-1", "Comprar leite")).resolves.toBe(true);
    expect(deleteTaskById).toHaveBeenCalledWith("task-1");
    expect(deleteTasksByNameInsensitive).not.toHaveBeenCalled();
    expect(publishTaskUpdate).toHaveBeenCalledTimes(1);
  });

  it("faz fallback para remocao por nome quando a remocao por id falha", async () => {
    vi.mocked(deleteTaskById).mockRejectedValue(new Error("not found"));
    vi.mocked(deleteTasksByNameInsensitive).mockResolvedValue({ count: 1 });

    await expect(removeTask("task-1", "  Comprar leite ")).resolves.toBe(true);
    expect(deleteTasksByNameInsensitive).toHaveBeenCalledWith("Comprar leite");
    expect(publishTaskUpdate).toHaveBeenCalledTimes(1);
  });

  it("retorna falso quando nao consegue remover por nome", async () => {
    vi.mocked(deleteTasksByNameInsensitive).mockResolvedValue({ count: 0 });

    await expect(removeTask("", "Comprar leite")).resolves.toBe(false);
    expect(publishTaskUpdate).not.toHaveBeenCalled();
  });

  it("alterna o status da tarefa e publica atualizacao", async () => {
    vi.mocked(findTaskById).mockResolvedValue(
      buildTask({ id: "task-1", done: false }),
    );
    vi.mocked(updateTaskDoneStatus).mockResolvedValue(
      buildTask({ id: "task-1", done: true }),
    );

    await expect(toggleTaskDoneStatus("task-1")).resolves.toEqual(
      buildTask({ id: "task-1", done: true }),
    );
    expect(updateTaskDoneStatus).toHaveBeenCalledWith("task-1", true);
    expect(publishTaskUpdate).toHaveBeenCalledTimes(1);
  });

  it("retorna nulo ao tentar alternar status de tarefa inexistente", async () => {
    vi.mocked(findTaskById).mockResolvedValue(null);

    await expect(toggleTaskDoneStatus("task-1")).resolves.toBeNull();
    expect(updateTaskDoneStatus).not.toHaveBeenCalled();
    expect(publishTaskUpdate).not.toHaveBeenCalled();
  });

  it("retorna a tarefa atual quando o nome editado nao muda", async () => {
    const currentTask = buildTask({ id: "task-1", task: "Comprar leite" });
    vi.mocked(findTaskById).mockResolvedValue(currentTask);

    await expect(updateTaskName("task-1", "Comprar leite")).resolves.toEqual(
      currentTask,
    );
    expect(updateTaskNameById).not.toHaveBeenCalled();
    expect(publishTaskUpdate).not.toHaveBeenCalled();
  });

  it("impede renomear para um nome que ja existe", async () => {
    vi.mocked(findTaskById).mockResolvedValue(buildTask({ id: "task-1" }));
    vi.mocked(findTaskByNameInsensitive).mockResolvedValue(
      buildTask({ id: "task-2", task: "Estudar" }),
    );

    await expect(updateTaskName("task-1", "Estudar")).rejects.toMatchObject({
      code: TaskErrorCode.DuplicateTask,
    });

    expect(updateTaskNameById).not.toHaveBeenCalled();
    expect(publishTaskUpdate).not.toHaveBeenCalled();
  });

  it("atualiza o nome da tarefa e publica atualizacao", async () => {
    vi.mocked(findTaskById).mockResolvedValue(
      buildTask({ id: "task-1", task: "Comprar leite" }),
    );
    vi.mocked(findTaskByNameInsensitive).mockResolvedValue(null);
    vi.mocked(updateTaskNameById).mockResolvedValue(
      buildTask({ id: "task-1", task: "Estudar Vitest" }),
    );

    await expect(updateTaskName("task-1", "Estudar Vitest")).resolves.toEqual(
      buildTask({ id: "task-1", task: "Estudar Vitest" }),
    );
    expect(updateTaskNameById).toHaveBeenCalledWith("task-1", "Estudar Vitest");
    expect(publishTaskUpdate).toHaveBeenCalledTimes(1);
  });

  it("falha com TaskNotFound quando tenta editar sem tarefa atual", async () => {
    vi.mocked(findTaskById).mockResolvedValue(null);

    await expect(updateTaskName("task-1", "Novo nome")).rejects.toMatchObject({
      code: TaskErrorCode.TaskNotFound,
    });
  });

  it("limpa tarefas concluidas e publica atualizacao apenas quando ha remocoes", async () => {
    vi.mocked(deleteCompletedTasks)
      .mockResolvedValueOnce({ count: 2 })
      .mockResolvedValueOnce({ count: 0 });

    await expect(clearCompletedTasks()).resolves.toBe(2);
    await expect(clearCompletedTasks()).resolves.toBe(0);

    expect(publishTaskUpdate).toHaveBeenCalledTimes(1);
  });
});
