import * as React from "react"

import { GroupCard } from "@/components/group-card"
import { Plus, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CardWidget } from "@/components/card-widget"
import { GroupActions } from "@/components/group-actions"
import { createGroup } from "@/services/groups"
import toast, { Toaster } from 'react-hot-toast';
import { Group } from "@/models/group"

interface GroupsCardProps {
  groups: Group[]
  onInfoClick?: () => void
}

export function GroupsCard({ onInfoClick, groups }: GroupsCardProps) {
  
  let [showCreateGroup, setShowCreateGroup] = React.useState(false);

  async function handleCreateGroup(data: string): Promise<void> {
    try {
      const group = await createGroup(data);
      groups.push(group);

      toast.success('Group created successfully!', {
        style: {
          borderRadius: '6px',
          background: 'var(--card)',
          padding: '10px',
          border: '1px solid var(--border)',
          color: 'var(--text)',
        },
      })
      setShowCreateGroup(false);
    } catch (error) {
      toast((error instanceof Error ? error.message : "Something went wrong."), {
        icon: '❌',
        style: {
          borderRadius: '6px',
          background: 'var(--card)',
          padding: '10px',
          border: '1px solid var(--border)',
          color: 'var(--text)',
        },
      });
    }
  }
  
  return (
    <Card className="w-full h-full bg-background flex justify-center border-none shadow-none mb-4">
      <div className="flex flex-col gap-y-6 pt-6 md:pt-0 lg:pt-0">
        <h1 className="text-xl font-regular">Groups ({groups.length})</h1>
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
                    <GroupActions isCreate={true} onSubmit={handleCreateGroup}/>
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
          { groups.length == 0 ? (
            <div className="flex flex-col items-center justify-center w-full h-full">
              <p className="text-sm text-muted-foreground">No groups found. Create a new one!</p>
            </div>
          ) : (
            <ScrollArea className="flex-1 md:max-h-140 lg:max-h-160 w-full">
            <div className="flex flex-row md:flex-col lg:flex-col gap-2 w-full">
              {groups.map((group) => (
                <GroupCard key={group._id} group={group}/>
              ))}
            </div>
          </ScrollArea>
          )}
        </div>
      </div>
    </Card>
  );
}

