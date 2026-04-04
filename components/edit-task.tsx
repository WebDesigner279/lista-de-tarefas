"use client";

import { KeyboardEvent, useEffect, useState } from "react";
import { SquarePen } from "lucide-react";
import { MAX_TASK_LENGTH } from "@/features/tasks/constants";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface EditTaskProps {
  taskId: string;
  taskName: string;
  onSaveTask: (id: string, taskName: string) => Promise<boolean> | boolean;
}

const EditTask = ({ taskId, taskName, onSaveTask }: EditTaskProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editedTaskName, setEditedTaskName] = useState(taskName);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isDialogOpen) {
      setEditedTaskName(taskName);
    }
  }, [isDialogOpen, taskName]);

  const isSaveDisabled = editedTaskName.trim().length === 0 || isSubmitting;

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const success = await onSaveTask(taskId, editedTaskName);

      if (success) {
        setIsDialogOpen(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !isSaveDisabled) {
      event.preventDefault();
      void handleSubmit();
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
            value={editedTaskName}
            onChange={(event) => setEditedTaskName(event.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isSubmitting}
            maxLength={MAX_TASK_LENGTH}
            className="focus:outline-none focus:ring-0 focus-visible:ring-0 focus:border-transparent"
          />
          <Button
            type="button"
            className="cursor-pointer"
            onClick={() => void handleSubmit()}
            disabled={isSaveDisabled}
          >
            Editar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditTask;
