"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ListTodo, Plus } from "lucide-react";

interface TaskInputProps {
  onSubmit: (value: string) => Promise<boolean> | boolean;
  isDisabled?: boolean;
}

export const TaskInput = ({ onSubmit, isDisabled = false }: TaskInputProps) => {
  const [value, setValue] = useState("");

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
      <div className="mb-8 flex items-center gap-2 text-blue-500">
        <ListTodo className="size-7" />
        <h1 className="text-2xl font-bold">Lista de Tarefas</h1>
      
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Adicionar tarefa ou varias..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
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
      <p className="text-xs text-muted-foreground">
        Separe varias tarefas com virgula para cadastrar tudo de uma vez.
      </p>
    </div>
  );
};
