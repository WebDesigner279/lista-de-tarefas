import { describe, expect, it } from "vitest";
import { MAX_TASK_LENGTH } from "@/features/tasks/constants";
import { TaskError, TaskErrorCode } from "@/features/tasks/errors";
import {
  createTaskLookupKey,
  normalizeTaskName,
  splitTaskNames,
  validateTaskName,
} from "@/features/tasks/validators";

describe("validators", () => {
  it("mantem o limite maximo de 70 caracteres por tarefa", () => {
    expect(MAX_TASK_LENGTH).toBe(70);
  });

  it("normaliza o nome da tarefa removendo espacos externos", () => {
    expect(normalizeTaskName("  Comprar leite  ")).toBe("Comprar leite");
  });

  it("cria uma chave de busca case-insensitive e sem espacos externos", () => {
    expect(createTaskLookupKey("  Estudar TypeScript  ")).toBe(
      "estudar typescript",
    );
  });

  it("separa varias tarefas e ignora entradas vazias", () => {
    expect(splitTaskNames("Estudar, , Treinar ,  ")).toEqual([
      "Estudar",
      "Treinar",
    ]);
  });

  it("retorna o nome normalizado quando a tarefa e valida", () => {
    expect(validateTaskName("  Ler documentacao  ")).toBe("Ler documentacao");
  });

  it("lanca erro quando a tarefa fica vazia apos normalizacao", () => {
    expect(() => validateTaskName("   ")).toThrowError(
      new TaskError(TaskErrorCode.NameRequired),
    );
  });

  it("lanca erro quando a tarefa ultrapassa o limite permitido", () => {
    const oversizedTaskName = "x".repeat(MAX_TASK_LENGTH + 1);

    expect(() => validateTaskName(oversizedTaskName)).toThrowError(
      new TaskError(TaskErrorCode.NameTooLong),
    );
  });
});
