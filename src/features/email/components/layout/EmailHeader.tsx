
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { RefreshCw, Search, UserCircle2, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmailHeaderProps {
  userEmail?: string;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
  isSyncing: boolean;
  profile?: any;
  onNewEmail: () => void;
  throttleTime?: number;
}

export function EmailHeader({ 
  userEmail, 
  searchQuery, 
  onSearchChange, 
  onRefresh, 
  isSyncing,
  profile,
  onNewEmail,
  throttleTime = 0
}: EmailHeaderProps) {
  return (
    <div className="fixed top-0 left-0 right-0 h-16 border-b bg-white z-10 flex items-center px-4 md:px-6">
      <div className="flex items-center w-full gap-4">
        <div className="flex items-center gap-2">
          <UserCircle2 className="h-6 w-6 text-primary" />
          <span className="hidden md:inline-block font-medium text-sm">
            {userEmail || 'Email'}
          </span>
        </div>
        
        <Separator orientation="vertical" className="h-6" />
        
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Suche nach E-Mails..."
            className="w-full pl-8 md:max-w-lg"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onNewEmail}
            className="hidden md:flex items-center gap-1"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Neue E-Mail</span>
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={onRefresh}
            disabled={isSyncing || throttleTime > 0}
            className={cn(
              "relative",
              (isSyncing || throttleTime > 0) && "opacity-70 cursor-not-allowed"
            )}
            title={throttleTime > 0 ? `Warten Sie ${Math.ceil(throttleTime/1000)} Sekunden` : "E-Mails aktualisieren"}
          >
            <RefreshCw className={cn(
              "h-5 w-5", 
              isSyncing && "animate-spin"
            )} />
            
            {throttleTime > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center">
                {Math.ceil(throttleTime/1000)}
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
