
import React from 'react';
import { EmailSidebar } from './EmailSidebar';
import { EmailList } from './EmailList';
import { EmailViewer } from './EmailViewer';
import { Separator } from "@/components/ui/separator";

export interface EmailLayoutProps {
  userEmail?: string;
}

export function EmailLayout({ userEmail }: EmailLayoutProps) {
  const [selectedFolder, setSelectedFolder] = React.useState('inbox');
  const [selectedEmailId, setSelectedEmailId] = React.useState<string | null>(null);

  return (
    <div className="grid h-full grid-cols-[240px_350px_1fr] overflow-hidden">
      {/* Email Folders Sidebar */}
      <div className="border-r">
        <EmailSidebar 
          selectedFolder={selectedFolder}
          onSelectFolder={setSelectedFolder}
        />
      </div>
      
      {/* Email List */}
      <div className="border-r overflow-y-auto">
        <EmailList 
          folder={selectedFolder}
          selectedEmailId={selectedEmailId}
          onSelectEmail={setSelectedEmailId}
        />
      </div>
      
      {/* Email Viewer */}
      <div className="overflow-y-auto">
        <EmailViewer 
          emailId={selectedEmailId}
          userEmail={userEmail}
        />
      </div>
    </div>
  );
}
