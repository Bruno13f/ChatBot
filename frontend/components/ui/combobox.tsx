"use client"

import { cn } from "@/lib/utils"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import React from "react"
import { Button } from "@/components/ui/button"
import { Check, ChevronsUpDown } from "lucide-react"

interface ComboboxProps {
  groupMembers: { _id: string; name: string }[];
  users: { _id: string; name: string }[];
  onAddUser: (userIds: string[]) => void;
  infoText: string;
}

export function Combobox({ groupMembers, users, onAddUser, infoText }: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);

  // Filter users that are not in the group
  const availableUsers = users.filter(
    (user) => !groupMembers.some((member) => member._id === user._id)
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="justify-between w-[160px]"
        >
          {infoText}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search for users..." className="h-9" />
          <CommandList>
            <CommandEmpty>No users found.</CommandEmpty>
            <CommandGroup>
              {availableUsers.map((user) => (
                <CommandItem
                  key={user._id}
                  value={user._id}
                  onSelect={(currentId) => {
                    const newSelectedIds = selectedIds.includes(currentId)
                      ? selectedIds.filter(id => id !== currentId)
                      : [...selectedIds, currentId];
                    
                    setSelectedIds(newSelectedIds);
                    onAddUser(newSelectedIds);
                  }}
                >
                  {user.name}
                  <Check
                    className={cn(
                      "ml-auto",
                      selectedIds.includes(user._id) ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}