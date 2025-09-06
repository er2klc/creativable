
import { Button } from "../button";
import * as React from "react";

interface ToolbarButtonProps {
  onClick: (e: React.MouseEvent) => void;
  active?: boolean;
  children: React.ReactNode;
}

export function ToolbarButton({ onClick, active, children }: ToolbarButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick(e);
      }}
      className={`h-8 w-8 p-0 ${active ? 'bg-muted' : ''}`}
    >
      {children}
    </Button>
  );
}
