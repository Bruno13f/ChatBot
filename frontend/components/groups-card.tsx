import * as React from "react"

import { GroupCard } from "@/components/group-card"
import { Plus, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CardWidget } from "@/components/card-widget"
import { GroupActions } from "@/components/group-actions"

export function GroupsCard({ onInfoClick }: { onInfoClick?: () => void }) {
  
  let [showCreateGroup, setShowCreateGroup] = React.useState(false);
  
  return (
    <Card className="w-full h-full bg-background flex flex-col border-none shadow-none mb-4">
      <div className="flex flex-col gap-y-6 pt-6 md:pt-0 lg:pt-0">
        <h1 className="text-xl font-regular">Groups (20)</h1>
        <div className="flex flex-col items-center justify-between gap-y-8">
          <Input type="text" placeholder="Search for groups..." />
          <div className="flex flex-row items-center justify-between w-full px-2">
            <span className="text-xs">ALL GROUPS</span>
            <div className="flex flex-row justify-end gap-x-2">
              <Button size="icon" className="size-6 cursor-pointer" 
                onClick={() => setShowCreateGroup(true)}>
                <Plus strokeWidth={"3"}/>
              </Button>
              {showCreateGroup && (
                  <CardWidget onClose={() => setShowCreateGroup(false)}>
                    <GroupActions isCreate={true}/>
                  </CardWidget>
                )
              }
              <Button
                size="icon"
                className="size-6 lg:hidden cursor-pointer"
                onClick={onInfoClick}
              >
                <Info strokeWidth={"3"} />
              </Button>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center w-full h-full">
          <ScrollArea className="flex-1 md:max-h-140 lg:max-h-160 w-full">
            <div className="flex flex-row md:flex-col lg:flex-col gap-2 w-full">
              <GroupCard groupName="Acabar cu curso" lastMessage="guerra safado"/>
              <GroupCard groupName="Grupo de estudo" lastMessage="Vamos estudar juntos!"/>
              <GroupCard groupName="Amigos do futebol" lastMessage="Quem vai jogar hoje?"/>
              <GroupCard groupName="Projeto de pesquisa" lastMessage="Precisamos revisar o relatório"/>
              <GroupCard groupName="Família" lastMessage="Vamos nos reunir no domingo?"/>
              <GroupCard groupName="Família" lastMessage="Vamos nos reunir no domingo?"/>
              <GroupCard groupName="Família" lastMessage="Vamos nos reunir no domingo?"/>
              <GroupCard groupName="Família" lastMessage="Vamos nos reunir no domingo?"/>
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

