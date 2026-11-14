# Study reminder journey — working design

This documents the earlier unapproved local implementation. The [notification setup product proposal](./notification-setup-proposal.md) is the new design under review; it has not been implemented in the app.

Status: local draft for review. This flow does not change reminder delivery or consent rules.

## Participant path

1. The study list stays focused on studies. There is no reminder card on home and no reminder prompt before starting a study.
2. When someone chooses Back to studies after starting an unfinished study, offer reminders once, in context. The sheet has **Set up reminders**, **Leave without reminders**, and a close control that returns to the study. Leaving never changes consent.
3. Setup opens on the existing `/notification-preferences` route. One screen shows Email, Text, and Phone call choices together. Each channel has independent **Yes**, **No**, and **Later** choices. The participant can leave without saving and return to studies.
4. If Text or Phone call is Yes and no verified number exists, ask for a number and code. Incorrect or expired codes show an inline error; resend and edit remain available. Verification alone does not enable reminders.
5. Review all three choices and the verified number, then explicitly save. A saved summary confirms the choices and has **Back to studies**. An unfinished study remains In progress and can be resumed from its card.
6. If setup is interrupted, Settings offers **Continue unfinished setup** for the current browser session. Later changes can also happen directly in Settings, with the same choice controls and phone status. Saved phone Yes without a verified number is labeled as needing verification. No reminder invitation repeats after a choice, dismissal, or departure from the offer.

## Visual system

The setup and Settings utility screens use a white canvas, near-black headings, blue actions, thin progress, sparse dividers, and inline red error feedback. This follows the typography and restraint of the [TypeLess reference](https://dribbble.com/shots/25543448-Sign-up-flow-Create-an-account-TypeLess-AI-Messenger-app) without copying its screens. The study itself keeps its existing theme; the exit sheet connects the two contexts. Phone and desktop must show the full sequence, including the return destination.

## Rules to preserve

- Email, text, and automated-call choices remain separate; Yes for a phone channel requires an Auth-verified number, while No and Later do not.
- A pending replacement never displaces the current verified number until confirmation.
- Delivery is not described as live while the test-only provider setup is in place.
- The flow uses existing routes and user-scoped server actions. No provider or production configuration changes are part of this draft.
