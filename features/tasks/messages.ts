import { MAX_TASK_LENGTH } from "@/features/tasks/constants";
import { CreateTaskBatchResult } from "@/features/tasks/types";

const formatTaskCountLabel = (
  count: number,
  singular: string,
  plural: string,
) => `${count} ${count === 1 ? singular : plural}`;

export const taskMessages = {
  validation: {
    required: "Por favor, preencha o campo da tarefa!",
    maxLength: `A tarefa deve ter no maximo ${MAX_TASK_LENGTH} caracteres.`,
    batchMaxLength: `Cada tarefa deve ter no maximo ${MAX_TASK_LENGTH} caracteres.`,
  },
  create: {
    failed: "Nao foi possivel cadastrar a tarefa.",
    allDuplicates: "Todas as tarefas informadas ja existem na lista.",
    batchSummary: ({
      createdTasks,
      duplicateTasks,
      invalidTasks,
    }: CreateTaskBatchResult) => {
      const messages: string[] = [];

      if (createdTasks.length > 0) {
        messages.push(
          `${formatTaskCountLabel(createdTasks.length, "tarefa cadastrada", "tarefas cadastradas")}.`,
        );
      }

      if (duplicateTasks.length > 0) {
        messages.push(
          `${formatTaskCountLabel(duplicateTasks.length, "duplicada ignorada", "duplicadas ignoradas")}.`,
        );
      }

      if (invalidTasks.length > 0) {
        messages.push(
          `${formatTaskCountLabel(invalidTasks.length, `com mais de ${MAX_TASK_LENGTH} caracteres ignorada`, `com mais de ${MAX_TASK_LENGTH} caracteres ignoradas`)}.`,
        );
      }

      return messages.join(" ");
    },
  },
  update: {
    success: "Tarefa editada com sucesso!",
    failed: "Nao foi possivel atualizar a tarefa.",
    statusFailed: "Nao foi possivel atualizar o status da tarefa.",
    duplicate: "Essa tarefa ja existe na lista.",
    notFound: "A tarefa informada nao foi encontrada.",
  },
  delete: {
    success: "Tarefa deletada com sucesso!",
    failed: "Nao foi possivel deletar essa tarefa.",
    genericError: "Erro ao deletar tarefa.",
  },
  clearCompleted: {
    empty: "Nao ha tarefas concluidas para limpar.",
    failed: "Nao foi possivel limpar as tarefas concluidas.",
    success: (removedCount: number) =>
      `${formatTaskCountLabel(removedCount, "tarefa concluida removida", "tarefas concluidas removidas")}.`,
  },
  sync: {
    failed: "Erro ao sincronizar tarefas:",
  },
} as const;
