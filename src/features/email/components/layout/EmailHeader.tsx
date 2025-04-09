
import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RefreshCw, Search, MoveHorizontal, X, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { HeaderActions } from "@/components/layout/HeaderActions";

interface EmailHeaderProps {
  userEmail?: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onRefresh: () => void;
  isSyncing: boolean;
  profile?: any;
}

export function EmailHeader({ 
  userEmail,
  searchQuery,
  onSearchChange,
  onRefresh,
  isSyncing,
  profile
}: EmailHeaderProps) {
  return (
    <div className="fixed top-[64px] md:top-0 left-0 right-0 z-[40] bg-white border-b border-sidebar-border md:left-[72px] md:group-hover:left-[240px] transition-[left] duration-300">
      <div className="w-full">
        <div className="h-16 px-4 flex items-center">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full mt-8 md:mt-0">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              <h1 className="text-lg md:text-xl font-semibold text-foreground">
                Emails
                {userEmail && (
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    ({userEmail})
                  </span>
                )}
              </h1>
            </div>
            
            <div className="w-full md:w-[400px] relative">
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
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={onRefresh}
                disabled={isSyncing}
                className="flex items-center gap-1"
              >
                <RefreshCw className={cn("h-4 w-4", isSyncing && "animate-spin")} />
                <span className="hidden md:inline">Refresh</span>
              </Button>
              
              <HeaderActions userEmail={userEmail} profile={profile} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
