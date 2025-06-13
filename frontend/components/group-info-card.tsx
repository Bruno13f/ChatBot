import * as React from "react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Pencil, Trash2, Send, LogOut } from "lucide-react"
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
import { deleteGroup, updateGroup, addUsersToGroup, leaveGroup } from "@/services/groups"
import { getAllUsers } from "@/services/users"
import { ToastSuccess } from "@/components/ui/toast-success"
import { ToastError } from "@/components/ui/toast-error"
import { ToastPromise } from "./ui/toast-promise"

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
  onGroupUpdated?: (group: Group) => void;
}

export function GroupInfoCard({ group, userId, onGroupDeleted, onGroupUpdated }: GroupInfoCardProps) {
  let [showEditGroup, setShowEditGroup] = React.useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [allUsers, setAllUsers] = useState<{ _id: string; name: string }[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [infoText, setInfoText] = React.useState("Invite users...");
  const isOwner = group.owner === userId;

  React.useEffect(() => {
    async function fetchUsers() {
      try {
        const users = await getAllUsers();
        setAllUsers(users);
      } catch (err) {
        ToastError("Failed to fetch users");
      }
    }
    fetchUsers();
  }, []);

  const handleAddUser = async (userIds: string[]) => {
    setSelectedUserIds(userIds);
    if (userIds.length === 0) {
      setInfoText("Invite users...");
    } else if (userIds.length === 1) {
      setInfoText(`1 user selected`);
    } else {
      setInfoText(`${userIds.length} users selected`);
    }
  };

  const handleAddUserButton = async () => {
    if (selectedUserIds.length === 0) return;
    try {
      const updatedGroup = await ToastPromise(addUsersToGroup(group._id, selectedUserIds), 'Adding users...', 'Users added to group!', 'Failed to add users to group.'); 
      setSelectedUserIds([]);
      if (onGroupUpdated) onGroupUpdated(updatedGroup);
      setInfoText("Invite users...");
    } catch (err: any) {
      console.log(err.message);
    }
  };

  const handleDeleteGroup = async () => {
    try {
      ToastPromise(deleteGroup(group._id), 'Deleting group...', 'Group deleted successfully!', 'Failed to delete group.');
      setIsDialogOpen(false);
      if (onGroupDeleted) onGroupDeleted(group._id);
    } catch (err) {
      console.log(err);
    }
  }

  const handleLeaveGroup = async () => {
    try {
      await leaveGroup(group._id);
      setIsDialogOpen(false);
      ToastSuccess('You left the group!');
      if (onGroupDeleted) onGroupDeleted(group._id);
    } catch (err: any) {
      ToastError(err.message || 'Failed to leave group.');
    }
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
          {isOwner && (
            <Button variant="outline" className="cursor-pointer" onClick={() => setShowEditGroup(true)}><Pencil/>Edit</Button>
          )}
          <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(true)}
                title={isOwner ? "Delete group" : "Leave group"}
                className="cursor-pointer"
              >
                {isOwner ? <Trash2/> : <LogOut className="mr-2" />}
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
              onSubmit={async (name: string, picture?: string) => {
                try {
                  const updated = await updateGroup(group._id, name, picture);
                  setShowEditGroup(false);
                  ToastSuccess('Group updated successfully!');
                  if (onGroupUpdated) onGroupUpdated(updated);
                } catch (err) {
                  ToastError('Failed to update group.');
                }
              }}
            />
          </CardWidget>
        )}

        <div className="flex flex-row justify-center items-center pl-8 pr-4 mt-10 gap-x-2"> 
          {isOwner && <>
            <Combobox
              groupMembers={group.members}
              users={allUsers}
              onAddUser={handleAddUser}
              infoText={infoText}
            />
            <Button
              size={"icon"}
              className="cursor-pointer bg-green-600 hover:bg-green-700"
              onClick={handleAddUserButton}
              disabled={selectedUserIds.length === 0}
            >
              <Send className="text-white"/>
            </Button>
          </>}
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

