export interface PlaceholderTabProps {
  title: string;
}

export const PlaceholderTab = ({ title }: PlaceholderTabProps) => {
  return (
    <div className="p-4">
      <p className="text-muted-foreground">{title}</p>
    </div>
  );
};