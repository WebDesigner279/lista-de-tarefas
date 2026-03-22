import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Plus, List, Check, CircleStop, SquarePen, Trash2, ListCheck, Sigma  } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"


const Home = () => {
  return (
    <main className="w-full h-screen bg-gray-100 flex justify-center items-center">
      <Card className="w-lg p-4">
        <div className="flex gap-2">       
          <Input
              placeholder="Adicionar tarefa..." 
              className="focus:outline-none focus:ring-0 focus-visible:ring-0 focus:border-transparent"/>
          <Button className="cursor-pointer" variant="default"><Plus />Cadastrar</Button>
        </div>  
       
      <Separator />
        <div className="flex gap-2">
          <Badge className="cursor-pointer" variant="default">
            <List />Todos
          </Badge>

          <Badge className="cursor-pointer" variant="outline">
            <CircleStop />Não finalizadas
          </Badge>

          <Badge className="cursor-pointer" variant="outline">
            <Check />Concluídas
          </Badge>
        </div>

        <div className=" mt-2">

          <div className="bg-blue-50 h-10 flex justify-between items-center">
            <div className="w-2 h-full bg-blue-300"></div>
            <p className="flex-1 px-2 text-sm">Estudar React</p>
            <div className="flex items-center gap-4">     
          <Dialog>
            <DialogTrigger asChild>
              <SquarePen size={16} className="cursor-pointer"/>
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
           <Trash2 size={16} className="cursor-pointer mr-2"/>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mt-4">
          <div className="flex gap-2 items-center mt-2">
          <ListCheck size={16} className="mb-2" />
          <p className="text-xs mb-2">Tarefas concluídas {3/3}</p>
          </div>
            <Button className="xs h-7 cursor-pointer" variant="outline"><Trash2 size={16} />Limpar tarefas concluídas</Button>
        </div>

        <div className="h-2 w-full bg-gray-100 mt-04 rounded-md">
          <div className="h-full bg-blue-500 rounded-md" style={ {width: "50%"} }></div>
        </div>

        <div className="flex justify-end items-center mt-2 gap-2">
          <Sigma className="flex justify-end items-center" size={16} />
          <p className="xs mb-0.5">3 Tarefas no total</p>
        </div>
        
        <div></div>
      </Card>
    </main>
    
  );
}

export default Home;