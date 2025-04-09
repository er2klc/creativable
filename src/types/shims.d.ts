
// This file adds type declarations for modules that don't have TypeScript definitions

declare module 'ai/react' {
  import { ReactNode } from 'react';
  
  export interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
  }

  export interface UseChatOptions {
    api: string;
    id?: string;
    initialMessages?: Message[];
    headers?: Record<string, string>;
    body?: object;
    onResponse?: (response: Response) => void;
    onFinish?: (message: Message) => void;
    onError?: (error: Error) => void;
  }

  export interface UseChatHelpers {
    messages: Message[];
    input: string;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => void;
    handleSubmit: (e: React.FormEvent<HTMLFormElement>, chatRequestOptions?: { options?: UseChatOptions }) => void;
    setMessages: (messages: Message[]) => void;
    setInput: (input: string) => void;
    isLoading: boolean;
  }

  export function useChat(options?: UseChatOptions): UseChatHelpers;
}

declare module 'date-fns/locale' {
  const de: Locale;
  export { de };
}

declare module 'date-fns' {
  export function format(date: Date | number, format: string, options?: { locale?: Locale }): string;
  export function formatRelative(date: Date | number, baseDate: Date | number, options?: { locale?: Locale }): string;
  export function formatDistance(date: Date | number, baseDate: Date | number, options?: { addSuffix?: boolean, locale?: Locale }): string;
  export function formatDistanceToNow(date: Date | number, options?: { addSuffix?: boolean, locale?: Locale }): string;
  export function addDays(date: Date | number, amount: number): Date;
  export function addMonths(date: Date | number, amount: number): Date;
  export function addWeeks(date: Date | number, amount: number): Date;
  export function addYears(date: Date | number, amount: number): Date;
  export function subDays(date: Date | number, amount: number): Date;
  export function subMonths(date: Date | number, amount: number): Date;
  export function subWeeks(date: Date | number, amount: number): Date;
  export function subYears(date: Date | number, amount: number): Date;
  export function isEqual(dateLeft: Date | number, dateRight: Date | number): boolean;
  export function isSameDay(dateLeft: Date | number, dateRight: Date | number): boolean;
  export function isSameMonth(dateLeft: Date | number, dateRight: Date | number): boolean;
  export function isSameYear(dateLeft: Date | number, dateRight: Date | number): boolean;
  export function isAfter(date: Date | number, dateToCompare: Date | number): boolean;
  export function isBefore(date: Date | number, dateToCompare: Date | number): boolean;
  export function startOfDay(date: Date | number): Date;
  export function startOfWeek(date: Date | number, options?: { locale?: Locale }): Date;
  export function startOfMonth(date: Date | number): Date;
  export function startOfYear(date: Date | number): Date;
  export function endOfDay(date: Date | number): Date;
  export function endOfWeek(date: Date | number, options?: { locale?: Locale }): Date;
  export function endOfMonth(date: Date | number): Date;
  export function endOfYear(date: Date | number): Date;
}

declare module 'lucide-react' {
  import { ComponentType, SVGProps } from 'react';
  
  export type Icon = ComponentType<SVGProps<SVGSVGElement>>;
  
  export const Calendar: Icon;
  export const Search: Icon;
  export const Bell: Icon;
  export const User: Icon;
  export const Settings: Icon;
  export const LogOut: Icon;
  export const ChevronDown: Icon;
  export const ChevronUp: Icon;
  export const ChevronLeft: Icon;
  export const ChevronRight: Icon;
  export const Plus: Icon;
  export const X: Icon;
  export const Check: Icon;
  export const ExternalLink: Icon;
  export const Send: Icon;
  export const Loader2: Icon;
  export const Upload: Icon;
  export const Download: Icon;
  export const Copy: Icon;
  export const Trash: Icon;
  export const Edit: Icon;
  export const MoreVertical: Icon;
  export const MoreHorizontal: Icon;
  export const Flag: Icon;
  export const AlertCircle: Icon;
  export const Info: Icon;
  export const Link2: Icon;
  export const Pencil: Icon;
  export const MessageSquare: Icon;
  export const ArrowRight: Icon;
  export const ArrowLeft: Icon;
  export const PlusCircle: Icon;
  export const MinusCircle: Icon;
  export const RefreshCw: Icon;
  export const Home: Icon;
  export const MessageCircle: Icon;
  export const Users: Icon;
  export const Phone: Icon;
  export const Mail: Icon;
  export const Menu: Icon;
  export const PanelLeft: Icon;
  export const PanelRight: Icon;
  export const Clock: Icon;
  export const CalendarDays: Icon;
  export const UserPlus: Icon;
  export const UserMinus: Icon;
  export const Filter: Icon;
  export const SortAsc: Icon;
  export const SortDesc: Icon;
  export const List: Icon;
  export const Kanban: Icon;
  export const Eye: Icon;
  export const EyeOff: Icon;
  export const Save: Icon;
  export const SendHorizontal: Icon;
}
