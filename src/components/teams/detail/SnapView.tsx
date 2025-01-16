interface SnapViewProps {
  snapId: string;
  teamId: string;
  onBack: () => void;
  isAdmin: boolean;
}

export const SnapView = ({
  snapId,
  teamId,
  onBack,
  isAdmin
}: SnapViewProps) => {
  return (
    <div>
      {/* Implement your snap view content here */}
    </div>
  );
};