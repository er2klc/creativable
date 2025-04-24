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
    
    // Benutzerprofil verarbeiten
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
      
    if (profile) {
      const profileContent = `
        Mein Profil:
        Name: ${profile.display_name || 'Nicht angegeben'}
        E-Mail: ${user.email}
        Status: ${profile.status || 'Nicht angegeben'}
        Bio: ${profile.bio || 'Nicht angegeben'}
        Standort: ${profile.location || 'Nicht angegeben'}
      `.trim();
      
      await processContentForEmbeddings(profileContent, 'personal', {
        sourceType: 'profile',
        sourceId: profile.id,
        metadata: { type: 'user_profile' }
      });
    }
    
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
      // Gesamtübersicht aller Aufgaben
      const tasksOverview = `
        Meine Aufgaben:
        ${tasks.map(task => 
          `- ${task.title} (${task.completed ? 'Abgeschlossen' : 'Ausstehend'}, Fällig: ${task.due_date || 'Kein Datum'})`
        ).join('\n')}
      `.trim();
      
      await processContentForEmbeddings(tasksOverview, 'personal', {
        sourceType: 'tasks_overview',
        sourceId: 'all_tasks',
        metadata: { type: 'tasks_list' }
      });
      
      // Einzelne Aufgaben verarbeiten
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
    
    // Leads/Kontakte abrufen
    const { data: leads } = await supabase
      .from('leads')
      .select('*')
      .eq('user_id', user.id);
    
    if (leads && leads.length > 0) {
      // Gesamtübersicht aller Kontakte
      const contactsOverview = `
        Meine Kontakte:
        ${leads.map(contact => 
          `- ${contact.name} (${contact.company_name || 'Keine Firma'}, ${contact.platform || 'Keine Plattform'})`
        ).join('\n')}
      `.trim();
      
      await processContentForEmbeddings(contactsOverview, 'personal', {
        sourceType: 'contacts_overview',
        sourceId: 'all_contacts',
        metadata: { type: 'contacts_list' }
      });
      
      // Verarbeite jeden Kontakt einzeln
      for (const lead of leads) {
        let leadContent = `
          Kontakt/Lead: ${lead.name}
          Unternehmen: ${lead.company_name || 'Nicht angegeben'}
          Branche: ${lead.industry || 'Nicht angegeben'}
          Status: ${lead.status || 'Nicht angegeben'}
          E-Mail: ${lead.email || 'Nicht angegeben'}
          Telefon: ${lead.phone_number || 'Nicht angegeben'}
          Plattform: ${lead.platform || 'Nicht angegeben'}
          Social Media: ${lead.social_media_username || 'Nicht angegeben'}
          Letzter Kontakt: ${lead.last_interaction_date || 'Nicht bekannt'}
        `.trim();
        
        await processContentForEmbeddings(leadContent, 'personal', {
          sourceType: 'lead',
          sourceId: lead.id,
          metadata: { type: 'contact_details' }
        });
      }
    }
    
    // E-Mails verarbeiten, falls vorhanden
    const { data: emails } = await supabase
      .from('emails')
      .select('*')
      .eq('user_id', user.id)
      .order('received_at', { ascending: false })
      .limit(100); // Begrenzen auf die letzten 100 E-Mails
    
    if (emails && emails.length > 0) {
      // Gesamtübersicht der neuesten E-Mails
      const emailsOverview = `
        Meine letzten E-Mails:
        ${emails.slice(0, 20).map(email => 
          `- Von: ${email.from_name || email.from_email}, Betreff: ${email.subject}, Datum: ${email.received_at}`
        ).join('\n')}
      `.trim();
      
      await processContentForEmbeddings(emailsOverview, 'personal', {
        sourceType: 'emails_overview',
        sourceId: 'recent_emails',
        metadata: { type: 'emails_list' }
      });
      
      // Verarbeite jede E-Mail einzeln
      for (const email of emails) {
        const emailContent = `
          E-Mail:
          Von: ${email.from_name || email.from_email}
          An: ${email.to_email || ''}
          Betreff: ${email.subject}
          Datum: ${email.received_at}
          
          Inhalt:
          ${email.body || 'Kein Inhalt verfügbar'}
        `.trim();
        
        await processContentForEmbeddings(emailContent, 'personal', {
          sourceType: 'email',
          sourceId: email.id,
          metadata: { 
            type: 'email_content',
            sender: email.from_name || email.from_email,
            subject: email.subject,
            date: email.received_at
          }
        });
      }
    }
    
    // Notizen verarbeiten, falls vorhanden
    const { data: notes } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', user.id);
    
    if (notes && notes.length > 0) {
      // Gesamtübersicht aller Notizen
      const notesOverview = `
        Meine Notizen:
        ${notes.map(note => 
          `- Notiz vom ${note.created_at}`
        ).join('\n')}
      `.trim();
      
      await processContentForEmbeddings(notesOverview, 'personal', {
        sourceType: 'notes_overview',
        sourceId: 'all_notes',
        metadata: { type: 'notes_list' }
      });
      
      // Verarbeite jede Notiz einzeln
      for (const note of notes) {
        const noteContent = `
          Notiz vom: ${note.created_at}
          
          ${note.content}
        `.trim();
        
        await processContentForEmbeddings(noteContent, 'personal', {
          sourceType: 'note',
          sourceId: note.id,
          metadata: { type: 'note_content' }
        });
      }
    }
    
    // Pipeline-Phasen verarbeiten, falls vorhanden
    const { data: phases } = await supabase
      .from('pipeline_phases')
      .select('*')
      .eq('user_id', user.id);
    
    if (phases && phases.length > 0) {
      const phasesContent = `
        Meine Pipeline-Phasen:
        ${phases.map(phase => 
          `- ${phase.name} (Reihenfolge: ${phase.order_index || 'Nicht definiert'})`
        ).join('\n')}
      `.trim();
      
      await processContentForEmbeddings(phasesContent, 'personal', {
        sourceType: 'phases',
        sourceId: 'all_phases',
        metadata: { type: 'pipeline_phases' }
      });
    }
    
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
