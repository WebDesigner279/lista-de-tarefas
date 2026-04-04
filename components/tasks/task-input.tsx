"use client";

import { KeyboardEvent, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ListTodo, Plus } from "lucide-react";
import { MAX_TASK_LENGTH } from "@/features/tasks/constants";

interface TaskInputProps {
  onCreateTask: (taskName: string) => Promise<boolean> | boolean;
  isDisabled?: boolean;
}

const TASK_INPUT_PLACEHOLDER = "Adicionar tarefa ou varias...";
const TASK_INPUT_HELPER_TEXT =
  "Separe varias tarefas com virgula para cadastrar tudo de uma vez.";

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
    <div className="flex flex-col gap-1.5">
      <div className="mb-8 flex items-center gap-2 text-blue-500">
        <ListTodo className="size-7" />
        <h1 className="text-2xl font-bold">Lista de Tarefas</h1>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder={TASK_INPUT_PLACEHOLDER}
          value={taskNameInput}
          onChange={(event) => setTaskNameInput(event.target.value)}
          onKeyDown={handleInputKeyDown}
          disabled={isDisabled}
          maxLength={MAX_TASK_LENGTH * 5}
          className="focus:outline-none focus:ring-0 focus-visible:ring-0 focus:border-transparent"
        />
        <Button
          className="cursor-pointer"
          variant="default"
          onClick={() => void handleSubmit()}
          disabled={isSubmitDisabled}
        >
          <Plus />
          Cadastrar
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">{TASK_INPUT_HELPER_TEXT}</p>
    </div>
  );
};
