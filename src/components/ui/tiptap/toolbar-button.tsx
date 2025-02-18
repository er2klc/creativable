
import { Button } from "../button";
import React from "react";

interface ToolbarButtonProps {
  onClick: () => void;
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
        onClick();
      }}
      className={`h-8 w-8 p-0 ${active ? 'bg-muted' : ''}`}
    >
      {children}
    </Button>
  );
}
