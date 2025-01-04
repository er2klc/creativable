import { PlatformDetailHeader } from "../PlatformDetailHeader";

interface PlatformHeaderProps {
  platform: any;
  activeUnit: any;
  isAdmin: boolean;
  isCompleted: (id: string) => boolean;
  markAsCompleted: (id: string, completed?: boolean) => Promise<void>;
  handleDeleteUnit: () => Promise<void>;
  progress: number;
  videoDuration: number;
  documentsCount: number;
}

export const PlatformHeader = ({
  platform,
  activeUnit,
  isAdmin,
  isCompleted,
  markAsCompleted,
  handleDeleteUnit,
  progress,
  videoDuration,
  documentsCount
}: PlatformHeaderProps) => {
  if (!activeUnit) return null;

  return (
    <PlatformDetailHeader
      moduleTitle={platform.name}
      title={activeUnit.title}
      isCompleted={isCompleted(activeUnit.id)}
      onComplete={() => markAsCompleted(activeUnit.id, !isCompleted(activeUnit.id))}
      isAdmin={isAdmin}
      onDelete={handleDeleteUnit}
      videoDuration={videoDuration}
      documentsCount={documentsCount}
      progress={progress}
    />
  );
};