
import React from 'react';
import { TimelineItemType } from './TimelineUtils';
import { formatDate } from '@/lib/utils';
import {
  MessageSquare,
  FileText,
  CheckSquare,
  Calendar,
  AlertTriangle,
  User,
  File
} from 'lucide-react';
import { useSettings } from '@/hooks/use-settings';

interface TimelineItemProps {
  item: {
    id: string;
    type: TimelineItemType;
    content: string;
    timestamp: string;
    metadata?: any;
    status?: string;
    platform?: string;
  };
  onDelete?: (noteId: string) => void;
}

export const TimelineItem: React.FC<TimelineItemProps> = ({ item, onDelete }) => {
  const { settings } = useSettings();
  
  // Get icon based on type
  const getIcon = () => {
    switch (item.type) {
      case 'message':
        return <MessageSquare className="h-4 w-4 text-white" />;
      case 'note':
        return <FileText className="h-4 w-4 text-white" />;
      case 'task':
        return <CheckSquare className="h-4 w-4 text-white" />;
      case 'appointment':
        return <Calendar className="h-4 w-4 text-white" />;
      case 'phase_change':
        return <AlertTriangle className="h-4 w-4 text-white" />;
      case 'contact_created':
        return <User className="h-4 w-4 text-white" />;
      case 'file_upload':
        return <File className="h-4 w-4 text-white" />;
      default:
        return <MessageSquare className="h-4 w-4 text-white" />;
    }
  };

  // Get background color based on type
  const getBgColor = () => {
    switch (item.type) {
      case 'message':
        return 'bg-blue-500';
      case 'note':
        return 'bg-yellow-500';
      case 'task':
        return item.status === 'completed' ? 'bg-green-500' : 'bg-cyan-500';
      case 'appointment':
        return 'bg-orange-500';
      case 'phase_change':
        return 'bg-purple-500';
      case 'contact_created':
        return 'bg-emerald-500';
      case 'file_upload':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Render content based on type
  const renderContent = () => {
    switch (item.type) {
      case 'message':
        return (
          <div className="p-4 border border-blue-200 rounded-lg bg-white">
            <p className="text-sm whitespace-pre-wrap">{item.content}</p>
            {item.metadata && (
              <div className="mt-2 text-xs text-gray-500">
                <span>{item.metadata.sender === 'user' ? 'You' : 'Contact'}</span>
                <span> → </span>
                <span>{item.metadata.receiver === 'user' ? 'You' : 'Contact'}</span>
              </div>
            )}
          </div>
        );
      
      case 'task':
        return (
          <div className={`p-4 border ${item.status === 'completed' ? 'border-green-200' : 'border-cyan-200'} rounded-lg bg-white`}>
            <div className="flex items-start justify-between">
              <p className="text-sm whitespace-pre-wrap">{item.content}</p>
              {onDelete && (
                <button 
                  onClick={() => onDelete(item.id)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            {item.metadata && (
              <div className="mt-2 text-xs text-gray-500">
                {item.metadata.due_date && (
                  <div>Due: {formatDate(item.metadata.due_date)}</div>
                )}
                {item.status === 'completed' && item.metadata.completed_at && (
                  <div>Completed: {formatDate(item.metadata.completed_at)}</div>
                )}
              </div>
            )}
          </div>
        );
      
      case 'note':
        return (
          <div className="p-4 border border-yellow-200 rounded-lg bg-white">
            <div className="flex items-start justify-between">
              <p className="text-sm whitespace-pre-wrap">{item.content}</p>
              {onDelete && (
                <button 
                  onClick={() => onDelete(item.id)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            {item.metadata && item.metadata.last_edited_at && (
              <div className="mt-2 text-xs text-gray-500">
                Edited: {formatDate(item.metadata.last_edited_at)}
              </div>
            )}
          </div>
        );
      
      case 'phase_change':
        return (
          <div className="p-4 border border-purple-200 rounded-lg bg-white">
            <div className="flex items-start justify-between">
              <p className="text-sm whitespace-pre-wrap">{item.content}</p>
              {onDelete && (
                <button 
                  onClick={() => onDelete(item.id)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            {item.metadata && (
              <div className="mt-2 text-xs text-gray-500">
                {item.metadata.oldPhase && item.metadata.newPhase && (
                  <div>
                    Phase: {item.metadata.oldPhase} → {item.metadata.newPhase}
                  </div>
                )}
                {item.metadata.oldStatus && item.metadata.newStatus && (
                  <div>
                    Status: {item.metadata.oldStatus} → {item.metadata.newStatus}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      
      default:
        return (
          <div className="p-4 border border-gray-200 rounded-lg bg-white">
            <p className="text-sm whitespace-pre-wrap">{item.content}</p>
          </div>
        );
    }
  };

  return (
    <div className="flex gap-4 relative z-10">
      <div className="flex flex-col items-center">
        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${getBgColor()}`}>
          {getIcon()}
        </div>
      </div>
      
      <div className="flex-1">
        <div className="text-xs text-gray-500 mb-1">
          {formatDate(item.timestamp, settings?.language === "en" ? "PPpp" : "PPpp")}
        </div>
        {renderContent()}
      </div>
    </div>
  );
};
