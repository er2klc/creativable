
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { ImapFlow } from "https://esm.sh/imapflow@1.0.126";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { simpleParser } from "https://esm.sh/mailparser@3.6.5";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SyncOptions {
  user_id: string;
  max_emails?: number;
  folder?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get parameters
    const { user_id, max_emails = 20, folder = 'INBOX' } = await req.json() as SyncOptions;

    if (!user_id) {
      return new Response(
        JSON.stringify({ error: "User ID is required" }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Get IMAP settings
    const { data: imapSettings, error: settingsError } = await supabase
      .from('imap_settings')
      .select('*')
      .eq('user_id', user_id)
      .single();
    
    if (settingsError || !imapSettings) {
      return new Response(
        JSON.stringify({ 
          error: "IMAP settings not found", 
          details: "Please configure your IMAP settings first" 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Check when we last synced
    const { data: lastSync } = await supabase
      .from('email_sync_status')
      .select('last_sync_time')
      .eq('user_id', user_id)
      .eq('folder', folder)
      .single();
    
    const lastSyncTime = lastSync?.last_sync_time
      ? new Date(lastSync.last_sync_time)
      : new Date(0); // Beginning of time if never synced
    
    console.log(`Last sync for ${folder}: ${lastSyncTime.toISOString()}`);

    // Connect to IMAP server
    const client = new ImapFlow({
      host: imapSettings.host,
      port: imapSettings.port,
      secure: imapSettings.secure,
      auth: {
        user: imapSettings.username,
        pass: imapSettings.password
      },
      logger: false
    });

    await client.connect();
    
    // Open requested mailbox
    const mailbox = await client.mailboxOpen(folder);
    console.log(`${folder} has ${mailbox.exists} messages`);
    
    // Search for messages newer than last sync
    const messages = await client.search({
      since: lastSyncTime
    }, { limit: max_emails });
    
    console.log(`Found ${messages.length} new messages since ${lastSyncTime}`);
    
    const newEmails = [];

    // Process each message
    for (const message of messages) {
      // Fetch message details
      const fetch = await client.fetchOne(message.uid, { source: true });
      if (!fetch || !fetch.source) continue;
      
      // Parse email
      const parsed = await simpleParser(fetch.source);
      
      // Extract attachments info
      const attachments = parsed.attachments.map(att => ({
        filename: att.filename,
        contentType: att.contentType,
        size: att.size,
        contentId: att.contentId
      }));
      
      // Save the email to the database
      const { data: email, error: emailError } = await supabase
        .from('received_emails')
        .insert({
          user_id: user_id,
          message_id: parsed.messageId,
          from_email: parsed.from?.text || '',
          to_email: parsed.to?.text || '',
          cc_email: parsed.cc?.text || '',
          subject: parsed.subject || '(No Subject)',
          text_content: parsed.text || '',
          html_content: parsed.html || null,
          received_at: parsed.date || new Date(),
          imap_uid: message.uid,
          folder: folder,
          has_attachments: attachments.length > 0,
          attachments_info: attachments.length > 0 ? attachments : null,
          headers: parsed.headerLines.map(h => `${h.key}: ${h.line}`).join('\n'),
          flags: fetch.flags || []
        })
        .select()
        .single();
      
      if (emailError) {
        console.error("Error saving email:", emailError);
        continue;
      }
      
      newEmails.push(email);
    }
    
    // Update last sync time
    const now = new Date();
    await supabase
      .from('email_sync_status')
      .upsert({
        user_id: user_id,
        folder: folder,
        last_sync_time: now.toISOString(),
        items_synced: messages.length
      }, {
        onConflict: 'user_id,folder'
      });
    
    // Close connection
    await client.logout();

    return new Response(
      JSON.stringify({ 
        success: true, 
        emails_synced: messages.length,
        new_emails: newEmails.length,
        folder: folder
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );
  } catch (error) {
    console.error("Error syncing emails:", error);
    return new Response(
      JSON.stringify({ error: "Failed to sync emails", details: error.message }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );
  }
});
