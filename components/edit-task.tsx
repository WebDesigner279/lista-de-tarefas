import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { SquarePen } from 'lucide-react';

const EditTask = () => {
  return (
    <Dialog>
            <DialogTrigger asChild>
              <SquarePen size={16} className="cursor-pointer text-blue-500"/>
            </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Editar tarefa</DialogTitle>
                </DialogHeader>

                <div className="flex gap-2">
                  <Input placeholder="Editar tarefa..."
                  className="focus:outline-none focus:ring-0 focus-visible:ring-0 focus:border-transparent" />
                  <Button className="cursor-pointer">Editar</Button>
                </div>
                
              </DialogContent>
            </Dialog>
  )
}

export default EditTask