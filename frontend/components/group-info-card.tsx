import * as React from "react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Pencil, Trash2, UserPlus } from "lucide-react"
import { AvatarGroup } from "@/components/ui/avatar-group"
import { AvatarWithHoverDelete } from "@/components/avatar-with-hover-delete"

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

export function GroupInfoCard() {
  return (
    <Card className="w-full h-full bg-background border-0 shadow-none justify-center">
      <div className="flex flex-col items-center justify-center">
        <Avatar className="size-22">
            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
            <AvatarFallback className="bg-gray-400 text-white">AC</AvatarFallback>
        </Avatar>
        <h1 className="text-[1rem] font-regular mt-4">Acabar cu curso</h1>
        <h2 className="text-sm font-regular text-muted-foreground">5 members</h2>
        <div className="flex flex-row gap-2 mt-4">
          <Button variant="outline" className="cursor-pointer"><Pencil/>Edit</Button>
          <Button variant="outline" className="cursor-pointer"><Trash2/>Delete</Button>
        </div>
        <div className="flex flex-row justify-between items-center w-full mt-10 cursor-pointer"> 
          <h2 className="text-sm font-regular text-muted-foreground">Invite more people</h2>
          <UserPlus className="text-muted-foreground size-5"/>
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

