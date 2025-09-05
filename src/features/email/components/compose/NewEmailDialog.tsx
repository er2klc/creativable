
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Paperclip, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from '@tanstack/react-query';

interface NewEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userEmail?: string;
  replyToEmail?: any; // Optional, for replying to an existing email
}

export function NewEmailDialog({ open, onOpenChange, userEmail, replyToEmail }: NewEmailDialogProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [to, setTo] = useState(replyToEmail?.from_email || '');
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [subject, setSubject] = useState(replyToEmail ? `Re: ${replyToEmail.subject}` : '');
  const [content, setContent] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [showCcBcc, setShowCcBcc] = useState(false);
  
  // Clear form on close
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      // Small delay to avoid flashing of form reset
      setTimeout(() => {
        if (!replyToEmail) {
          setTo('');
          setSubject('');
        }
        setCc('');
        setBcc('');
        setContent('');
        setFiles([]);
        setShowCcBcc(false);
      }, 300);
    }
    onOpenChange(isOpen);
  };
  
  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...selectedFiles]);
    }
  };
  
  // Remove a file from the list
  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  // Send the email
  const handleSendEmail = async () => {
    if (!user || !to || !subject) {
      toast.error("Missing required fields", {
        description: "Please fill in all required fields."
      });
      return;
    }
    
    setIsSending(true);
    
    try {
      // Get current session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) {
        throw new Error("No active session found");
      }
      
      // Upload any attachments
      const attachments = [];
      if (files.length > 0) {
        for (const file of files) {
          const fileName = `${user.id}/${Date.now()}-${file.name}`;
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('email-attachments')
            .upload(fileName, file);
            
          if (uploadError) {
            console.error("File upload error:", uploadError);
            throw new Error(`Error uploading file: ${uploadError.message}`);
          }
          
          // Get public URL
          const { data: urlData } = supabase.storage
            .from('email-attachments')
            .getPublicUrl(fileName);
            
          attachments.push({
            name: file.name,
            type: file.type,
            size: file.size,
            url: urlData.publicUrl,
            path: fileName
          });
        }
      }
      
      // Split CC and BCC emails
      const ccEmails = cc ? cc.split(',').map(email => email.trim()) : [];
      const bccEmails = bcc ? bcc.split(',').map(email => email.trim()) : [];
      
      // Send the email via the edge function
      const response = await fetch('https://agqaitxlmxztqyhpcjau.supabase.co/functions/v1/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionData.session.access_token}`
        },
        body: JSON.stringify({
          to: to.split(',').map(email => email.trim()),
          cc: ccEmails,
          bcc: bccEmails,
          subject,
          html_content: content,
          attachments,
          in_reply_to: replyToEmail?.message_id
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send email");
      }
      
      const result = await response.json();
      
      if (result.success) {
        toast.success("Email Sent", {
          description: "Your email has been sent successfully."
        });
        
        // Store in Sent folder
        await supabase.from('emails').insert({
          user_id: user.id,
          folder: 'Sent',
          message_id: result.message_id || `sent-${Date.now()}`,
          subject,
          from_name: sessionData.session.user.email,
          from_email: sessionData.session.user.email,
          to_name: '',
          to_email: to,
          cc: ccEmails,
          bcc: bccEmails,
          html_content: content,
          text_content: content,
          sent_at: new Date().toISOString(),
          received_at: new Date().toISOString(),
          read: true,
          starred: false,
          has_attachments: attachments.length > 0,
          flags: ['\\Seen', '\\Sent']
        });
        
        // Refresh emails
        queryClient.invalidateQueries({ queryKey: ['emails'] });
        
        // Close the dialog
        handleOpenChange(false);
      } else {
        throw new Error("Failed to send email");
      }
    } catch (error: any) {
      console.error("Email sending error:", error);
      toast.error("Failed to Send Email", {
        description: error.message || "An error occurred while sending the email."
      });
    } finally {
      setIsSending(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>New Email</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="to">To <span className="text-red-500">*</span></Label>
            <Input 
              id="to" 
              value={to} 
              onChange={(e) => setTo(e.target.value)} 
              placeholder="Recipient email address" 
            />
          </div>
          
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCcBcc(!showCcBcc)}
              className="text-xs font-normal py-0 h-auto"
            >
              {showCcBcc ? 'Hide CC/BCC' : 'Show CC/BCC'}
            </Button>
          </div>
          
          {showCcBcc && (
            <>
              <div className="space-y-2">
                <Label htmlFor="cc">CC</Label>
                <Input 
                  id="cc" 
                  value={cc} 
                  onChange={(e) => setCc(e.target.value)} 
                  placeholder="CC recipients (comma separated)" 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bcc">BCC</Label>
                <Input 
                  id="bcc" 
                  value={bcc} 
                  onChange={(e) => setBcc(e.target.value)} 
                  placeholder="BCC recipients (comma separated)" 
                />
              </div>
            </>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="subject">Subject <span className="text-red-500">*</span></Label>
            <Input 
              id="subject" 
              value={subject} 
              onChange={(e) => setSubject(e.target.value)} 
              placeholder="Email subject" 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="content">Message</Label>
            <Textarea 
              id="content" 
              value={content} 
              onChange={(e) => setContent(e.target.value)} 
              placeholder="Type your message here..." 
              className="min-h-[200px]"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="attachments">Attachments</Label>
            <div className="flex items-center space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => document.getElementById('file-upload')?.click()}
                className="flex items-center"
              >
                <Paperclip className="mr-2 h-4 w-4" />
                Attach Files
              </Button>
              <input
                id="file-upload"
                type="file"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
            
            {files.length > 0 && (
              <div className="mt-2 space-y-2">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-100 p-2 rounded">
                    <div className="flex items-center">
                      <Paperclip className="h-4 w-4 mr-2" />
                      <span className="text-sm truncate max-w-xs">{file.name}</span>
                      <span className="text-xs text-gray-500 ml-2">
                        ({(file.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="h-7 w-7 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter className="mt-4">
          <div className="flex items-center justify-end space-x-2">
            <Button variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSendEmail} 
              className="flex items-center"
              disabled={isSending || !to || !subject}
            >
              {isSending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Email
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
