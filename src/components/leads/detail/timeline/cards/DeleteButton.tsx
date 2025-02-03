import { X } from "lucide-react";

interface DeleteButtonProps {
  onDelete: () => void;
}

export const DeleteButton = ({ onDelete }: DeleteButtonProps) => (
  <button
    onClick={onDelete}
    className="p-1 hover:bg-gray-100 rounded"
  >
    <X className="h-4 w-4 text-gray-500 hover:text-red-600" />
  </button>
);