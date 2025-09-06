
export type FolderStructure = {
  name: string;
  path: string;
  specialUse?: string;
  children?: FolderStructure[];
};
