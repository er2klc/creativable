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
  xing: string;
  youtube: string;
  twitter: string;
  whatsapp: string;
  logoUrl: string | null;
  themeColor: string;
  textColor: string;
  linkColor: string;
  font: string;
  fontSize: string;
}