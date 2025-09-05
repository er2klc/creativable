// Simple placeholder for shortcuts hook
export interface Shortcut {
  id: string;
  title: string;
  url: string;
  type: string;
  order_index: number;
}

export function useShortcuts() {
  return {
    shortcuts: [] as Shortcut[],
    isLoading: false,
    createShortcut: async () => {},
    updateShortcut: async () => {},
    deleteShortcut: async () => {},
  };
}
