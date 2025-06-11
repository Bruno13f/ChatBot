import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button";
import { UploadIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function EditProfile() {
    return (
    <div className="flex flex-col mt-4 gap-y-2">
        <div className="flex flex-col items-center gap-2 mb-4">
            <h1 className="text-[1rem] font-semibold">Edit Profile</h1>
            <h2 className="text-sm font-regular text-muted-foreground">Update your personal information</h2>
        </div>
        <div className="flex flex-col items-center gap-4">
            <Avatar className="h-20 w-20 border-2 border-border">
                <AvatarImage src="/placeholder-user.jpg" alt="Profile Picture" />
                <AvatarFallback>UR</AvatarFallback>
            </Avatar>
            <Button variant="outline" size="sm" className="cursor-pointer">
                <UploadIcon className="mr-2 h-4 w-4" />
                Change Photo
            </Button>
        </div>
        <div className="grid gap-2 px-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" type="text" defaultValue="User Name" />
          </div>
          <div className="grid gap-2 px-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" defaultValue="email@email.com" />
        </div>
        <div className="flex flex-row items-center justify-center gap-4 mt-4">
            <Button className="cursor-pointer" >Save Changes</Button>
        </div>
    </div>
    );
}