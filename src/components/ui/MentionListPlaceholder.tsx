import React from "react";

export const MentionListPlaceholder = ({ props }: any) => {
  return (
    <div className="bg-background border rounded-lg shadow-lg p-2">
      <div className="text-sm text-muted-foreground">
        Mention functionality temporarily disabled
      </div>
    </div>
  );
};