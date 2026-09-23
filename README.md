# The Humor Project

A Next.js app that reads developer jokes from Supabase and renders them as a
server-rendered card list.

## Environment variables

The app requires these variables locally and in Vercel:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

Keep their values in `.env.local`; environment files are excluded from Git.

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).
