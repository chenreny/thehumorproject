# Starter templates

These classic, user-uploaded meme templates are sourced from Imgflip's public
`get_memes` catalog: https://imgflip.com/api#section-get_memes.
Original image URLs are recorded in `src/lib/templates.ts`. They are third-party
media, not original artwork by The Humor Project. Existing image marks are kept.

Local copies keep browsing and generation independent of Imgflip availability.
The application writes its own AI captions using OpenAI; it does not call
Imgflip's captioning service. Curate this allowlist rather than accepting
arbitrary image URLs from clients.
