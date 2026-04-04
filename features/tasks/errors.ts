export enum TaskErrorCode {
  NameRequired = "TASK_NAME_REQUIRED",
  NameTooLong = "TASK_NAME_TOO_LONG",
  DuplicateTask = "DUPLICATE_TASK",
  TaskNotFound = "TASK_NOT_FOUND",
}

export class TaskError extends Error {
  constructor(public readonly code: TaskErrorCode) {
    super(code);
    this.name = "TaskError";
  }
}

export const isTaskError = (
  error: unknown,
  code?: TaskErrorCode,
): error is TaskError => {
  if (!(error instanceof TaskError)) {
    return false;
  }

  return code ? error.code === code : true;
};
