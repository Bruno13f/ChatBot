import * as React from "react"

import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils";
import { AvatarGroup } from "@/components/ui/avatar-group";
import { Group } from "@/models/group";

interface GroupCardProps {
    group: Group;
    maxAvatars?: number;
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

export function GroupCard({ group, maxAvatars = 5 }: GroupCardProps) {
  const maxAvatarsLocal = useResponsiveAvatarMax();

  // Function to get initials from a name (you'll need to implement this based on your user data)
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Function to get a random color for the avatar background
  const getRandomColor = (id: string) => {
    const colors = ['bg-indigo-500', 'bg-green-600', 'bg-red-500', 'bg-orange-500', 'bg-purple-500'];
    const index = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  return (
    <Card className="w-[99%] h-full bg-background py-0 hover:bg-muted cursor-pointer">
        <div className="flex flex-row items-center justify-start gap-x-2 pl-4 py-4">
            {group.members.length > 1 ? (
              <AvatarGroup className="flex items-center" max={maxAvatarsLocal}>
                {group.members.map((memberId) => (
                  <Avatar key={memberId} className="-ml-2 first:ml-0 cursor-pointer">
                    <AvatarImage src={`/api/users/${memberId}/avatar`} alt={`User ${memberId}`} />
                    <AvatarFallback className={`${getRandomColor(memberId)} text-white`}>
                      {getInitials(memberId)}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </AvatarGroup>
            ) : (
              <Avatar className="cursor-pointer">
                <AvatarImage src={`/api/users/${group.members[0]}/avatar`} alt={`User ${group.members[0]}`} />
                <AvatarFallback className={`${getRandomColor(group.members[0])} text-white`}>
                  {getInitials(group.members[0])}
                </AvatarFallback>
              </Avatar>
            )}
            <div className="flex flex-col items-start gap-y-1 min-w-0">
                <span className="text-s font-semibold tracking-tight truncate max-w-[110px] lg:max-w-100">{group.name}</span>
                <span className="leading-none text-xs text-muted-foreground truncate max-w-[110px] lg:max-w-100">
                    {"No messages yet"}
                </span>
            </div>
        </div>
    </Card>
  );
}

