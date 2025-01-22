import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/hooks/use-settings";
import { AddFieldForm } from "./AddFieldForm";
import { GroupActionsMenu } from "./GroupActionsMenu";

interface ContactInfoGroupProps {
  title: string;
  leadId: string;
  children: React.ReactNode;
  showEmptyFields?: boolean;
  onToggleEmptyFields?: () => void;
  groupName: string;
  rightIcon?: React.ReactNode;
}

export function ContactInfoGroup({
  title,
  leadId,
  children,
  showEmptyFields = true,
  onToggleEmptyFields,
  groupName,
  rightIcon,
}: ContactInfoGroupProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showEmpty, setShowEmpty] = useState(showEmptyFields);
  const [isReordering, setIsReordering] = useState(false);
  const [isAddingField, setIsAddingField] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const { settings } = useSettings();

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleToggleEmpty = () => {
    setShowEmpty(!showEmpty);
    if (onToggleEmptyFields) {
      onToggleEmptyFields();
    }
  };

  const handleToggleReordering = () => {
    setIsReordering(!isReordering);
  };

  return (
    <div className="space-y-2">
      <div 
        className="flex items-center justify-between group cursor-pointer"
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleCollapse}
            className="p-0 hover:bg-transparent"
          >
            {isCollapsed ? (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronUp className="h-4 w-4 text-gray-500" />
            )}
          </Button>
          <h3 className="text-sm font-medium text-gray-600">{title}</h3>
          <div className={`transition-opacity duration-200 ${showActions ? 'opacity-100' : 'opacity-0'}`}>
            {rightIcon}
          </div>
        </div>
        
        {showActions && groupName !== 'interests_goals' && (
          <GroupActionsMenu
            showEmpty={showEmpty}
            isReordering={isReordering}
            onToggleEmpty={handleToggleEmpty}
            onToggleReordering={handleToggleReordering}
            onAddField={() => setIsAddingField(true)}
          />
        )}
      </div>

      {!isCollapsed && (
        <div className="space-y-1">
          {isAddingField && groupName !== 'interests_goals' && (
            <AddFieldForm 
              groupName={groupName}
              onComplete={() => setIsAddingField(false)}
            />
          )}
          {React.Children.map(children, child => {
            if (React.isValidElement(child)) {
              return React.cloneElement(child, {
                ...child.props,
                isVisible: showEmpty,
                isReordering: isReordering
              });
            }
            return child;
          })}
        </div>
      )}
    </div>
  );
}