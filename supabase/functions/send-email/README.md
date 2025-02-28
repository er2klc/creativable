
# Send Email Edge Function

This function handles email sending through the Resend.com API.

## Environment Variables Required:
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- RESEND_API_KEY

## Setup:
1. Deploy the function
2. Set the environment variables in the Supabase dashboard
3. Add secrets:
```bash
supabase secrets set --env production RESEND_API_KEY=your-resend-api-key
```

## Usage:
Send a POST request to the function endpoint with:
```json
{
  "to": "recipient@example.com",
  "subject": "Email Subject",
  "html": "<p>Email content</p>",
  "lead_id": "optional-lead-uuid",
  "attachments": [
    {
      "filename": "file.pdf",
      "content": "base64-encoded-content",
      "contentType": "application/pdf"
    }
  ]
}
```
