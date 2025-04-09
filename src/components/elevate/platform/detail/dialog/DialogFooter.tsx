
import { DialogFooter as UIDialogFooter } from "@/components/ui/dialog";

export const DialogFooter: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ children, className }) => (
  <UIDialogFooter className={className}>{children}</UIDialogFooter>
);
