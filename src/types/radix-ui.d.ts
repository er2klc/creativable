
import { ReactNode } from 'react';

declare module '@radix-ui/react-tabs' {
  interface TabsProps {
    children?: ReactNode;
  }
  
  interface TabsListProps {
    children?: ReactNode;
  }
  
  interface TabsTriggerProps {
    children?: ReactNode;
  }
  
  interface TabsContentProps {
    children?: ReactNode;
  }
}

declare module '@radix-ui/react-select' {
  interface SelectTriggerProps {
    children?: ReactNode;
    src?: string;
  }
  
  interface SelectContentProps {
    children?: ReactNode;
  }
  
  interface SelectItemProps {
    children?: ReactNode;
  }
}

declare module '@radix-ui/react-dialog' {
  interface DialogTriggerProps {
    children?: ReactNode;
  }
  
  interface DialogTitleProps {
    children?: ReactNode;
  }
  
  interface DialogDescriptionProps {
    children?: ReactNode;
  }
}

declare module '@radix-ui/react-dropdown-menu' {
  interface DropdownMenuTriggerProps {
    children?: ReactNode;
  }
  
  interface DropdownMenuItemProps {
    children?: ReactNode;
  }
}

declare module '@radix-ui/react-avatar' {
  interface AvatarProps {
    children?: ReactNode;
  }
  
  interface AvatarImageProps {
    src?: string;
    alt?: string;
  }
  
  interface AvatarFallbackProps {
    children?: ReactNode;
  }
}

declare module '@radix-ui/react-label' {
  interface LabelProps {
    children?: ReactNode;
  }
}

declare module '@radix-ui/react-popover' {
  interface PopoverTriggerProps {
    children?: ReactNode;
  }
}

declare module '@radix-ui/react-scroll-area' {
  interface ScrollAreaProps {
    children?: ReactNode;
  }
}

declare module '@radix-ui/react-alert-dialog' {
  interface AlertDialogTitleProps {
    children?: ReactNode;
  }
  
  interface AlertDialogDescriptionProps {
    children?: ReactNode;
  }
  
  interface AlertDialogCancelProps {
    children?: ReactNode;
  }
  
  interface AlertDialogActionProps {
    children?: ReactNode;
  }
}

declare module '@radix-ui/react-tooltip' {
  interface TooltipTriggerProps {
    children?: ReactNode;
  }
}

// Fix the missing className property in the Progress component
declare module '@/components/ui/progress' {
  interface ProgressProps {
    className?: string;
    value: number;
    indicatorClassName?: string;
  }
}
