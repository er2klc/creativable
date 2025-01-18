interface TimelineHeaderProps {
  title: string;
}

export const TimelineHeader = ({ title }: TimelineHeaderProps) => (
  <h3 className="text-lg font-semibold mb-4">{title}</h3>
);