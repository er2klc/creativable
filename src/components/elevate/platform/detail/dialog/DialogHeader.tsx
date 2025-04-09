
import { DialogHeader as UIDialogHeader } from "@/components/ui/dialog";

export const DialogHeader: React.FC<React.PropsWithChildren> = ({ children }) => (
  <UIDialogHeader>{children}</UIDialogHeader>
);
