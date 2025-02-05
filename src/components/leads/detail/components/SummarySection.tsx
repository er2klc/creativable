
import { ArrowRight } from "lucide-react";
import { getIconForSection } from "../utils/summary-formatter";

interface SummarySectionProps {
  section: string;
}

export function SummarySection({ section }: SummarySectionProps) {
  // Split by numbered sections
  const lines = section.trim().split('\n');
  const title = lines[0].replace(/\*\*/g, '').trim();
  const content = lines.slice(1).filter(line => line.trim()).join('\n');
  const icon = getIconForSection(title);

  return (
    <div className="bg-gradient-to-r from-white to-gray-50 rounded-lg p-4 shadow-sm mb-4 border border-gray-100">
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h3 className="font-medium text-lg text-gray-900">{title}</h3>
      </div>
      <div className="space-y-2 ml-7">
        {content.split('\n').map((line, i) => {
          if (line.startsWith('-') || line.startsWith('•')) {
            return (
              <div key={i} className="flex items-start gap-2">
                <ArrowRight className="h-4 w-4 mt-1 text-gray-400 flex-shrink-0" />
                <p className="text-gray-700 leading-relaxed">{line.replace(/^[-•]/, '').trim()}</p>
              </div>
            );
          }
          return <p key={i} className="text-gray-700 leading-relaxed">{line}</p>;
        })}
      </div>
    </div>
  );
}
