
import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GroupActionsMenu } from "./GroupActionsMenu";
import { InfoRow } from "./InfoRow";

interface ContactInfoGroupProps {
  title: string;
  fields: Array<{
    id: string;
    label: string;
    value: string;
    type: string;
    groupId: string;
  }>;
  onEdit: (fieldId: string, newValue: string) => void;
  onDelete: (fieldId: string) => void;
  onAddField: (groupId: string) => void;
  onDeleteGroup: (groupId: string) => void;
  onEditGroupName: (groupId: string, newName: string) => void;
  groupId: string;
}

export function ContactInfoGroup({
  title,
  fields,
  onEdit,
  onDelete,
  onAddField,
  onDeleteGroup,
  onEditGroupName,
  groupId
}: ContactInfoGroupProps) {
  return (
    <Card className="mb-4">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
        <GroupActionsMenu
          groupId={groupId}
          groupName={title}
          onAddField={onAddField}
          onDeleteGroup={onDeleteGroup}
          onEditGroupName={onEditGroupName}
        />
      </CardHeader>
      <CardContent className="space-y-2">
        {fields.map((field) => (
          <InfoRow
            key={field.id}
            id={field.id}
            label={field.label}
            value={field.value}
            type={field.type}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
        {fields.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Keine Felder in dieser Gruppe
          </p>
        )}
      </CardContent>
    </Card>
  );
}
