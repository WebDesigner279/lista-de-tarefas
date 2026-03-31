"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { MAX_TASK_LENGTH } from "@/features/tasks/constants";

interface TaskInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isDisabled?: boolean;
}

export const TaskInput = ({
  value,
  onChange,
  onSubmit,
  isDisabled = false,
}: TaskInputProps) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isDisabled) {
      onSubmit();
    }
  };

  return (
    <div className="flex gap-2">
      <Input
        placeholder="Adicionar tarefa..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        maxLength={MAX_TASK_LENGTH}
        disabled={isDisabled}
        className="focus:outline-none focus:ring-0 focus-visible:ring-0 focus:border-transparent"
      />
      <Button
        className="cursor-pointer"
        variant="default"
        onClick={onSubmit}
        disabled={value.length === 0 || isDisabled}
      >
        <Plus />
        Cadastrar
      </Button>
    </div>
  );
};
