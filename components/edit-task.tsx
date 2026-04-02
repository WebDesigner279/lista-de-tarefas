"use client";

import { KeyboardEvent, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { SquarePen } from "lucide-react";
import { MAX_TASK_LENGTH } from "@/features/tasks/constants";

interface EditTaskProps {
  taskId: string;
  taskName: string;
  onSubmit: (id: string, value: string) => Promise<boolean> | boolean;
}

const EditTask = ({ taskId, taskName, onSubmit }: EditTaskProps) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(taskName);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setValue(taskName);
    }
  }, [open, taskName]);

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const success = await onSubmit(taskId, value);

      if (success) {
        setOpen(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !isSubmitting) {
      event.preventDefault();
      void handleSubmit();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button type="button" aria-label={`Editar ${taskName}`}>
          <SquarePen size={16} className="cursor-pointer text-blue-500" />
        </button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar tarefa</DialogTitle>
        </DialogHeader>

        <div className="flex gap-2">
          <Input
            placeholder="Editar tarefa..."
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isSubmitting}
            maxLength={MAX_TASK_LENGTH}
            className="focus:outline-none focus:ring-0 focus-visible:ring-0 focus:border-transparent"
          />
          <Button
            type="button"
            className="cursor-pointer"
            onClick={() => void handleSubmit()}
            disabled={value.trim().length === 0 || isSubmitting}
          >
            Editar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditTask;
