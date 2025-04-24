import { supabase } from "@/integrations/supabase/client";

export type ContentType = 'personal' | 'team' | 'platform' | 'lead' | 'document' | 'settings';

export interface ProcessingOptions {
  sourceType?: string;
  sourceId?: string;
  metadata?: Record<string, any>;
  teamId?: string;
}

export const processContentForEmbeddings = async (
  content: string,
  contentType: ContentType,
  options: ProcessingOptions = {}
) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase.functions.invoke('process-context-embeddings', {
      body: {
        userId: user.id,
        contentType,
        content,
        metadata: options.metadata || {},
        sourceType: options.sourceType,
        sourceId: options.sourceId
      }
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error processing content for embeddings:', error);
    throw error;
  }
};

export const searchSimilarContent = async (query: string, contentType: ContentType, teamId?: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const embedding = await createEmbedding(query);

    const { data, error } = await supabase.rpc('match_combined_content', {
      query_embedding: embedding,
      match_threshold: 0.7,
      match_count: 5,
      p_user_id: user.id,
      p_team_id: teamId || ''
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error searching similar content:', error);
    throw error;
  }
};

/**
 * Erstellt einen Embedding für einen Textinhalt und gibt diesen zurück
 */
export const createEmbedding = async (text: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "text-embedding-3-small",
        input: text
      })
    });

    const result = await response.json();
    if (!result.data || !result.data[0].embedding) {
      throw new Error('Failed to generate embedding');
    }

    return result.data[0].embedding;
  } catch (error) {
    console.error('Error creating embedding:', error);
    throw error;
  }
};

/**
 * Durchsucht Benutzerinhalte mit einer textbasierten Abfrage
 */
export const searchUserContent = async (query: string, contentType?: ContentType) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const embedding = await createEmbedding(query);
    
    const { data, error } = await supabase.rpc('match_user_embeddings', {
      p_user_id: user.id,
      query_embedding: embedding,
      similarity_threshold: 0.7,
      match_count: 5,
      p_content_type: contentType
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error searching user content:', error);
    throw error;
  }
};

/**
 * Verarbeitet alle Benutzerdaten aus der Datenbank und wandelt sie in Embeddings um.
 * Diese Funktion holt verschiedene Arten von Benutzerdaten und übergibt sie an den Embedding-Prozess.
 */
export const processUserDataForEmbeddings = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");
    
    // Benutzereinstellungen abrufen
    const { data: settings } = await supabase
      .from('settings')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (settings) {
      const settingsContent = `
        Unternehmen: ${settings.company_name || 'Nicht angegeben'}
        Produkte/Dienstleistungen: ${settings.products_services || 'Nicht angegeben'}
        Zielgruppe: ${settings.target_audience || 'Nicht angegeben'}
        Unternehmensbeschreibung: ${settings.business_description || 'Nicht angegeben'}
      `.trim();
      
      await processContentForEmbeddings(settingsContent, 'personal', {
        sourceType: 'settings',
        sourceId: settings.id,
        metadata: { type: 'user_settings' }
      });
    }
    
    // Aufgaben abrufen
    const { data: tasks } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id);
    
    if (tasks && tasks.length > 0) {
      for (const task of tasks) {
        const taskContent = `
          Aufgabe: ${task.title}
          Fälligkeitsdatum: ${task.due_date || 'Kein Fälligkeitsdatum'}
          Status: ${task.completed ? 'Abgeschlossen' : 'Ausstehend'}
        `.trim();
        
        await processContentForEmbeddings(taskContent, 'personal', {
          sourceType: 'task',
          sourceId: task.id,
          metadata: { type: 'user_task' }
        });
      }
    }
    
    // Leads abrufen
    const { data: leads } = await supabase
      .from('leads')
      .select('*')
      .eq('user_id', user.id);
    
    if (leads && leads.length > 0) {
      for (const lead of leads) {
        let leadContent = `
          Lead: ${lead.name}
          Unternehmen: ${lead.company_name || 'Nicht angegeben'}
          Branche: ${lead.industry || 'Nicht angegeben'}
          Status: ${lead.status || 'Nicht angegeben'}
        `.trim();
        
        await processContentForEmbeddings(leadContent, 'personal', {
          sourceType: 'lead',
          sourceId: lead.id,
          metadata: { type: 'user_lead' }
        });
      }
    }
    
    // Weitere Benutzerdaten wie Emails, Notizen, etc. könnten hier verarbeitet werden
    
    return { success: true, message: "Alle Benutzerdaten wurden erfolgreich für KI-Embeddings verarbeitet" };
  } catch (error) {
    console.error('Fehler bei der Verarbeitung von Benutzerdaten für Embeddings:', error);
    throw error;
  }
};

/**
 * Verarbeitet alle Teamdaten und wandelt sie in Embeddings um.
 * Diese werden einmal erstellt und von allen Teammitgliedern geteilt.
 */
export const processTeamDataForEmbeddings = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");
    
    // Zuerst alle Teams des Benutzers abrufen
    const { data: userTeams } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('user_id', user.id);
    
    if (!userTeams || userTeams.length === 0) {
      return { success: true, message: "Keine Teams gefunden" };
    }
    
    const teamIds = userTeams.map(team => team.team_id);
    
    // Teamdaten für jedes Team abrufen und verarbeiten
    for (const teamId of teamIds) {
      // Teamdetails abrufen
      const { data: teamData } = await supabase
        .from('teams')
        .select('*')
        .eq('id', teamId)
        .single();
      
      if (teamData) {
        // Team-Grundinformationen
        const teamBasicContent = `
          Team: ${teamData.name}
          Beschreibung: ${teamData.description || 'Keine Beschreibung'}
        `.trim();
        
        await processContentForEmbeddings(teamBasicContent, 'team', {
          sourceType: 'team_info',
          sourceId: teamData.id,
          metadata: { type: 'team_basic' },
          teamId: teamData.id
        });
        
        // Team-Posts abrufen
        const { data: teamPosts } = await supabase
          .from('team_posts')
          .select('*')
          .eq('team_id', teamId);
        
        if (teamPosts && teamPosts.length > 0) {
          for (const post of teamPosts) {
            await processContentForEmbeddings(post.content, 'team', {
              sourceType: 'team_post',
              sourceId: post.id,
              metadata: { 
                type: 'team_post',
                title: post.title,
                created_at: post.created_at
              },
              teamId: teamData.id
            });
          }
        }
        
        // Team-Mitglieder abrufen und verarbeiten
        const { data: teamMembers } = await supabase
          .from('team_members')
          .select('*, profiles(id, display_name, avatar_url)')
          .eq('team_id', teamId);
          
        if (teamMembers && teamMembers.length > 0) {
          const teamMembersContent = `
            Team Mitglieder in ${teamData.name}:
            ${teamMembers.map(member => 
              `- ${member.profiles?.display_name || 'Unbekannt'}`
            ).join('\n')}
          `.trim();
          
          await processContentForEmbeddings(teamMembersContent, 'team', {
            sourceType: 'team_members',
            sourceId: teamData.id,
            metadata: { type: 'team_members' },
            teamId: teamData.id
          });
        }
        
        // Weitere Team-bezogene Daten wie Ereignisse, Dokumente usw. könnten hier verarbeitet werden
      }
    }
    
    return { success: true, message: "Alle Teamdaten wurden erfolgreich für KI-Embeddings verarbeitet" };
  } catch (error) {
    console.error('Fehler bei der Verarbeitung von Teamdaten für Embeddings:', error);
    throw error;
  }
};
