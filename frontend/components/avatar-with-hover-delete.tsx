import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { X } from "lucide-react"

interface AvatarWithHoverDeleteProps {
  children: React.ReactNode;
  name: string;
}

export function AvatarWithHoverDelete({ children, name }: AvatarWithHoverDeleteProps) {
  return (
    <Tooltip delayDuration={100}>
      <TooltipTrigger asChild>
        <div className="relative group inline-block align-middle">
          {children}
          <div className="absolute inset-0 bg-red-600/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full z-10 pointer-events-none">
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