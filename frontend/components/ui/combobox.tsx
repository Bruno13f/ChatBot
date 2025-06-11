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

const users = [
  {
    id: "userId",
    name: "Next.js",
  },
  {
    id: "sveltekit",
    name: "SvelteKit",
  },
  {
    id: "nuxt.js",
    name: "Nuxt.js",
  },
  {
    id: "remix",
    name: "Remix",
  },
  {
    id: "astro",
    name: "Astro",
  },
]


export function Combobox(){

    const [open, setOpen] = React.useState(false)
    const [id, setId] = React.useState("")

    return (
    <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="justify-between"
          >
            {id
              ? users.find((user) => user.id === id)?.name
              : "Invite users..."}
            <ChevronsUpDown className="opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder="Search for the user..." className="h-9" />
            <CommandList>
              <CommandEmpty>No user found.</CommandEmpty>
              <CommandGroup>
                {users.map((user) => (
                  <CommandItem
                    key={user.id}
                    value={user.id}
                    onSelect={(currentId) => {
                      setId(currentId === id ? "" : currentId)
                      setOpen(false)
                    }}
                  >
                    {user.name}
                    <Check
                      className={cn(
                        "ml-auto",
                        id === user.id ? "opacity-100" : "opacity-0"
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