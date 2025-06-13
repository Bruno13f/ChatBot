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
  onAddUser: (userId: string) => void;
  infoText: string;
}

export function Combobox({ groupMembers, users, onAddUser, infoText }: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [id, setId] = React.useState("");

  // Filtra usuários que não estão no grupo
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
          className="justify-between w-[140px]"
        >
          {infoText}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search for the user..." className="h-9" />
          <CommandList>
            <CommandEmpty>No user found.</CommandEmpty>
            <CommandGroup>
              {availableUsers.map((user) => (
                <CommandItem
                  key={user._id}
                  value={user._id}
                  onSelect={(currentId) => {
                    if (currentId === id) {
                      // If clicking the same user, deselect
                      setId("");
                      onAddUser(""); // Pass empty string to indicate deselection
                    } else {
                      // If selecting a different user
                      setId(currentId);
                      onAddUser(currentId);
                    }
                    setOpen(false);
                  }}
                >
                  {user.name}
                  <Check
                    className={cn(
                      "ml-auto",
                      id === user._id ? "opacity-100" : "opacity-0"
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