# Podcast Generation — Handoff Notes

Status as of PR #23: the automation script is written, linted, type-checked, and the
dialogue-drafting half has been verified with a real run. The TTS/audio half has **not**
been verified end-to-end yet — it needs to be run somewhere with unrestricted outbound
network access (a local machine, not this cloud sandbox). This doc is what the local/地端
operator needs to finish that verification.

## What's built

- `scripts/generate-podcast.ts` — drafts a two-host dialogue script, synthesizes it with
  OpenAI's `gpt-4o-mini-tts` (`marin`/`cedar` voices), mixes down with `ffmpeg` to the
  existing mono/80kbps mp3 convention, and embeds the `<audio>` tag into the post.
- `bun run podcast <slug-or-path>` — package.json entry point.
- `CLAUDE.md` documents the automated path plus the pre-existing manual fallback.

## What's been verified (in this cloud sandbox)

- Post lookup / slug / year resolution — correct.
- Dialogue JSON validation (`--script <file>` path) — correct.
- Dialogue drafting via the `claude` CLI — ran for real against
  `content/posts/2026/ai-daily-2026-07-15.md`, produced a 47-turn natural-sounding
  Traditional Chinese two-host script (banter, follow-up questions, a short open/close —
  NotebookLM "Deep Dive" style, as requested).
- `ffmpeg` installs and runs fine once present (`apt-get install ffmpeg` in this sandbox).

## What's blocked here, and why

Calling the real TTS endpoint fails in this environment:

```
error: TTS request failed (403): request rejected: host not permitted
```

This cloud session's outbound HTTPS goes through a policy-enforcing proxy, and
`api.openai.com` is not on this session's egress allowlist. Per the proxy's own docs,
403s from the proxy are an organizational policy decision, not a bug — they should be
reported, not routed around. A local machine (or a cloud environment with
`api.openai.com` allowlisted) won't have this restriction.

## To finish verification locally

1. `ffmpeg` and `claude` on `PATH`.
2. `OPENAI_API_KEY` set (already saved to `.env.local`, which is gitignored — Bun loads
   it automatically. **If this key was ever pasted anywhere outside a private local
   `.env.local`, rotate it in the OpenAI dashboard before relying on it.**)
3. Preview the dialogue script for free first:
   ```
   bun run podcast ai-daily-2026-07-15 --dry-run
   ```
4. Run it for real:
   ```
   bun run podcast ai-daily-2026-07-15
   ```
5. Check the result:
   - `public/audio/2026/ai-daily-2026-07-15.mp3` exists and sounds right (two distinct
     voices, natural pacing, correct pronunciation of proper nouns/tech terms — this is
     the part that most needs a human ear).
   - The `<audio>` tag was inserted into the post right after frontmatter.
6. If it sounds good: `git add content/posts/2026/ai-daily-2026-07-15.md
public/audio/2026/ai-daily-2026-07-15.mp3`, commit, push. This closes the loop the
   two-PR pattern from #14/#21 left open (every earlier `ai-daily` post except those two
   still has no podcast).

## Known open questions for the next iteration

- Per-episode cost is ~$0.015/min of audio on `gpt-4o-mini-tts` (roughly $0.20–0.30 for a
  post the length of `ai-daily-2026-07-15`) — cheap, but worth eyeballing after a few
  real runs.
- The dialogue prompt in `generateDialogueScript()` is a first draft; tune tone/length
  after listening to the first real output.
- Consider whether every future post should get a podcast automatically as part of the
  writing routine, or stay an explicit opt-in step per post.
