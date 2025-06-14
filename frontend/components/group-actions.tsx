import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Loader2, UploadIcon, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { useState, useRef } from "react";
import { cn } from "@/lib/utils";

interface GroupActionsProps {
  isCreate: boolean;
  initialName?: string;
  initialPicture?: string;
  onSubmit: (name: string, groupPicture?: File) => Promise<void>;
  onDeletePicture?: () => Promise<void>;
}

const groupMessages = {
  create: {
    title: "New Group",
    subtitle: "Create a new group to chat with your friends!",
    button: "Create Group",
    namePlaceholder: "Name of the group",
  },
  edit: {
    title: "Edit Group",
    subtitle: "Edit your group details.",
    button: "Save Changes",
    namePlaceholder: "New group name",
  },
};

export function GroupActions({
  isCreate,
  initialName,
  initialPicture,
  onSubmit,
  onDeletePicture,
}: GroupActionsProps) {
  const mode = isCreate ? "create" : "edit";
  const { title, subtitle, button, namePlaceholder } = groupMessages[mode];
  const [name, setName] = React.useState(initialName || "");
  const [errorName, setErrorName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    initialPicture || null
  );
  const [isDeletingPicture, setIsDeletingPicture] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setErrorName("Please select an image file");
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setErrorName("File size must be less than 5MB");
        return;
      }

      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setErrorName(null);
    }
  };

  const handleDeletePicture = async () => {
    if (onDeletePicture) {
      setIsDeletingPicture(true);
      try {
        await onDeletePicture();
        setPreviewUrl(null);
        setSelectedFile(null);
      } catch {
        setErrorName("Failed to delete picture");
      }
      setIsDeletingPicture(false);
    } else {
      // For create mode or when no delete handler is provided
      setPreviewUrl(null);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleOnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorName(null);
    setLoading(true);

    // Name validation
    if (!name) {
      setErrorName("Name can't be empty.");
      setLoading(false);
      return;
    } else if (name.length > 30) {
      setErrorName("Name must be less than 30 characters.");
      setLoading(false);
      return;
    }

    try {
      await onSubmit(name, selectedFile || undefined);
    } catch (error) {
      setErrorName(
        error instanceof Error ? error.message : "An error occurred"
      );
    }

    setLoading(false);
  };

  const handleNameFocus = () => {
    if (errorName) setErrorName(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleOnSubmit(e);
    }
  };

  return (
    <div className="flex flex-col mt-4 gap-y-2">
      <div className="flex flex-col items-start gap-2 ml-4 mb-4">
        <h1 className="text-[1rem] font-semibold">{title}</h1>
        <h2 className="text-sm font-regular text-muted-foreground">
          {subtitle}
        </h2>
      </div>
      <div className="flex flex-row items-center justify-center gap-4 mb-4">
        <div className="relative">
          <Avatar className="h-20 w-20 border-2 border-border">
            <AvatarImage
              src={previewUrl || "/placeholder-user.jpg"}
              alt="Group Picture"
            />
            <AvatarFallback></AvatarFallback>
          </Avatar>
          {previewUrl && (
            <Button
              variant="destructive"
              size="sm"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
              onClick={handleDeletePicture}
              disabled={isDeletingPicture}>
              {isDeletingPicture ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <X className="h-3 w-3" />
              )}
            </Button>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
            type="button">
            <UploadIcon className="mr-2 h-4 w-4" />
            {previewUrl ? "Change Photo" : "Upload Photo"}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      </div>
      <div className="flex flex-col gap-y-2 px-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          type="text"
          placeholder={namePlaceholder}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onFocus={handleNameFocus} // Reset error on focus
          onKeyDown={handleKeyDown} // Handle Enter key press
          aria-invalid={!!errorName && name.length > 30}
          className={cn(errorName ? "border-red-500" : "")}
        />
      </div>
      {errorName && <div className="text-sm text-red-500">{errorName}</div>}
      <div className="flex flex-row items-center justify-center mt-4 pb-2">
        <Button className="cursor-pointer" onClick={handleOnSubmit}>
          {loading ? (
            <Loader2 className="animate-spin text-gray-500 w-6 h-6" />
          ) : (
            button
          )}
        </Button>
      </div>
    </div>
  );
}
