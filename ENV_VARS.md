Environment Variables (local-only)

This project stores secrets and runtime configuration in a local environment file that must never be committed.

Create a local file named `.env.local` in the project root (do NOT commit it). Use the `.env.local.example` file as a template.

Variables
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL (public)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Public anon key for Supabase client-side access
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key for server-side Supabase operations (keep secret)
- `OPENAI_API_KEY`: OpenAI API key for AI requests (secret)
- `GOOGLE_AI_API_KEY`: Google AI / API key used by integrations (secret)
- `CRON_SECRET`: Secret used to protect cron routes and scheduled tasks

Security
- Never commit `.env.local` or files containing real keys to GitHub or other VCS.
- Rotate keys immediately if they become exposed.

Usage
1. Copy `.env.local.example` to `.env.local`.
2. Fill in real values (do not commit):

   Copy-Paste (PowerShell):

```powershell
Copy-Item .env.local.example .env.local
```

3. Install dependencies and run the app locally:

```powershell
npm install
npm run dev
```

If you need to share values with teammates, use a secure secrets manager (e.g., 1Password, Vault, or CI environment variables), not the repository.
