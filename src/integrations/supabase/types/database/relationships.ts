import { Lead, Team, Profile } from './entities';
import { Message } from '../messages';
import { Task } from '../tasks';
import { Note } from '../notes';
import { LeadFile } from '../files';
import { SocialMediaPost } from '../social-media';
import { TeamMember } from '../team-members';
import { TeamPost } from '../team-posts';
import { TeamEvent } from '../team-events';

export interface LeadWithRelations extends Lead {
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