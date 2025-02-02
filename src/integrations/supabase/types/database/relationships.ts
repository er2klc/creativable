import type { Lead, Message, Task, Note, LeadFile, Profile, SocialMediaPost, Team, TeamMember, TeamPost, TeamEvent, TeamPostComment } from './entities';

export interface LeadWithRelations extends Omit<Lead, 'social_media_posts'> {
  messages: Message[];
  tasks: Task[];
  notes: Note[];
  lead_files: LeadFile[];
  linkedin_posts?: any[];
  social_media_posts?: SocialMediaPost[];
}

export interface TeamWithRelations extends Team {
  members: TeamMember[];
  posts: TeamPost[];
  events: TeamEvent[];
}

export interface ProfileWithRelations extends Profile {
  teams: Team[];
  leads: Lead[];
  tasks: Task[];
  messages: Message[];
}

export interface MessageWithRelations extends Message {
  lead: Lead;
  sender: Profile;
}

export interface TaskWithRelations extends Task {
  lead: Lead;
  assignee: Profile;
}

export interface NoteWithRelations extends Note {
  lead: Lead;
  author: Profile;
}

export interface TeamMemberWithRelations extends TeamMember {
  team: Team;
  user: Profile;
}

export interface TeamPostWithRelations extends TeamPost {
  team: Team;
  author: Profile;
  comments: TeamPostComment[];
}

export interface TeamEventWithRelations extends TeamEvent {
  team: Team;
  creator: Profile;
  attendees: Profile[];
}