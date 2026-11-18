# Campus Stores

Campus Stores is a Product Engineer work sample set at a fictional campus media equipment desk. Work through a club’s screening, from equipment pickup to a partial return and the next morning’s handover. Open **Candidate brief** in the app for the assignment.

> **Reviewers:** this fork answers the brief below. The change is on the kit page (**Requests → Open kit**) and the new **Today** tab. Play the three shift moments with the time button to see it.

---

## My submission: keep the product, fix the handover

**Short answer: yes, I would keep it.** It records each loan reliably. What it can’t record is a loan whose plans change partway through. In the story, the record and the real situation drift apart at 7:30 pm Friday, and the morning shift has to put the story back together from free text.

### One moment the product handles well

**Friday 3:45 pm, issuing the kit.** When I tried to put a digital camera on the Film Society slip, the original app refused: *“This equipment type is outside the approved request.”* It also offered only units that were on the shelf, so the projector in repair (PR-06) never appeared, and it wouldn’t issue a second adapter. One slip per physical unit means every item can be traced. I kept all of this.

### One moment I would change

**Friday 7:30 pm → Saturday 9:00 am, the partial return.** Kabir returned two of the three items and said Leela had the adapter. In the original app:

- The slip **couldn’t be changed**. It still said *“AD-12 · RQ-214 · Kabir Sen · Due Fri 8 pm”*, while Leela had the adapter and would bring it Saturday at 9 am.
- The only place to write that down was a **free-text desk-book note**, which wasn’t linked to the slip.
- At 9 am the morning shift saw a slip **13 hours overdue with no warning**. It was in the name of someone who didn’t have the item, and showed only a unit ID, not what kind of item it was.
- Leela came in with “an adapter”. **AD-12 (Belkin) and AD-15 (Anker) share shelf C4.** “Record return” was one click with no check, so closing the slip never involved looking at the label on the unit in her hand.
- A misclick had no undo. The only fix was to record a return that never happened, which corrupts the register.

### The change: a kit page that follows the job, plus a Today view

**1. Each request opens as a kit** (Requests → *Open kit*, or from Today). One screen shows each approved item, which unit went out, who has it and whether it’s back. **Each item appears exactly once**, in the place where its next action happens: the issue form while it’s waiting, the check-in form while it’s out, and a *Back* list once returned. There’s no separate status list repeating the same items above the forms.

**2. Issue the whole kit in one form.**
- You pick the collector **once**, from people the club has authorised. Kabir appears with the reason: *“Named by Isha Rao in the desk book · Fri 3:20 pm.”*
- Each item already has an on-shelf unit picked, with its model and shelf shown so you grab the right one.
- The return time is filled in from the request. **Only return times later than the desk clock are offered**, so a loan can’t be created already overdue. If the request’s own time has passed, the form says so and asks for a new one.
- Untick an item to issue the rest now and that one later.

**3. Check in by reading the label, and hand over whatever is still out.**
- For each open slip, choose the **label on the unit at the counter**. The form shows which unit the slip is for, e.g. *“slip L-404 is for AD-12 · Belkin AVC002 · shelf C4”*.
- The list deliberately contains **every unit of that item type**, not just the one on the slip. If only the expected unit appeared, the check would become a “yes, it’s back” button that people click without looking. Having wrong but plausible options is what makes someone read the label.
- Choosing the wrong unit is refused with a specific explanation, and your other choices stay as they were. A unit that is on the shelf gets *“… It should be on shelf B2. Check the label, or leave the slip open and ask the borrower.”* A unit on another loan gets the number of that slip.
- **Units in repair stay in the list, marked “recorded in repair”.** A unit that should be in the workshop turning up at the counter means something is wrong: either the workshop record is out of date, or the unit left without a slip. The desk needs to be able to say so. Choosing one gives *“PR-06 is recorded as in repair, not on loan. Don’t shelve it. Check with the workshop, and leave slip L-402 open until PR-04 comes back.”* That way a broken unit is never sent back to the shelf.
- For items not back yet, change **who has it** and **when it’s expected**. The slip stays open, keeps a history line (*“now with Leela Das (was Kabir Sen), due Sat 9 am (was Fri 8 pm)”*), and adds a matching entry to the desk book automatically.
- Moving a loan to a new holder also accepts only a future return time. A loan that is already overdue keeps its current time, marked *(passed)*, so leaving it unchanged is not mistaken for a new promise.
- Tick *Returned damaged* to send a unit straight to the workshop, so it can’t be lent again. When it’s fixed, **Back from workshop** in Inventory returns it to stock and adds a desk-book entry. That can be undone too.

**4. A Today tab for whoever takes over.** It shows what’s expected back, sorted by due time and marked *Overdue* / *Due now* against the desk clock, plus what’s waiting for pickup and the latest handover entries **left before the current desk time**. A note you’ve just written doesn’t show up as a handover to yourself. The tab shows a count when something needs attention.

**5. Undo.** Any issue, check-in or workshop return can be undone once from the status bar.

### The same job, using the change

