"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const MAX_LENGTH = 200;

interface TextareaProps {
  className?: string;
  text: string;
  setText: React.Dispatch<React.SetStateAction<string>>;
  onEnterPress?: () => void; // Function to handle Enter key press
  disabled?: boolean;
  autoFocus?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      text,
      setText,
      onEnterPress,
      disabled,
      autoFocus = false,
      ...props
    },
    ref
  ) => {
    const internalRef = React.useRef<HTMLTextAreaElement>(null);

    // Combine the forwarded ref with our internal ref
    const handleRefs = React.useMemo(
      () => (node: HTMLTextAreaElement) => {
        // Update forwarded ref if it exists
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }

        // Update internal ref
        internalRef.current = node;
      },
      [ref]
    );

    // Apply autoFocus when the component mounts or when autoFocus changes
    React.useEffect(() => {
      if (autoFocus && internalRef.current) {
        // Use setTimeout to ensure the focus happens after React rendering
        setTimeout(() => {
          internalRef.current?.focus();
        }, 0);
      }
    }, [autoFocus]);

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (event.target.value.length <= MAX_LENGTH) {
        setText(event.target.value);
      }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault(); // Prevents new line
        if (onEnterPress) {
          onEnterPress(); // Triggers sendMessage function
        }
      }
    };

    return (
      <div className="relative">
        {/* Static Placeholder */}
        <div className="absolute left-3 top-2 text-gray-400 text-sm pointer-events-none">
          {text.length === 0 && "Type here."}
        </div>

        <textarea
          ref={handleRefs}
          data-slot="textarea"
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown} // Listen for Enter key
          disabled={disabled}
          autoFocus={autoFocus}
          className={cn(
            "border-input placeholder-transparent focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content h-9 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            className
          )}
          {...props}
        />

        {/* Vertically Centered Character Counter */}
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
          {text.length}/{MAX_LENGTH}
        </div>
      </div>
    );
  }
);

// Add display name for React DevTools
Textarea.displayName = "Textarea";

export { Textarea };
