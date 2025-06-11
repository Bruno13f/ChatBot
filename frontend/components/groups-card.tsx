import * as React from "react"

import { GroupCard } from "@/components/group-card"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

export function GroupsCard() {
  return (
    <Card className="w-full h-full bg-background flex flex-col border-0 shadow-none">
      <div className="flex flex-col gap-y-6">
        <h1 className="text-xl font-regular">Groups (20)</h1>
        <div className="flex flex-col items-center justify-between gap-y-8">
          <Input type="text" placeholder="Search for groups..." />
          <div className="flex flex-row items-center justify-between w-full px-2">
            <span className="text-xs">ALL GROUPS</span>
            <Button size="icon" className="size-6">
              <Plus />
            </Button>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center w-full h-full">
          <ScrollArea className="flex-1 max-h-100 w-full">
            <div className="flex flex-row md:flex-col lg:flex-col gap-2 w-full">
              <GroupCard groupName="Acabar cu curso" lastMessage="guerra safado"/>
              <GroupCard groupName="Grupo de estudo" lastMessage="Vamos estudar juntos!"/>
              <GroupCard groupName="Amigos do futebol" lastMessage="Quem vai jogar hoje?"/>
              <GroupCard groupName="Projeto de pesquisa" lastMessage="Precisamos revisar o relatório"/>
              <GroupCard groupName="Família" lastMessage="Vamos nos reunir no domingo?"/>
              <GroupCard groupName="Família" lastMessage="Vamos nos reunir no domingo?"/>
              <GroupCard groupName="Família" lastMessage="Vamos nos reunir no domingo?"/>
              <GroupCard groupName="Família" lastMessage="Vamos nos reunir no domingo?"/>
            </div>
          </ScrollArea>
        </div>
      </div>
    </Card>
  );
}