| Moment | Original | With this change |
|---|---|---|
| **Fri 3:45 pm** pickup | Fill in the slip form 3 times: “New issue slip” + 4 dropdowns + save each time (~18 actions) | *Open kit* → choose **Kabir Sen** → *Issue selected items* (**3 clicks**). Slips L-402–404 are created, due Fri 8 pm |
| **Fri 7:30 pm** partial return | Close two slips. Write a free-text note. Adapter slip still says Kabir, Fri 8 pm | In one check-in form: label **PR-04**, label **SP-02**, adapter → **Leela Das, Sat 9 am** → *Save check-in*. Two slips close and L-404 moves to Leela with a history line and a desk-book entry |
| **Sat 9:00 am** handover | Read the desk book, remember “AD-12”, cross-check Inventory, hope the click is on the right row | Today shows **“USB-C → HDMI adapter · AD-12 · With Leela Das (collected by Kabir Sen) · Due now.”** *Open kit* → choose the label on her adapter. If it says AD-15: *“AD-15 · Anker A8312 is not the unit on slip L-404 … it should be on shelf C4.”* If it says AD-12, the slip closes and the kit shows **All returned** |

### What I kept

- Approval validation at issue time: approved types only, available units only, one unit per approved type.
- **One slip per physical unit.** Holder changes and history are added to the slip; nothing replaces it.
- The desk book, which is still where clubs talk to the counter. The counter’s own changes now also appear there.
- The layout, colours, dark mode and the four original tabs (Requests, Inventory, Loan register, Desk book).

### The observation that would tell me it helped

At a real counter, at the start of each shift, I’d count **how often staff have to ask someone or search through notes before they can close a loan someone else opened**. Before the change, every partial return should produce one of those moments. If the change works, that count should fall close to zero. Alongside it, I’d count **slips closed against the wrong unit**, found when the shelf doesn’t match the register at the end of the week.

---

## Other friction I removed

| Friction in the original | What changed |
|---|---|
| Request, collector and due time re-entered for every item | Entered once per kit |
| Unit list ignored the request, so mistakes appeared only after saving | Each item shows only on-shelf units of its own type |
| Due time not filled in from the request, and any time could be chosen | Filled in, and only times later than now are offered |
| Anyone could collect for any club (e.g. Tara collecting the Film Society kit) | Collector chosen from the club’s authorised people |
| Errors shown in the status bar at the bottom of the page | Errors appear at the top of the form, receive focus, and keep your choices |
| Register rows showed IDs only | Rows show item type, model, holder, collector, due status and history |
| Inventory said “On loan” but not who had it | Shows holder and due time |
| Requests stayed “Approved” for ever | Show live status: *Ready for pickup*, *Out*, *1 of 3 still out · with Leela Das*, *All returned* |
| No overdue state despite an on-screen clock | *Overdue* / *Due now* / *Due within the hour*, plus a count on Today |
| One-click return with no undo | Label check, plus one-step **Undo** |
| Returns recorded nothing about condition | *Returned damaged* sends the unit to the workshop and logs it |
| “Restart sample shift” wiped everything in one click | Asks for confirmation |

## What I would do next

- **Type or scan the label, don’t pick it.** The dropdown has a known weakness: the slip already names the expected unit (“slip L-402 is for PR-04”), so someone could match the screen to the screen without looking at the device. A short box where staff **type the ID from the label** closes that gap, at a cost of a few keystrokes, and also catches unknown or misread labels. At a real counter this becomes a **barcode or QR scan**, which is both faster and impossible to answer without the device. I kept the dropdown in the prototype because it’s the quickest option at a busy counter.
- **Reminders to the current holder.** Send them to Leela, not Kabir, when a slip is due.
- **Reservations.** Warn when a unit going out now is booked for another club before it’s due back.
- **Saved kits.** Issue a standard “screening kit” in one step.

## Known limits of the prototype

- Authorised collectors are part of the sample data. In a real system, clubs would add them through the desk book or the approval form.
- Times are a fixed list on the story clock, not real dates.
- Undo covers only the most recent change, and it’s cleared when shift time moves forward.

---

## Run the app

Open `index.html` in a modern browser. The app includes its scripts, styles, and icons and can run offline.

To serve it over local HTTP, run this from the repository folder and visit `http://localhost:8000`.

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Each browser stores its own sample shift locally when browser storage is available. **Restart sample shift** restores the fictional starting records. This version saves under a new storage key, so a shift saved by the original version is not loaded.

## Source

- `index.html` contains the desk layout, candidate brief, change summary, and bundled icons.
- `app.js` contains the sample records and interactions: kit issue, check-in and handover, the Today view, and undo.
- `styles.css` defines the desktop and mobile layouts, in light and dark.

Icon license notices are in [third-party/lucide-LICENSE.txt](third-party/lucide-LICENSE.txt).

## Submit your work

1. [Fork Campus Stores](https://github.com/virinchi-healthcare/campus-stores/fork) into your GitHub account. Complete the candidate brief and push your changes to your public fork. In your README, point reviewers to your work and explain the decision you made.
2. In your fork, open **Commits**, select the final commit you want reviewed, and copy the page URL. It should look like `https://github.com/YOUR-USERNAME/campus-stores/commit/COMMIT-SHA`.
3. [Submit your work through the Google Form](https://docs.google.com/forms/d/e/1FAIpQLScvzoh1R4WS-SkiwAVBQbMvniieJYSoOEfLMyVo5CyjOvYUgQ/viewform). Your **roll number**, **email ID**, and **final commit link from your public fork** are required. Enter your roll number and email ID in the form only.
