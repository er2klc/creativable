
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./dialog";
import { Button } from "./button";
import { Input } from "./input";
import { useState, useEffect } from "react";

interface InputDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (value: string) => void;
  title: string;
  description?: string;
  placeholder?: string;
  defaultValue?: string;
}

export function InputDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  placeholder,
  defaultValue = "",
}: InputDialogProps) {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    if (isOpen) {
      setValue(defaultValue);
    }
  }, [isOpen, defaultValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onConfirm(value);
    setValue("");
    onClose();
  };

  const handleDialogChange = (open: boolean) => {
    if (!open) {
      setValue("");
      onClose();
    }
  };

  // Prevent event bubbling
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogChange}>
      <DialogContent onClick={handleClick}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            autoFocus
          />
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
            >
              Abbrechen
            </Button>
            <Button type="submit">Bestätigen</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
