export interface ChangelogItem {
  title: string;
  status: "completed" | "planned" | "in-progress";
  description: string;
}