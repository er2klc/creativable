
import * as React from "react";
import { useState } from "react";
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
  actionIcon?: React.ReactNode;
  onActionClick?: () => void;
}

export function ContactInfoGroup({
  title,
  leadId,
  children,
  showEmptyFields = true,
  onToggleEmptyFields,
  groupName,
  rightIcon,
  actionIcon,
  onActionClick
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

  const renderChildren = () => {
    return React.Children.map(children, (child) => {
      if (React.isValidElement(child)) {
        // Nur spezielle Props hinzufügen wenn es eine React-Komponente ist
        const additionalProps = typeof child.type === "function" ? {
          isVisible: showEmpty,
          isReordering
        } : {};

        return React.cloneElement(child, {
          ...child.props,
          ...additionalProps
        });
      }
      return child;
    });
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
        
        <div className="flex items-center gap-2">
          {actionIcon && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onActionClick}
              className="p-0 hover:bg-transparent"
            >
              {actionIcon}
            </Button>
          )}
          
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
      </div>

      {!isCollapsed && (
        <div className="space-y-1">
          {isAddingField && groupName !== 'interests_goals' && (
            <AddFieldForm 
              groupName={groupName}
              onComplete={() => setIsAddingField(false)}
            />
          )}
          {renderChildren()}
        </div>
      )}
    </div>
  );
}
