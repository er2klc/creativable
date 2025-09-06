import { Edit } from "lucide-react";

interface NoteCardViewProps {
  content: string;
  onEdit: () => void;
}

export const NoteCardView = ({ content, onEdit }: NoteCardViewProps) => {
  return (
    <div className="relative group">
      <div className="whitespace-pre-wrap break-words">
        {content}
      </div>
      <div className="absolute top-0 right-0 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onEdit}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <Edit className="h-4 w-4 text-gray-500 hover:text-blue-600" />
        </button>
      </div>
    </div>
  );
};