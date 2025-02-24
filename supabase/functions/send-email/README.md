
# Send Email Edge Function

This function handles email sending through configured SMTP settings.

## Environment Variables Required:
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY

## Setup:
1. Deploy the function
2. Set the environment variables in the Supabase dashboard
3. Add secrets:
```bash
supabase secrets set --env production SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
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
      "path": "https://example.com/file.pdf"
    }
  ]
}
```
