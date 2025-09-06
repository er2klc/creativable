import { X } from "lucide-react";

interface DeleteButtonProps {
  onDelete: () => void;
}

export const DeleteButton = ({ onDelete }: DeleteButtonProps) => (
  <button
    onClick={onDelete}
    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded opacity-0 group-hover:opacity-100 transition-opacity"
  >
    <X className="h-4 w-4 text-gray-500 hover:text-red-600" />
  </button>
);