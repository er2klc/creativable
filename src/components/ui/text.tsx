
import { cn } from "@/lib/utils";
import { forwardRef, HTMLAttributes } from "react";

export interface TextProps extends HTMLAttributes<HTMLParagraphElement> {
  className?: string;
  children: React.ReactNode;
}

export const Text = forwardRef<HTMLParagraphElement, TextProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={cn("text-sm text-foreground", className)}
        {...props}
      >
        {children}
      </p>
    );
  }
);

Text.displayName = "Text";
