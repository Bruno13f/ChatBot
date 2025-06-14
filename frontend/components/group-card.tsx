import * as React from "react";

import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AvatarGroup } from "@/components/ui/avatar-group";
import { Group } from "@/models/group";

interface GroupCardProps {
  group: Group;
  maxAvatars?: number;
  isSelected?: boolean;
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

export function GroupCard({ group, maxAvatars = 5, isSelected = false }: GroupCardProps) {

  console.log("GROUP", group);

  const maxAvatarsLocal = useResponsiveAvatarMax();

  // Function to get initials from a name
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

  // Function to format the last message timestamp
  const formatTimestamp = (timestamp: Date) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <Card className={`w-[260px] md:w-[280px] lg:w-[300px] h-full py-0 hover:bg-muted cursor-pointer ${isSelected ? 'bg-muted' : 'bg-background'}`}>
      <div className="flex flex-row items-center justify-start gap-x-2 pl-3 md:pl-4 lg:pl-4 py-4">
        {group.groupPicture ? (
          <Avatar className="cursor-pointer h-10 w-10">
            <AvatarImage src={group.groupPicture} alt={group.name} />
            <AvatarFallback className={`${getRandomColor(group._id)} text-white`}>
              {getInitials(group.name)}
            </AvatarFallback>
          </Avatar>
        ) : group.members.length > 1 ? (
          <AvatarGroup className="flex items-center" max={group.members.length > maxAvatarsLocal ? maxAvatarsLocal : 0}>
            {group.members.map((member) => (
              <Avatar key={member._id} className="-ml-2 first:ml-0 cursor-pointer">
                <AvatarImage src={member.profilePicture || undefined} alt={`User ${member._id}`} />
                <AvatarFallback className={`${getRandomColor(member._id)} text-white`}>
                  {getInitials(member.name)}
                </AvatarFallback>
              </Avatar>
            ))}
          </AvatarGroup>
        ) : (
          <Avatar className="cursor-pointer">
            <AvatarImage src={group.members[0].profilePicture || undefined} alt={`User ${group.members[0]._id}`} />
            <AvatarFallback className={`${getRandomColor(group.members[0]._id)} text-white`}>
              {getInitials(group.members[0].name)}
            </AvatarFallback>
          </Avatar>
        )}
        <div className="flex flex-col flex-1 min-w-0 items-start justify-start ml-2">
          <span className="text-s font-semibold tracking-tight truncate max-w-[110px] lg:max-w-100">{group.name}</span>
          <div className="flex gap-x-1">
            {group.lastMessage ? (
              <>
                <span className="text-xs font-medium text-muted-foreground truncate max-w-[80px]">
                  {group.lastMessage.sender.name}:
                </span>
                <span className="text-xs text-muted-foreground truncate max-w-[120px] md:max-w-[150px] lg:max-w-[170px]">
                  {group.lastMessage.message}
                </span>
              </>
            ) : (
              <span className="text-xs text-muted-foreground">
                No messages yet
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

