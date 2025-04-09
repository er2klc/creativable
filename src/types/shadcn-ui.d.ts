
import { ReactNode } from 'react';

// Declare module augmentation for shadcn UI components
declare module '@/components/ui/tabs' {
  export interface TabsProps {
    children?: ReactNode;
  }
  export interface TabsListProps {
    children?: ReactNode;
  }
  export interface TabsTriggerProps {
    children?: ReactNode;
  }
  export interface TabsContentProps {
    children?: ReactNode;
  }
}

declare module '@/components/ui/select' {
  export interface SelectTriggerProps {
    children?: ReactNode;
  }
  export interface SelectContentProps {
    children?: ReactNode;
  }
  export interface SelectItemProps {
    children?: ReactNode;
  }
  export interface SelectValueProps {
    children?: ReactNode;
  }
}

declare module '@/components/ui/dialog' {
  export interface DialogContentProps {
    children?: ReactNode;
  }
  export interface DialogTitleProps {
    children?: ReactNode;
  }
  export interface DialogDescriptionProps {
    children?: ReactNode;
  }
  export interface DialogTriggerProps {
    children?: ReactNode;
  }
}

declare module '@/components/ui/alert-dialog' {
  export interface AlertDialogContentProps {
    children?: ReactNode;
  }
  export interface AlertDialogTitleProps {
    children?: ReactNode;
  }
  export interface AlertDialogDescriptionProps {
    children?: ReactNode;
  }
  export interface AlertDialogCancelProps {
    children?: ReactNode;
  }
  export interface AlertDialogActionProps {
    children?: ReactNode;
  }
}

declare module '@/components/ui/avatar' {
  export interface AvatarProps {
    children?: ReactNode;
  }
  export interface AvatarImageProps {
    src?: string;
    alt?: string;
  }
  export interface AvatarFallbackProps {
    children?: ReactNode;
  }
}

declare module '@/components/ui/dropdown-menu' {
  export interface DropdownMenuTriggerProps {
    children?: ReactNode;
  }
  export interface DropdownMenuItemProps {
    children?: ReactNode;
  }
}

declare module '@/components/ui/label' {
  export interface LabelProps {
    children?: ReactNode;
  }
}

declare module '@/components/ui/popover' {
  export interface PopoverTriggerProps {
    children?: ReactNode;
  }
}

declare module '@/components/ui/sheet' {
  export interface SheetContentProps {
    children?: ReactNode;
  }
}

declare module '@/components/ui/scroll-area' {
  export interface ScrollAreaProps {
    children?: ReactNode;
  }
}

declare module '@/components/ui/tooltip' {
  export interface TooltipTriggerProps {
    children?: ReactNode;
  }
}

declare module '@/components/ui/progress' {
  export interface ProgressProps {
    className?: string;
  }
}
