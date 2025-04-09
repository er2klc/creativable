
// Global type definitions to fix various TypeScript errors

// Allow synthetic default imports for React
declare module 'react' {
  import * as React from 'react';
  export = React;
  export as namespace React;
}

// Define Lucide icon types
declare module 'lucide-react' {
  import React from 'react';
  
  export type Icon = React.ComponentType<React.SVGProps<SVGSVGElement>>;
  
  // Define all the missing icons
  export const LayoutDashboard: Icon;
  export const Database: Icon;
  export const Building2: Icon;
  export const GraduationCap: Icon;
  export const Bot: Icon;
  export const CheckCircle2: Icon;
  export const XCircle: Icon;
  export const Clipboard: Icon;
  export const RotateCw: Icon;
  export const Video: Icon;
  export const MapPin: Icon;
  export const BarChart: Icon;
  export const Crown: Icon;
  export const Rocket: Icon;
  export const FileText: Icon;
  export const Flame: Icon;
  export const CalendarIcon: Icon;
  export const CheckSquare: Icon;
  export const Star: Icon;
  export const StarIcon: Icon;
  export const AlertTriangle: Icon;
  export const Instagram: Icon;
  export const Linkedin: Icon;
  export const Facebook: Icon;
  export const Briefcase: Icon;
  export const CreditCard: Icon;
  export const Receipt: Icon;
  export const LucideIcon: Icon;
  export const LayoutGrid: Icon;
  export const Shield: Icon;
  export const Globe2: Icon;
  export const Wrench: Icon;
  export const Waves: Icon;
  export const Infinity: Icon;
  export const GitBranch: Icon;
  export const Trash2: Icon;
  export const CheckCircle: Icon;
  export const RotateCcw: Icon;
  export const SaveIcon: Icon;
  export const PenIcon: Icon;
  export const ClipboardList: Icon;
  export const UserCircle: Icon;
  export const CircleUser: Icon;
  export const StickyNote: Icon;
  export const Languages: Icon;
  export const AtSign: Icon;
  export const Globe: Icon;
  export const Hash: Icon;
  export const Share2: Icon;
  export const FileSpreadsheet: Icon;
  export const XCircleSquare: Icon;
  export const Youtube: Icon;
  export const Play: Icon;
  export const Presentation: Icon;
  export const UserCheck: Icon;
  export const CalendarCheck: Icon;
  export const Building: Icon;
  export const Folder: Icon;
  export const Trophy: Icon;
  export const LogIn: Icon;
  export const File: Icon;
  export const Image: Icon;
  export const Files: Icon;
  export const Server: Icon;
  export const Package: Icon;
  export const Users2: Icon;
  export const Sparkles: Icon;
  export const CheckCircleIcon: Icon;
  export const ServerIcon: Icon;
  export const MailX: Icon;
  export const GripVertical: Icon;
  export const Link: Icon;
  export const Heart: Icon;
  export const BellRing: Icon;
  export const SquareCheck: Icon;
  export const PenSquare: Icon;
  export const AlertTriangleIcon: Icon;
  export const Target: Icon;
  export const Brain: Icon;
  export const ArrowRightLeft: Icon;
  export const PhoneCall: Icon;
  export const Gauge: Icon;
  export const Crosshair: Icon;
  export const Award: Icon;
  export const BriefcaseIcon: Icon;
  export const TargetIcon: Icon;
  export const SparklesIcon: Icon;
  export const Mic: Icon;
  export const Activity: Icon;
  export const BookOpen: Icon;
  export const Edit2: Icon;
  export const StarOff: Icon;
}

// Define date-fns module types
declare module 'date-fns' {
  export function isToday(date: Date | number): boolean;
  export function isTomorrow(date: Date | number): boolean;
  export function isWithinInterval(date: Date | number, interval: { start: Date | number; end: Date | number }): boolean;
  export function parseISO(date: string): Date;
  export function setHours(date: Date | number, hours: number): Date;
  export function setMinutes(date: Date | number, minutes: number): Date;
  export function eachDayOfInterval(interval: { start: Date | number; end: Date | number }): Date[];
  export function startOfWeek(date: Date | number, options?: { weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6 }): Date;
  export function isValid(date: any): boolean;
  export function differenceInDays(dateLeft: Date | number, dateRight: Date | number): number;
  export function differenceInHours(dateLeft: Date | number, dateRight: Date | number): number;
  export function isSameHour(dateLeft: Date | number, dateRight: Date | number): boolean;
  export function addHours(date: Date | number, amount: number): Date;
}

// Define date-fns/locale module
declare module 'date-fns/locale' {
  import { Locale } from 'date-fns';
  export const enUS: Locale;
}

// Define ScrollArea component
declare module '@/components/ui/scroll-area' {
  import { ComponentProps } from 'react';
  
  export interface ScrollAreaProps extends ComponentProps<'div'> {
    orientation?: 'vertical' | 'horizontal';
  }
  
  export function ScrollArea(props: ScrollAreaProps): JSX.Element;
  export function ScrollBar(props: ComponentProps<'div'>): JSX.Element;
}
