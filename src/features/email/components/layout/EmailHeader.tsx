
import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RefreshCw, Search, MoveHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmailHeaderProps {
  userEmail?: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onRefresh: () => void;
  isSyncing: boolean;
}

export function EmailHeader({ 
  userEmail,
  searchQuery,
  onSearchChange,
  onRefresh,
  isSyncing
}: EmailHeaderProps) {
  return (
    <div className="p-4 border-b flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <h1 className="text-xl font-semibold">
          Emails
          {userEmail && (
            <span className="text-sm font-normal text-muted-foreground ml-2">
              ({userEmail})
            </span>
          )}
        </h1>
      </div>
      
      <div className="flex items-center space-x-2">
        <div className="relative w-[300px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search emails..."
            className="pl-8 w-full"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0.5 top-0.5 h-8 w-8"
              onClick={() => onSearchChange('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <Button 
          variant="outline" 
          size="icon"
          onClick={onRefresh}
          disabled={isSyncing}
        >
          <RefreshCw className={cn("h-4 w-4", isSyncing && "animate-spin")} />
        </Button>
      </div>
    </div>
  );
}
