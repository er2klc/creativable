import { useState } from "react";

export const useSidebarState = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return {
    isExpanded,
    setIsExpanded,
    handlers: {
      onMouseEnter: () => setIsExpanded(true),
      onMouseLeave: () => setIsExpanded(false)
    }
  };
};