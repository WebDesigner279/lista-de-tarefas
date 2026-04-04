import { describe, expect, it } from "vitest";
import {
  appendTasksToList,
  calculateCompletionPercentage,
  countCompletedTasks,
  createTaskListSignature,
  filterTasksByStatus,
  mergeTaskListSnapshot,
  removeCompletedTasksFromList,
  removeTaskFromList,
  replaceTaskInList,
} from "@/features/tasks/hooks/useTasks.helpers";
import { TaskRecord } from "@/features/tasks/types";

const buildTask = (overrides: Partial<TaskRecord>): TaskRecord => ({
  id: "task-1",
  task: "Comprar leite",
  done: false,
  ...overrides,
});

describe("useTasks.helpers", () => {
  it("conta quantas tarefas foram concluidas", () => {
    const tasks = [
      buildTask({ id: "1", done: false }),
      buildTask({ id: "2", done: true }),
      buildTask({ id: "3", done: true }),
    ];

    expect(countCompletedTasks(tasks)).toBe(2);
  });

  it("calcula o percentual de conclusao", () => {
    expect(calculateCompletionPercentage(0, 0)).toBe(0);
    expect(calculateCompletionPercentage(4, 3)).toBe(75);
  });

  it("filtra tarefas por status", () => {
    const tasks = [
      buildTask({ id: "1", done: false }),
      buildTask({ id: "2", done: true }),
    ];

    expect(filterTasksByStatus(tasks, "all")).toHaveLength(2);
    expect(filterTasksByStatus(tasks, "open")).toEqual([tasks[0]]);
    expect(filterTasksByStatus(tasks, "done")).toEqual([tasks[1]]);
  });

  it("gera uma assinatura deterministica da lista", () => {
    const tasks = [
      buildTask({ id: "1", task: "A", done: false }),
      buildTask({ id: "2", task: "B", done: true }),
    ];

    expect(createTaskListSignature(tasks)).toBe("1:A:false|2:B:true");
  });

  it("mantem a referencia anterior quando a lista nao muda", () => {
    const currentTasks = [buildTask({ id: "1" })];
    const nextTasks = [buildTask({ id: "1" })];

    expect(mergeTaskListSnapshot(currentTasks, nextTasks)).toBe(currentTasks);
  });

  it("anexa tarefas criadas ao fim da lista atual", () => {
    const currentTasks = [buildTask({ id: "1" })];
    const createdTasks = [buildTask({ id: "2", task: "Treinar" })];

    expect(appendTasksToList(currentTasks, createdTasks)).toEqual([
      currentTasks[0],
      createdTasks[0],
    ]);
  });

  it("remove uma tarefa pelo id e pelo nome normalizado", () => {
    const tasks = [
      buildTask({ id: "1", task: "Comprar leite" }),
      buildTask({ id: "2", task: "Estudar" }),
    ];

    expect(removeTaskFromList(tasks, "1", " comprar leite ")).toEqual([
      tasks[1],
    ]);
  });

  it("substitui uma tarefa atualizada preservando as demais", () => {
    const tasks = [
      buildTask({ id: "1", done: false }),
      buildTask({ id: "2", done: false }),
    ];
    const updatedTask = buildTask({ id: "2", done: true });

    expect(replaceTaskInList(tasks, updatedTask)).toEqual([
      tasks[0],
      updatedTask,
    ]);
  });

  it("remove apenas tarefas concluidas", () => {
    const tasks = [
      buildTask({ id: "1", done: false }),
      buildTask({ id: "2", done: true }),
    ];

    expect(removeCompletedTasksFromList(tasks)).toEqual([tasks[0]]);
  });
});
