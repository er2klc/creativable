import * as React from 'react';
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

export const ChatButton = () => {
  return (
    <Button variant="outline" size="icon" disabled>
      <MessageCircle className="h-4 w-4" />
    </Button>
  );
};