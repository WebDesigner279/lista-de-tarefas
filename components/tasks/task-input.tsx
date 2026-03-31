"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { MAX_TASK_LENGTH } from "@/features/tasks/constants";
import { toast } from "sonner";

interface TaskInputProps {
  onSubmit: (value: string) => Promise<boolean> | boolean;
  isDisabled?: boolean;
}

export const TaskInput = ({ onSubmit, isDisabled = false }: TaskInputProps) => {
  const [value, setValue] = useState("");
  const hasWarnedMaxLengthRef = useRef(false);

  useEffect(() => {
    const reachedMaxLength = value.length === MAX_TASK_LENGTH;

    if (reachedMaxLength && !hasWarnedMaxLengthRef.current) {
      toast.warning(`Limite de ${MAX_TASK_LENGTH} caracteres atingido.`);
      hasWarnedMaxLengthRef.current = true;
      return;
    }

    if (!reachedMaxLength) {
      hasWarnedMaxLengthRef.current = false;
    }
  }, [value]);

  const handleSubmit = async () => {
    const success = await onSubmit(value);

    if (success) {
      setValue("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isDisabled) {
      void handleSubmit();
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex gap-2">
        <Input
          placeholder="Adicionar tarefa..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={MAX_TASK_LENGTH}
          disabled={isDisabled}
          className="focus:outline-none focus:ring-0 focus-visible:ring-0 focus:border-transparent"
        />
        <Button
          className="cursor-pointer"
          variant="default"
          onClick={() => void handleSubmit()}
          disabled={value.trim().length === 0 || isDisabled}
        >
          <Plus />
          Cadastrar
        </Button>
      </div>
    </div>
  );
};
