import { beforeEach, describe, expect, it, vi } from "vitest";
import { MAX_TASK_LENGTH } from "@/features/tasks/constants";
import { TaskErrorCode } from "@/features/tasks/errors";
import { TaskRecord } from "@/features/tasks/types";

vi.mock("@/features/tasks/repository", () => ({
  createTaskRecord: vi.fn(),
  deleteCompletedTasks: vi.fn(),
  deleteTaskById: vi.fn(),
  deleteTasksByNameInsensitive: vi.fn(),
  findTaskById: vi.fn(),
  findTaskByNameInsensitive: vi.fn(),
  findTasksByNamesInsensitive: vi.fn(),
  listTasks: vi.fn(),
  updateTaskDoneStatus: vi.fn(),
  updateTaskNameById: vi.fn(),
}));

import {
  createTaskRecord,
  deleteCompletedTasks,
  deleteTaskById,
  deleteTasksByNameInsensitive,
  findTaskById,
  findTaskByNameInsensitive,
  findTasksByNamesInsensitive,
  listTasks,
  updateTaskDoneStatus,
  updateTaskNameById,
} from "@/features/tasks/repository";
import {
  clearCompletedTasks,
  createTask,
  createTasks,
  getAllTasks,
  removeTask,
  toggleTaskDoneStatus,
  updateTaskName,
} from "@/features/tasks/service";

const USER_ID = "user-1";

