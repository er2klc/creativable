import { Json } from './entities/base/json';
import {
  Lead,
  Profile,
  SocialMediaPost,
  Team,
  TeamMember,
  TreeProfile
} from './entities';

export interface LeadWithRelations extends Lead {
  messages: any[];
  tasks: any[];
  notes: any[];
  lead_files: any[];
  linkedin_posts?: any[];
  social_media_posts?: SocialMediaPost[];
}

export interface TeamWithRelations extends Team {
  members: TeamMember[];
  posts: any[];
  events: any[];
}

export interface ProfileWithRelations extends Profile {
  teams: Team[];
  leads: Lead[];
  tasks: any[];
  messages: any[];
}