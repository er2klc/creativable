import { Tables } from './tables';
import { Team, TeamInsert, TeamUpdate, TeamMember, TeamMemberInsert, TeamMemberUpdate, TeamInvite, TeamInviteInsert, TeamInviteUpdate } from './teams';

export interface Database {
  public: {
    Tables: {
      teams: {
        Row: Team;
        Insert: TeamInsert;
        Update: TeamUpdate;
        Relationships: [];
      };
      team_members: {
        Row: TeamMember;
        Insert: TeamMemberInsert;
        Update: TeamMemberUpdate;
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey";
            columns: ["team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          }
        ];
      };
      team_invites: {
        Row: TeamInvite;
        Insert: TeamInviteInsert;
        Update: TeamInviteUpdate;
        Relationships: [
          {
            foreignKeyName: "team_invites_team_id_fkey";
            columns: ["team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          }
        ];
      };
    } & Tables;
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export type PublicSchema = Database['public'];