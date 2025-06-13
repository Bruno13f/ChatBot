import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { X } from "lucide-react"
import * as React from "react"

interface AvatarWithHoverDeleteProps {
  children: React.ReactNode;
  name: string;
  onDelete?: () => void;
  isOwner: boolean;
  isCurrentUser?: boolean;
}

export function AvatarWithHoverDelete({ children, name, onDelete, isOwner, isCurrentUser }: AvatarWithHoverDeleteProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleClick = (e: React.MouseEvent) => {
    if (window.innerWidth < 1030) { // sm breakpoint
      e.preventDefault();
      setIsOpen(true);
      setTimeout(() => setIsOpen(false), 2000); // Hide after 2 seconds
    }
  };

  return (
    <Tooltip delayDuration={100} open={isOpen} onOpenChange={setIsOpen}>
      <TooltipTrigger asChild>
        <div 
          className="relative group inline-block align-middle"
          onClick={handleClick}
        >
          {children}
          <div 
            className={`absolute inset-0 bg-red-600/80 flex items-center justify-center transition-opacity rounded-full z-10 cursor-pointer ${isOwner && !isCurrentUser ? 'opacity-0 group-hover:opacity-100' : 'hidden'}`}
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.();
            }}
          >
            <X className="text-white w-5 h-5" />
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>{name}</p>
      </TooltipContent>
    </Tooltip>
  );
}