const buildTask = (overrides: Partial<TaskRecord> = {}): TaskRecord => ({
  id: "task-1",
  task: "Comprar leite",
  done: false,
  userId: USER_ID,
  ...overrides,
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe("service", () => {
  it("cria uma tarefa unica", async () => {
    vi.mocked(findTaskByNameInsensitive).mockResolvedValue(null);
    vi.mocked(createTaskRecord).mockResolvedValue(buildTask());

    const createdTask = await createTask(USER_ID, "  Comprar leite  ");

    expect(findTaskByNameInsensitive).toHaveBeenCalledWith(
      USER_ID,
      "Comprar leite",
    );
    expect(createTaskRecord).toHaveBeenCalledWith(USER_ID, "Comprar leite");
    expect(createdTask).toEqual(buildTask());
  });

  it("impede criar tarefa duplicada", async () => {
    vi.mocked(findTaskByNameInsensitive).mockResolvedValue(buildTask());

    await expect(createTask(USER_ID, "Comprar leite")).rejects.toMatchObject({
      code: TaskErrorCode.DuplicateTask,
    });

    expect(createTaskRecord).not.toHaveBeenCalled();
  });

  it("cria tarefas em lote e separa duplicadas e invalidas", async () => {
    const tooLongTaskName = "x".repeat(MAX_TASK_LENGTH + 1);

    vi.mocked(findTasksByNamesInsensitive).mockResolvedValue([
      buildTask({ id: "db-1", task: "Estudar" }),
    ]);
    vi.mocked(createTaskRecord).mockResolvedValue(
      buildTask({ id: "created-1", task: "Comprar leite" }),
    );

    const result = await createTasks(
      USER_ID,
      `Comprar leite, Estudar, comprar leite, ${tooLongTaskName}`,
    );

    expect(result).toEqual({
      createdTasks: [buildTask({ id: "created-1", task: "Comprar leite" })],
      duplicateTasks: ["comprar leite", "Estudar"],
      invalidTasks: [tooLongTaskName],
    });
  });

  it("nao cria tarefa no lote quando todas sao duplicadas", async () => {
    vi.mocked(findTasksByNamesInsensitive).mockResolvedValue([buildTask()]);

    const result = await createTasks(USER_ID, "Comprar leite");

    expect(result.createdTasks).toEqual([]);
    expect(result.duplicateTasks).toEqual(["Comprar leite"]);
  });

  it("lista todas as tarefas delegando ao repository", async () => {
    const tasks = [buildTask({ id: "1" }), buildTask({ id: "2", done: true })];
    vi.mocked(listTasks).mockResolvedValue(tasks);

    await expect(getAllTasks(USER_ID)).resolves.toEqual(tasks);
    expect(listTasks).toHaveBeenCalledWith(USER_ID);
  });

  it("remove tarefa por id quando o registro existe", async () => {
    vi.mocked(deleteTaskById).mockResolvedValue({ count: 1 });

    await expect(removeTask(USER_ID, "task-1", "Comprar leite")).resolves.toBe(
      true,
    );
    expect(deleteTaskById).toHaveBeenCalledWith(USER_ID, "task-1");
    expect(deleteTasksByNameInsensitive).not.toHaveBeenCalled();
  });

  it("faz fallback para remocao por nome quando a remocao por id falha", async () => {
    vi.mocked(deleteTaskById).mockRejectedValue(new Error("not found"));
    vi.mocked(deleteTasksByNameInsensitive).mockResolvedValue({ count: 1 });

    await expect(
      removeTask(USER_ID, "task-1", "  Comprar leite "),
    ).resolves.toBe(true);
    expect(deleteTasksByNameInsensitive).toHaveBeenCalledWith(
      USER_ID,
      "Comprar leite",
    );
  });

  it("retorna falso quando nao consegue remover por nome", async () => {
    vi.mocked(deleteTasksByNameInsensitive).mockResolvedValue({ count: 0 });

    await expect(removeTask(USER_ID, "", "Comprar leite")).resolves.toBe(false);
  });

  it("alterna o status da tarefa", async () => {
    vi.mocked(findTaskById).mockResolvedValue(
      buildTask({ id: "task-1", done: false }),
    );
    vi.mocked(updateTaskDoneStatus).mockResolvedValue(
      buildTask({ id: "task-1", done: true }),
    );

    await expect(toggleTaskDoneStatus(USER_ID, "task-1")).resolves.toEqual(
      buildTask({ id: "task-1", done: true }),
    );
    expect(findTaskById).toHaveBeenCalledWith(USER_ID, "task-1");
    expect(updateTaskDoneStatus).toHaveBeenCalledWith("task-1", true);
  });

  it("retorna nulo ao tentar alternar status de tarefa inexistente", async () => {
    vi.mocked(findTaskById).mockResolvedValue(null);

    await expect(toggleTaskDoneStatus(USER_ID, "task-1")).resolves.toBeNull();
    expect(updateTaskDoneStatus).not.toHaveBeenCalled();
  });

  it("retorna a tarefa atual quando o nome editado nao muda", async () => {
    const currentTask = buildTask({ id: "task-1", task: "Comprar leite" });
    vi.mocked(findTaskById).mockResolvedValue(currentTask);

    await expect(
      updateTaskName(USER_ID, "task-1", "Comprar leite"),
    ).resolves.toEqual(currentTask);
    expect(updateTaskNameById).not.toHaveBeenCalled();
  });

  it("impede renomear para um nome que ja existe", async () => {
    vi.mocked(findTaskById).mockResolvedValue(buildTask({ id: "task-1" }));
    vi.mocked(findTaskByNameInsensitive).mockResolvedValue(
      buildTask({ id: "task-2", task: "Estudar" }),
    );

    await expect(
      updateTaskName(USER_ID, "task-1", "Estudar"),
    ).rejects.toMatchObject({
      code: TaskErrorCode.DuplicateTask,
    });

    expect(updateTaskNameById).not.toHaveBeenCalled();
  });

  it("atualiza o nome da tarefa", async () => {
    vi.mocked(findTaskById).mockResolvedValue(
      buildTask({ id: "task-1", task: "Comprar leite" }),
    );
    vi.mocked(findTaskByNameInsensitive).mockResolvedValue(null);
    vi.mocked(updateTaskNameById).mockResolvedValue(
      buildTask({ id: "task-1", task: "Estudar Vitest" }),
    );

    await expect(
      updateTaskName(USER_ID, "task-1", "Estudar Vitest"),
    ).resolves.toEqual(buildTask({ id: "task-1", task: "Estudar Vitest" }));
    expect(updateTaskNameById).toHaveBeenCalledWith("task-1", "Estudar Vitest");
  });

  it("falha com TaskNotFound quando tenta editar sem tarefa atual", async () => {
    vi.mocked(findTaskById).mockResolvedValue(null);

    await expect(
      updateTaskName(USER_ID, "task-1", "Novo nome"),
    ).rejects.toMatchObject({
      code: TaskErrorCode.TaskNotFound,
    });
  });

  it("limpa tarefas concluidas e retorna a quantidade removida", async () => {
    vi.mocked(deleteCompletedTasks)
      .mockResolvedValueOnce({ count: 2 })
      .mockResolvedValueOnce({ count: 0 });

    await expect(clearCompletedTasks(USER_ID)).resolves.toBe(2);
    await expect(clearCompletedTasks(USER_ID)).resolves.toBe(0);
  });
});
