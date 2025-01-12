export interface ChangelogItem {
  title: string;
  status: "completed" | "planned" | "in-progress";
  description: string;
}

export interface ChangelogEntry {
  version: string;
  date: string;
  changes: ChangelogItem[];
}