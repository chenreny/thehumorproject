# Semester Project Part 1: Improvement Idea

## Repository

`funnystudy` — the participant app for selecting studies and rating captions.

## What the app does today

Participants sign in, finish any required profile and demographic steps, choose an active study, and move through its captions. They can like captions they find funny, see their position in the caption queue, and end the study to save completion stats. The study welcome screen explains the basic task, but it does not tell participants how many captions they will rate before they start.

## Proposed improvement: show the study length before starting

Show “X captions in this study” on the welcome screen immediately above the Start Study or Continue Study button. Use the same caption-order snapshot that supplies the existing `current/total` progress indicator during rating. Show the full run total for both starting and continuing: reopening the study currently creates a fresh shuffled queue, so a “remaining” count would imply a resume position the app does not preserve.

This gives participants a clearer sense of the commitment before they start and helps them decide whether they have time to finish. I would show a caption count rather than a time estimate, since actual rating speed varies from person to person.

## How I would evaluate it

- A participant can tell how many captions are in the run before selecting Start Study.
- The shown total agrees with the study progress count during the run, including when a participant resumes.
- Empty studies and caption-load failures retain their existing states instead of displaying a misleading count.
- The count is readable on a narrow phone viewport and announced as ordinary text to screen readers.
- In a short PM walkthrough, observe whether participants notice the count and can explain what it means before beginning.
- Compare study starts and completions, while treating a small project sample as directional rather than conclusive.

## PM approval requested

Do you approve showing the full number of captions in this run on the Start/Continue Study screen, using the same total shown in study progress?

**Status:** Draft for PM review. No product changes have been made pending approval.

## Local setup and exploration (October 26, 2026)

- Extracted the supplied funnystudy and teaching-data ZIPs. All teaching-data files passed `CHECKSUMS.sha256` verification.
- Used Node 24.22.0 and npm 11.19.1; `npm ci` completed. The app's `dev` script uses **http://localhost:3002**. `/login` returned HTTP 200 and the signed-out home route redirected to `/login` after a stale generated Next.js cache was moved out of the repository.
- `StudyStartPage` in `src/components/CaptionVoteFlow.tsx` omits a count, while `src/app/study/[studyId]/page.tsx` already passes `captionOrder.length` to the flow as `initialTotalCaptionCount`. The progress denominator uses that total.
- All 29 demographic/study routing tests and all 6 image tests passed. Authenticated data verification still requires a new Supabase project under the student's control, import of the supplied database, Google OAuth configuration, and a new test user. No existing project or credential was substituted.
- The October 19 snapshot contains 86 studies, but **zero public studies active on October 26**; its latest public study ended October 17. After import, create a current public study in the student's copy and map existing captions to it, or adjust an imported study's date window in that copy, to test the participant workflow. Do not alter the shared source ZIP.

## Current setup check (November 10, 2026)

- The student's Supabase project is now configured. The student confirmed Google sign-in, a Settings save, and opening a study in the local app.
- The project currently has three active public studies: 117 (23 captions), 120 (13 captions), and 122 (22 captions). Each has linked images; a sample image from each returned HTTP 200.
- A full signed-in rating and completion run is still being checked. Do not claim that workflow is verified until the completion screen and the home page's Completed status have both been observed.
- The Week 7 assignment requires a working Vercel URL for the PM to review, but deployment is deliberately pending the student's instruction. It does not require SMS or a working phone number. External services needed for the chosen workflow should be confirmed with the PM.
- PM approval for the proposed improvement is not documented in this draft. The assignment requires that approval before implementing the improvement or submitting it.
