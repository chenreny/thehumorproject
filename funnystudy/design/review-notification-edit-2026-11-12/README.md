# Notification settings visual review

The edit card follows the supplied November 12 screenshot: account tag, channel switches, email help, verified-phone strip, and Cancel / Save changes footer. It uses the existing light/gold and dark/gold themes. Policy links remain available below the footer note, and newly enabled phone channels still show their consent disclosures.

The four screenshots render the actual React components and production CSS with controlled account data. Phone delivery and preference writes are mocked for browser verification; these screenshots do not demonstrate live SMS delivery.

Validated:
- Desktop and 390px phone layouts in both themes, with no horizontal overflow.
- Cancel discards edits and restores saved preferences.
- Reload preserves an interrupted edit for Continue / Discard.
- Save errors retain selections; successful saves clear the draft.
- Phone verification unlocks switches without automatically enabling them.
- Build passes; 44 Settings and 30 demographics/study tests pass.
- ESLint reports no errors and one existing image-element warning in SwipeVoteCard.

The real app remains available at http://127.0.0.1:3014. No commit, push, deployment, or live provider change was made.
