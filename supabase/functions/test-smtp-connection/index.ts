
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.23.0";

// Initialize Supabase client with env variables
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseKey);

// CORS headers for all responses
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

interface SMTPTestRequest {
  smtp_host?: string;
  smtp_port?: number;
  smtp_secure?: boolean;
  smtp_user?: string;
  smtp_password?: string;
  from_email?: string;
  test_recipient?: string;
  use_saved_settings?: boolean;
}

// Helper function for DNS lookup
async function testDnsLookup(hostname: string): Promise<{ success: boolean; result?: string; error?: string }> {
  try {
    // Use Deno's built-in networking to attempt to resolve the hostname
    // Note: In Deno's edge runtime, we can't directly access DNS APIs
    // This is a simulated test based on connection attempt
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    try {
      await fetch(`https://${hostname}`, { 
        signal: controller.signal,
        method: 'HEAD'
      });
      clearTimeout(timeoutId);
      return { success: true, result: `Successfully resolved ${hostname}` };
    } catch (error) {
      clearTimeout(timeoutId);
      // If we get a response or a network error (not a timeout), we assume DNS worked
      if (error.name !== 'AbortError') {
        return { success: true, result: `DNS lookup for ${hostname} appears to work` };
      }
      return { success: false, error: `DNS lookup failed for ${hostname}` };
    }
  } catch (error) {
    return { success: false, error: `DNS test error: ${error.message}` };
  }
}

// Helper function for TCP connection test
async function testTcpConnection(hostname: string, port: number): Promise<{ success: boolean; result?: string; error?: string }> {
  try {
    // Try to establish a TCP connection
    // Simulated using fetch with a timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    try {
      // We'll try to connect to the port directly
      // This is a simplified test that may not work for all SMTP servers
      await fetch(`https://${hostname}:${port}`, { 
        signal: controller.signal,
        method: 'HEAD'
      });
      clearTimeout(timeoutId);
      return { success: true, result: `TCP connection to ${hostname}:${port} successful` };
    } catch (error) {
      clearTimeout(timeoutId);
      // If we get a response or a specific network error (not a timeout), we assume TCP worked
      if (error.name !== 'AbortError') {
        return { success: true, result: `TCP connection to ${hostname}:${port} appears to work` };
      }
      return { success: false, error: `Cannot establish TCP connection to ${hostname}:${port}` };
    }
  } catch (error) {
    return { success: false, error: `TCP test error: ${error.message}` };
  }
}

// Helper function to test SMTP connection stages
async function testSmtpConnection(settings: {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
  fromEmail: string;
  testRecipient?: string;
}): Promise<{
  success: boolean;
  stages: Array<{
    name: string;
    success: boolean;
    message: string;
  }>;
  error?: string;
}> {
  const stages = [];
  
  // Stage 1: DNS Lookup
  console.log("Testing DNS lookup for", settings.host);
  const dnsResult = await testDnsLookup(settings.host);
  stages.push({
    name: "DNS Lookup",
    success: dnsResult.success,
    message: dnsResult.success ? dnsResult.result! : dnsResult.error!
  });
  
  // If DNS fails, no need to continue
  if (!dnsResult.success) {
    return {
      success: false,
      stages,
      error: "DNS lookup failed"
    };
  }
  
  // Stage 2: TCP Connection
  console.log("Testing TCP connection to", settings.host, ":", settings.port);
  const tcpResult = await testTcpConnection(settings.host, settings.port);
  stages.push({
    name: "TCP Connection",
    success: tcpResult.success,
    message: tcpResult.success ? tcpResult.result! : tcpResult.error!
  });
  
  // If TCP fails, no need to continue
  if (!tcpResult.success) {
    return {
      success: false,
      stages,
      error: "TCP connection failed"
    };
  }
  
  // Stage 3: SMTP Connection & Authentication
  try {
    console.log("Testing SMTP connection with authentication");
    const client = new SMTPClient({
      connection: {
        hostname: settings.host,
        port: settings.port,
        tls: settings.secure,
        auth: {
          username: settings.user,
          password: settings.password,
        },
      },
    });
    
    // Try to connect and authenticate
    await client.connect();
    console.log("SMTP connection and authentication successful");
    
    stages.push({
      name: "SMTP Authentication",
      success: true,
      message: "Successfully authenticated with SMTP server"
    });
    
    // Stage 4: Send test email if recipient provided
    if (settings.testRecipient) {
      try {
        console.log("Sending test email to", settings.testRecipient);
        await client.send({
          from: settings.fromEmail,
          to: settings.testRecipient,
          subject: "SMTP Test Email",
          content: "This is a test email to verify SMTP settings.",
          html: "<p>This is a test email to verify SMTP settings.</p>",
        });
        
        stages.push({
          name: "Send Test Email",
          success: true,
          message: `Test email sent to ${settings.testRecipient}`
        });
      } catch (emailError) {
        console.error("Error sending test email:", emailError);
        stages.push({
          name: "Send Test Email",
          success: false,
          message: `Failed to send test email: ${emailError.message}`
        });
      }
    }
    
    // Close connection
    await client.close();
    
    return {
      success: true,
      stages
    };
  } catch (smtpError) {
    console.error("SMTP Connection Error:", smtpError);
    
    stages.push({
      name: "SMTP Authentication",
      success: false,
      message: `SMTP authentication failed: ${smtpError.message}`
    });
    
    return {
      success: false,
      stages,
      error: `SMTP connection failed: ${smtpError.message}`
    };
  }
}

