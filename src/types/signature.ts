export type Template = "modern" | "classic" | "minimal";

export interface SignatureData {
  name: string;
  position: string;
  company: string;
  email: string;
  phone: string;
  website: string;
  linkedin: string;
  instagram: string;
  tiktok: string;
  youtube: string;
  logoUrl: string | null;
}