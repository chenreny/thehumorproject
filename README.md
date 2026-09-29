# The Humor Project

A Next.js app that reads developer jokes from Supabase and renders them as a
server-rendered card list. Google sign-in unlocks `/members` and a personal profile.

## Environment variables

The app requires these variables locally and in Vercel:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

Keep their values in `.env.local`; environment files are excluded from Git.

## Supabase setup

Apply the migrations in `supabase/migrations` to the existing Supabase project.
The profiles migration creates a row for every new Auth user, backfills existing
users, enables user-scoped profile policies, and creates an `avatars` Storage bucket.
Images live in Storage; `profiles.avatar_path` stores only the object path.

In Google Auth Platform, create a **Web application** OAuth client. Add
`https://humanproject-hazel.vercel.app` (and `http://localhost:3000` for local
development) as authorized JavaScript origins. Add
`https://waavokxbivwkftsbfdlx.supabase.co/auth/v1/callback` as Google's
authorized redirect URI. Enter that client ID and secret in Supabase Dashboard →
Authentication → Providers → Google and enable the provider.

In Supabase Dashboard → Authentication → URL Configuration, set the Site URL
to `https://humanproject-hazel.vercel.app` and allow these redirect URLs:
`http://localhost:3000/auth/callback`,
`https://humanproject-hazel.vercel.app/auth/callback`, and
`https://*-rc3502-1440.vercel.app/auth/callback` for commit-specific Vercel
deployments. The app sends OAuth sign-ins to exactly `/auth/callback` with no
extra query parameters. Supabase adds the temporary authorization code when it
returns from Google.

Keep `SUPABASE_URL` and `SUPABASE_ANON_KEY` configured in Vercel as well. For
incognito testing, disable Deployment Protection for the deployment in Vercel.

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).
