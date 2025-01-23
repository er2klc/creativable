export interface PlaceholderTabProps {
  title?: string;
}

export const PlaceholderTab = ({ title = "Coming Soon" }: PlaceholderTabProps) => {
  return (
    <div className="p-4 text-center text-gray-500">
      <p>{title}</p>
    </div>
  );
};