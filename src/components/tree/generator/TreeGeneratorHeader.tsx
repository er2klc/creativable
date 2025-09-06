import React from 'react';

interface TreeGeneratorHeaderProps {
  username: string;
  bio: string;
  onUsernameChange: (value: string) => void;
  onBioChange: (value: string) => void;
}

export const TreeGeneratorHeader: React.FC<TreeGeneratorHeaderProps> = ({
  username,
  bio,
  onUsernameChange,
  onBioChange
}) => {
  return (
    <div className="text-center">
      <h1 className="text-2xl font-bold mb-2">Tree Generator</h1>
      <p className="text-sm text-muted-foreground">
        Create your personalized link page
      </p>
    </div>
  );
};