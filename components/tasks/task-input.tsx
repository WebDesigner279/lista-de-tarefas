"use client";

import { KeyboardEvent, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { MAX_TASK_LENGTH } from "@/features/tasks/constants";

interface TaskInputProps {
  onCreateTask: (taskName: string) => Promise<boolean> | boolean;
  isDisabled?: boolean;
}

const TASK_INPUT_PLACEHOLDER = "Adicionar tarefa ou varias...";
const TASK_INPUT_HELPER_TEXT =
  "Separe várias tarefas com vírgula para cadastrar tudo de uma vez.";

export const TaskInput = ({
  onCreateTask,
  isDisabled = false,
}: TaskInputProps) => {
  const [taskNameInput, setTaskNameInput] = useState("");

  const isSubmitDisabled = useMemo(() => {
    return taskNameInput.trim().length === 0 || isDisabled;
  }, [isDisabled, taskNameInput]);

  const handleSubmit = async () => {
    const success = await onCreateTask(taskNameInput);

    if (success) {
      setTaskNameInput("");
    }
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !isSubmitDisabled) {
      void handleSubmit();
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Input
          placeholder={TASK_INPUT_PLACEHOLDER}
          value={taskNameInput}
          onChange={(event) => setTaskNameInput(event.target.value)}
          onKeyDown={handleInputKeyDown}
          disabled={isDisabled}
          maxLength={MAX_TASK_LENGTH * 5}
          className="h-11 rounded-2xl border-slate-200 px-4 text-base focus:border-slate-200 focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
        />
        <Button
          className="size-11 shrink-0 cursor-pointer rounded-full px-0 text-base font-semibold sm:h-11 sm:min-w-36 sm:rounded-2xl sm:px-5"
          variant="default"
          onClick={() => void handleSubmit()}
          disabled={isSubmitDisabled}
        >
          <Plus className="size-4" />
          <span className="hidden sm:inline">Cadastrar</span>
        </Button>
      </div>
      <p className="max-w-md text-sm leading-5 text-muted-foreground">
        {TASK_INPUT_HELPER_TEXT}
      </p>
    </div>
  );
};
