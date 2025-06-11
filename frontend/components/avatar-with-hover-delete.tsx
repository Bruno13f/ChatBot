import { X } from "lucide-react"

export function AvatarWithHoverDelete({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative group inline-block align-middle">
      {children}
      <div className="absolute inset-0 bg-red-600/55 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full z-10 pointer-events-none">
        <X className="text-white w-5 h-5" />
      </div>
    </div>
  );
}