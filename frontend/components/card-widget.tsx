interface CardWidgetProps {
  children: React.ReactNode;
  onClose: () => void;
}

export function CardWidget({ children, onClose }: CardWidgetProps) {
  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/70">
      <div className="w-5/6 max-w-sm h-fit bg-background shadow-xl p-8 relative rounded-2xl border border-border">
        <button
          className="absolute top-2 right-4 text-xl cursor-pointer"
          onClick={onClose}
          aria-label="Close"
        >✕</button>
        {children}
      </div>
    </div>
  );
}