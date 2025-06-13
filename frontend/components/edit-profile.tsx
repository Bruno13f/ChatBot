import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button";
import { UploadIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getUserById, updateUser } from "@/services/users";
import { ToastPromise } from "@/components/ui/toast-promise"; // ajuste o import conforme seu projeto

export function EditProfile({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;
    getUserById(userId)
      .then(user => {
        setName(user.name);
        setEmail(user.email);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const userId = localStorage.getItem("userId");
    if (!userId) return;
    try {
      await ToastPromise(
        updateUser(userId, name, email),
        "Updating profile...",
        "Profile updated successfully!",
        "Failed to update profile."
      );
      onClose(); // Fecha o modal após sucesso
    } catch (err) {
      // O ToastPromise já mostra o erro
    }
  };

  if (loading) return <div>Loading...</div>;

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
        <form className="flex flex-col gap-4" onSubmit={handleSave}>
          <div className="grid gap-2 px-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" type="text" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="grid gap-2 px-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div className="flex flex-row items-center justify-center mt-4 pb-2">
            <Button className="cursor-pointer" type="submit">Save Changes</Button>
        </div>
        </form>
    </div>
    );
}