import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button";
import { UploadIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface GroupActionsProps {
    isCreate: boolean
}

const groupMessages = {
    create: {
        title: "New Group",
        subtitle: "Create a new group to chat with your friends!",
        button: "Create Group",
        namePlaceholder: "Name of the group"
    },
    edit: {
        title: "Edit Group",
        subtitle: "Edit your group details.",
        button: "Save Changes",
        namePlaceholder: "New group name"
    }
};

export function GroupActions({isCreate}: GroupActionsProps) {
    const mode = isCreate ? "create" : "edit";
    const { title, subtitle, button, namePlaceholder } = groupMessages[mode];

    return (
        <div className="flex flex-col mt-4 gap-y-2">
            <div className="flex flex-col items-start gap-2 ml-4 mb-4">
                <h1 className="text-[1rem] font-semibold">{title}</h1>
                <h2 className="text-sm font-regular text-muted-foreground">{subtitle}</h2>
            </div>
            <div className="flex flex-row items-center justify-center gap-4 mb-4">
                <Avatar className="h-20 w-20 border-2 border-border">
                    <AvatarImage src="/placeholder-user.jpg" alt="Profile Picture" />
                    <AvatarFallback></AvatarFallback>
                </Avatar>
                <Button variant="outline" size="sm" className="cursor-pointer">
                    <UploadIcon className="mr-2 h-4 w-4" />
                    Upload Photo
                </Button>
            </div>
            <div className="flex flex-col gap-y-2 px-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" type="text" defaultValue={namePlaceholder} />
            </div>
            <div className="flex flex-row items-center justify-center mt-4 pb-2">
                <Button className="cursor-pointer">{button}</Button>
            </div>
        </div>
    );
}