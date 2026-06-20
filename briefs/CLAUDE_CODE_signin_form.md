# Claude Code — Build an iPad open-house sign-in form

Add a standalone sign-in page to the repo for collecting visitor leads at open houses on an iPad.
Static only (no backend) — leads are stored in the browser and exportable as CSV. Keep it dead
simple and reliable; this runs unattended on an iPad all day.

## Where it lives
Create a new page that builds to `dist/signin/index.html` (so it deploys to `<site>/signin`).
Reuse the guide's visual language: the same brand palette (--navy #13354e, --teal #2f8f8a,
--sand, --cream), the Fraunces + Inter fonts, and the shared stylesheet if practical (or a small
dedicated stylesheet — your call, but match the look). It should feel like the same brand as the
guide.

## The form — fields
1. **Name** (text, required)
2. **Phone number** (tel input, required; format as they type if easy, e.g. (310) 995-7741)
3. **Are you working with a real estate agent?** — a clear Yes / No toggle (two big tappable
   buttons or a segmented control, required). Store as boolean.
Optional 4th field (include, not required): **Email** (some people prefer it).

Design for **iPad / touch**: large tap targets, big readable fonts, generous spacing, a single
big "Submit" button. Should look great in landscape and portrait. Numeric keypad should appear
for the phone field (`inputmode="tel"`).

## On submit
- Validate name + phone are filled and the agent Yes/No is chosen.
- Save the entry to `localStorage` as part of a running array of leads, each with: name, phone,
  email (if given), agentRepresented (true/false), and a timestamp.
- Show a warm full-screen "Thank you!" confirmation: e.g. "Thanks for stopping by, {first name}!
  We'll text you the El Segundo neighborhood guide shortly." with a button to "Sign in another
  guest" that resets the form for the next person.
- Auto-return to a blank form after ~6 seconds OR on tapping the reset button, so it's ready for
  the next visitor without staff intervention.

## Lead management (for the agent, not the public)
Add a small, unobtrusive **agent control** — e.g. a gear icon in a corner, or a hidden tap target
(tap the logo 5x) — that opens an agent panel showing:
- A running count: "X guests signed in today."
- A **"Download leads (CSV)"** button that exports all stored leads as a .csv file
  (columns: Name, Phone, Email, Working With Agent, Time). Filename like
  `open-house-leads-YYYY-MM-DD.csv`.
- A **"Clear leads"** button BEHIND a confirm dialog ("This permanently deletes all saved leads.
  Did you download them first?") so it can't be tapped by accident.
Keep this panel visually separate and not something a guest would stumble into.

## CRITICAL reliability notes (put these in the README too)
- Leads are stored ONLY in this iPad browser's localStorage. They are NOT sent anywhere.
- The agent MUST tap "Download leads (CSV)" before closing/clearing the browser, or leads are lost.
- Do NOT use private/incognito mode (localStorage won't persist).
- localStorage IS supported here (this is a real deployed page, not a sandboxed artifact), so it's
  the right tool — but document the above so the user doesn't lose data.

## Customization for reuse
Put the open-house specifics (the listing address shown in the header, the guide name in the
thank-you message) in clearly-marked constants at the top of the page's script, so the same form
can be reused for the next open house by changing two lines. Header should show: "Welcome —
please sign in" plus "700 W Palm Ave · El Segundo" and the Beach City Brokers logo.

## Finish
`npm run build`, `npx serve dist`, open `/signin`, and test the full flow on a narrow viewport:
fill it out, submit, see the thank-you, confirm it resets, sign in a 2nd person, open the agent
panel, download the CSV, and verify both entries are in the file. Print files changed. Remind me
to `git add . && git commit && git push` to deploy.
