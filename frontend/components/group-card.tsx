import * as React from "react"

import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils";
import { AvatarGroup } from "@/components/ui/avatar-group";

interface GroupCardProps {
    groupName: string,
    lastMessage?: string,
  }

function useResponsiveAvatarMax() {
  const [max, setMax] = React.useState(3);

  React.useEffect(() => {
    function handleResize() {
      if (window.innerWidth < 1030) {
        setMax(2);
      }  else if (window.innerWidth < 1400) {
        setMax(1);
      } else if (window.innerWidth > 1830){
        setMax(3);
      } else {
        setMax(2);
      }
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return max;
}

export function GroupCard({groupName, lastMessage}: GroupCardProps) {
  const maxAvatars = useResponsiveAvatarMax();

  return (
    <Card className="w-[99%] h-full bg-background py-0 hover:bg-muted cursor-pointer">
        <div className="flex flex-row items-center justify-start gap-x-2 pl-4 py-4">
            <AvatarGroup className="flex items-center" max={maxAvatars}>
              <Avatar className="-ml-2 first:ml-0 cursor-pointer">
                  <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                  <AvatarFallback className="bg-indigo-500 text-white">CN</AvatarFallback>
              </Avatar>
              <Avatar className="-ml-2 first:ml-0 cursor-pointer">
                  <AvatarFallback className="bg-green-600 text-white">CN</AvatarFallback>
              </Avatar>
              <Avatar className="-ml-2 first:ml-0 cursor-pointer">
                  <AvatarFallback className="bg-red-500 text-white">AB</AvatarFallback>
              </Avatar>
              <Avatar className="-ml-2 first:ml-0 cursor-pointer">
                  <AvatarFallback className="bg-indigo-500 text-white">VK</AvatarFallback>
              </Avatar>
              <Avatar className="-ml-2 first:ml-0 cursor-pointer">
                  <AvatarFallback className="bg-orange-500 text-white">RS</AvatarFallback>
              </Avatar>
            </AvatarGroup>
            <div className="flex flex-col items-start gap-y-1 min-w-0">
                <span className="text-s font-semibold tracking-tight truncate max-w-[110px] lg:max-w-100">{groupName}</span>
                <span className="leading-none text-xs text-muted-foreground truncate max-w-[110px] lg:max-w-100">
                    {lastMessage ? lastMessage : "No messages yet"}
                </span>
            </div>
        </div>
    </Card>
  );
}

