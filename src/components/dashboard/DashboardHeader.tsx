
import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RefreshCw, Search, MoveHorizontal, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardHeaderProps {
  title: string;
  description?: string;
  searchQuery?: string;
  searchPlaceholder?: string;
  onSearchChange?: (query: string) => void;
  actionLabel?: string;
  onAction?: () => void;
  actionDisabled?: boolean;
  actionLoading?: boolean;
  actionIcon?: React.ReactNode;
  rightContent?: React.ReactNode;
}

export function DashboardHeader({ 
  title,
  description,
  searchQuery = '',
  searchPlaceholder = "Search...",
  onSearchChange,
  actionLabel,
  onAction,
  actionDisabled = false,
  actionLoading = false,
  actionIcon,
  rightContent
}: DashboardHeaderProps) {
  return (
    <div className="p-4 border-b flex items-center justify-between bg-background">
      <div className="flex-none">
        <h1 className="text-xl font-semibold">
          {title}
          {description && (
            <span className="text-sm font-normal text-muted-foreground ml-2">
              {description}
            </span>
          )}
        </h1>
      </div>
      
      <div className="flex items-center space-x-2">
        {onSearchChange && (
          <div className="relative w-[300px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={searchPlaceholder}
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
        )}
        
        {onAction && (
          <Button 
            variant="outline" 
            size={actionLabel ? "default" : "icon"}
            onClick={onAction}
            disabled={actionDisabled}
          >
            {actionLoading ? (
              <>
                <Loader2 className={cn("h-4 w-4 animate-spin", actionLabel && "mr-2")} />
                {actionLabel && actionLabel}
              </>
            ) : (
              <>
                {actionIcon || <RefreshCw className={cn("h-4 w-4", actionLabel && "mr-2")} />}
                {actionLabel && actionLabel}
              </>
            )}
          </Button>
        )}
        
        {rightContent}
      </div>
    </div>
  );
}
