import * as React from "react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Pencil, Trash2, Send } from "lucide-react"
import { AvatarGroup } from "@/components/ui/avatar-group"
import { AvatarWithHoverDelete } from "@/components/avatar-with-hover-delete"
import { GroupActions } from "@/components//group-actions"
import { CardWidget } from "@/components/card-widget"
import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Combobox } from "@/components/ui/combobox"
import { Group } from "@/models/group"
import { deleteGroup } from "@/services/groups"

const avatars = [
  { img: "https://github.com/shadcn.png", fallback: "CN", color: "bg-indigo-500" },
  { img: "", fallback: "CN", color: "bg-green-600" },
  { img: "", fallback: "AB", color: "bg-red-500" },
  { img: "", fallback: "VK", color: "bg-indigo-500" },
  { img: "", fallback: "RS", color: "bg-orange-500" },
  { img: "https://github.com/shadcn.png", fallback: "CN", color: "bg-indigo-500" },
  { img: "", fallback: "CN", color: "bg-green-600" },
  { img: "", fallback: "AB", color: "bg-red-500" },
  { img: "", fallback: "VK", color: "bg-indigo-500" },
  { img: "", fallback: "RS", color: "bg-orange-500" },
  { img: "https://github.com/shadcn.png", fallback: "CN", color: "bg-indigo-500" },
  { img: "", fallback: "CN", color: "bg-green-600" },
  { img: "", fallback: "AB", color: "bg-red-500" },
  { img: "", fallback: "VK", color: "bg-indigo-500" },
  { img: "", fallback: "RS", color: "bg-orange-500" },
];

interface GroupInfoCardProps {
  group: Group;
  userId: string;
  onGroupDeleted?: (groupId: string) => void;
}

export function GroupInfoCard({ group, userId, onGroupDeleted }: GroupInfoCardProps) {
  let [showEditGroup, setShowEditGroup] = React.useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const isOwner = group.owner === userId;

  const handleDeleteGroup = async () => {
    try {
      await deleteGroup(group._id);
      setIsDialogOpen(false);
      if (onGroupDeleted) onGroupDeleted(group._id);
    } catch (err) {
      alert("Failed to delete group.");
    }
  }

  const handleLeaveGroup = () => {
    console.log("Leave group!", group._id)
  }

  return (
    <Card className="w-full h-full bg-background border-0 shadow-none justify-center">
      <div className="flex flex-col items-center justify-center">
        <Avatar className="size-22">
            <AvatarImage src={group.picture || "https://github.com/shadcn.png"} alt={group.name} />
            <AvatarFallback className="bg-gray-400 text-white">{group.name?.slice(0,2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <h1 className="text-[1rem] font-regular mt-4">{group.name}</h1>
        <h2 className="text-sm font-regular text-muted-foreground">{group.members.length} members</h2>
        <div className="flex flex-row gap-2 mt-4">
          <Button variant="outline" className="cursor-pointer" onClick={() => setShowEditGroup(true)} disabled={!isOwner}><Pencil/>Edit</Button>
          <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(true)}
                title={isOwner ? "Delete group" : "Leave group"}
                className="cursor-pointer"
              >
                {isOwner ? <Trash2/> : <span>Leave</span>}
                {isOwner ? "Delete" : "Leave"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  {isOwner ? "Do you really want to delete this group?" : "Do you really want to leave this group?"}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction onClick={isOwner ? handleDeleteGroup : handleLeaveGroup}>
                  Yes
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        {showEditGroup && (
          <CardWidget onClose={() => setShowEditGroup(false)}>
            <GroupActions
              isCreate={false}
              onSubmit={async (name: string) => {
                console.log("Group name updated to:", name);
              }}
            />
          </CardWidget>
        )}

        <div className="flex flex-row justify-center items-center pl-8 pr-4 mt-10 gap-x-2"> 
          <Combobox/>
          <Button size={"icon"} className="cursor-pointer bg-green-600 hover:bg-green-700">
            <Send className="text-white"/>
          </Button>
        </div>
        <div className="flex flex-col items-start w-full mt-8">
          <h1 className="text-[1rem] font-regular">Members</h1>
          <AvatarGroup className="flex flex-wrap flex-row items-center gap-3 mt-3 pl-2" max={0}>
            {avatars.map((a, i) => (
              <AvatarWithHoverDelete key={i}>
                <Avatar className="cursor-pointer">
                  {a.img ? (
                    <AvatarImage src={a.img} alt={a.fallback} />
                  ) : null}
                  <AvatarFallback className={`${a.color} text-white`}>{a.fallback}</AvatarFallback>
                </Avatar>
              </AvatarWithHoverDelete>
            ))}
          </AvatarGroup>
        </div>
      </div>
    </Card>
  );
}

