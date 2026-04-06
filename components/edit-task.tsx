"use client";

import { KeyboardEvent, useEffect, useState } from "react";
import { MAX_TASK_LENGTH } from "@/features/tasks/constants";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface EditTaskProps {
  taskId: string | null;
  taskName: string;
  isDialogOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSaveTask: (id: string, taskName: string) => Promise<boolean> | boolean;
}

const EditTask = ({
  taskId,
  taskName,
  isDialogOpen,
  onOpenChange,
  onSaveTask,
}: EditTaskProps) => {
  const [editedTaskName, setEditedTaskName] = useState(taskName);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isDialogOpen) {
      setEditedTaskName(taskName);
    }
  }, [isDialogOpen, taskName]);

  const isSaveDisabled = editedTaskName.trim().length === 0 || isSubmitting;

  const handleSubmit = async () => {
    if (!taskId) {
      return;
    }

    setIsSubmitting(true);

    try {
      const success = await onSaveTask(taskId, editedTaskName);

      if (success) {
        onOpenChange(false);
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
    <Dialog open={isDialogOpen} onOpenChange={onOpenChange}>
      <DialogContent forceMount className="duration-0">
        <DialogHeader>
          <DialogTitle>Editar tarefa</DialogTitle>
          <DialogDescription className="sr-only">
            Atualize o nome da tarefa selecionada.
          </DialogDescription>
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
