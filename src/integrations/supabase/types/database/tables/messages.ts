import { Message, MessageInsert, MessageUpdate } from '../../messages';

export interface MessageTables {
  messages: {
    Row: Message;
    Insert: MessageInsert;
    Update: MessageUpdate;
    Relationships: [
      {
        foreignKeyName: "messages_lead_id_fkey";
        columns: ["lead_id"];
        isOneToOne: false;
        referencedRelation: "leads";
        referencedColumns: ["id"];
      }
    ];
  };
}