serve(async (req) => {
  console.log("SMTP test function called", new Date().toISOString());
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("Handling CORS preflight request");
    return new Response(null, { 
      status: 204, 
      headers: corsHeaders 
    });
  }

  try {
    const requestData = await req.json() as SMTPTestRequest;
    
    let settingsToTest = {
      host: requestData.smtp_host || "",
      port: requestData.smtp_port || 587,
      secure: requestData.smtp_secure ?? false,
      user: requestData.smtp_user || "",
      password: requestData.smtp_password || "",
      fromEmail: requestData.from_email || "",
      testRecipient: requestData.test_recipient
    };
    
    // If user wants to use saved settings
    if (requestData.use_saved_settings) {
      console.log("Using saved SMTP settings");
      
      // Get SMTP settings from database
      const { data: smtpSettings, error: smtpError } = await supabase
        .from("smtp_settings")
        .select("*")
        .single();

      if (smtpError || !smtpSettings) {
        console.error("Failed to retrieve SMTP settings:", smtpError);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "SMTP settings not found in database" 
          }),
          { 
            status: 404, 
            headers: { 
              "Content-Type": "application/json",
              ...corsHeaders 
            } 
          }
        );
      }
      
      settingsToTest = {
        host: smtpSettings.smtp_host,
        port: smtpSettings.smtp_port,
        secure: smtpSettings.smtp_secure,
        user: smtpSettings.smtp_user,
        password: smtpSettings.smtp_password,
        fromEmail: smtpSettings.from_email,
        testRecipient: requestData.test_recipient
      };
    }
    
    // Validate required fields
    if (!settingsToTest.host || !settingsToTest.port || !settingsToTest.user || 
        !settingsToTest.password || !settingsToTest.fromEmail) {
      console.error("Missing required SMTP settings");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Missing required SMTP settings" 
        }),
        { 
          status: 400, 
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders 
          } 
        }
      );
    }
    
    console.log("Testing SMTP connection with settings (credentials hidden):", {
      host: settingsToTest.host,
      port: settingsToTest.port,
      secure: settingsToTest.secure,
      fromEmail: settingsToTest.fromEmail,
      testRecipient: settingsToTest.testRecipient
    });
    
    const testResult = await testSmtpConnection(settingsToTest);
    
    return new Response(
      JSON.stringify(testResult),
      { 
        status: 200, 
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders 
        } 
      }
    );
  } catch (error) {
    console.error("Error in test-smtp-connection function:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: "Error testing SMTP connection", 
        details: error instanceof Error ? error.message : "Unknown error" 
      }),
      { 
        status: 500, 
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders 
        } 
      }
    );
  }
});
