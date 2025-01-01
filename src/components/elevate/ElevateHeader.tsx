import { CreatePlatformDialog } from "./CreatePlatformDialog";

interface ElevateHeaderProps {
  onPlatformCreated?: () => Promise<void>;
}

export const ElevateHeader = ({ onPlatformCreated }: ElevateHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold">Elevate</h1>
        <p className="text-muted-foreground">
          Verwalten Sie Ihre Ausbildungsplattformen
        </p>
      </div>
      <div className="flex items-center gap-4">
        <CreatePlatformDialog onPlatformCreated={onPlatformCreated} />
      </div>
    </div>
  );
};