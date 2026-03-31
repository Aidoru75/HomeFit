# Google Play Closed Testing — Complete Playbook

## The Hard Numbers

- **Minimum 12 testers** opted in simultaneously
- **14 consecutive days** of active testing
- **Recruit 20-25 people** — buffer against opt-outs, since if someone opts out mid-test, it can hurt your numbers
- Testers must use **real Android devices** (emulators don't count)
- You already have some testers from before — new ones join the count from their opt-in date

## What Each Tester Needs To Do

### Day 0 — Onboarding (send them these steps)

1. You add their **Gmail address** to the testers list in Google Play Console
2. You send them the **opt-in link** (from Play Console → Closed Testing → Testers tab)
3. They click the link, accept the invitation, and **install the app from the Play Store**
4. They open the app and use it

### Days 1-14 — What "engagement" means

Google monitors:
- **Real installations** on genuine devices
- **Usage patterns** — they need to actually open and use the app, not just install and forget
- **Crash data and stability**
- **Retention** — are people coming back?

**Tell your testers to:**
- Open HomeFit **at least every 2-3 days** (daily is ideal)
- Actually interact: browse exercises, create a routine, start a workout, explore settings
- They do NOT need to complete full workouts — just meaningful interaction
- If they find bugs or have opinions, great — but the main thing is **regular usage**

### What testers should NOT do
- Don't uninstall the app during the 14 days
- Don't opt out of the testing program
- Don't use emulators

## What YOU Need To Do

### 1. Publish updates during testing (important!)

Release **2-3 minor updates** during the 14-day period. This shows Google you're actively developing and responding to feedback. These can be small:
- Update 1 (day 4-5): Fix a minor bug or tweak a UI element
- Update 2 (day 9-10): Another small improvement
- Update 3 (day 12-13): Polish based on any feedback received

You already have uncommitted landscape improvements — those are perfect for staggering across updates.

### 2. Collect and document feedback

Google's production access application asks you to **summarize tester feedback**. Create a simple system:

**Set up a WhatsApp group or email thread** with your testers. Ask them periodically:
- "How's the app working on your phone?"
- "Did you find anything confusing?"
- "Any crashes or weird behavior?"

**Keep a log** like this:
```
Tester A (Samsung S21, Android 13): "Works great, exercises are clear"
Tester B (Xiaomi Redmi, Android 12): "Rest timer sound didn't play once"
Tester C (Pixel 6, Android 14): "Would be nice to have dark mode"
```

Even simple responses like "works fine, no issues" count as valid feedback.

### 3. Production access application

When the 14 days are up, you apply for production access. Google will ask:
- What your app does
- How testing went
- Summary of feedback received
- How you addressed issues found during testing

**Your answers should show:**
- Real humans tested it on real devices
- You communicated with them and collected feedback
- You published updates in response
- The app is stable (no major crashes)

### 4. Store listing quality

Make sure these are solid before applying:
- **Screenshots** — clear, quality screenshots of your app
- **Description** — accurate, complete
- **Privacy policy** — must be listed (even if the app is fully offline, you need one)
- **App category** — correct (Health & Fitness)

## Timeline for Your Friend's Students

| Day | Action |
|-----|--------|
| 0 | Add all Gmail addresses, send opt-in links, students install |
| 1-3 | Check Play Console to confirm testers show as opted-in. Message group: "Thanks for installing! Try creating a routine" |
| 4-5 | Push update #1 (e.g., landscape layout fix). Message: "New update available, any issues so far?" |
| 7 | Midpoint check-in: "How's it going? Any bugs or suggestions?" |
| 9-10 | Push update #2 (small fix/improvement) |
| 12-13 | Push update #3. Message: "Last update! Any final thoughts?" |
| 14 | Confirm 12+ testers still opted in |
| 15 | Apply for production access with feedback summary |

## Message to Send Your Friend

Forward this so he can explain to his students:

---

Hi! A friend of mine developed a free fitness app for Android called HomeFit and needs people to try it for a couple of weeks. It's completely free, no ads, no accounts, works offline.

What you'd need to do:
1. Send me your Gmail address (the one on your phone)
2. You'll get a link to install the app from Google Play
3. Open the app every couple of days and try it out — browse exercises, create a workout, etc.
4. If you find any bugs or have suggestions, let me know

That's it! It takes 2 minutes to set up and the app is actually useful if you work out.

---

## Common Reasons for Rejection (avoid these)

- Not enough active testers (people installed but never opened the app)
- No updates published during testing period
- App crashes frequently
- Poor store listing quality
- Vague or missing feedback summary in the application
- Using fake/bot testers (Google detects this)

## Sources

- [Google Play Help — App testing requirements](https://support.google.com/googleplay/android-developer/answer/14151465?hl=en)
- [PrimeTestLab — Google Play 12 Testers Requirement 2026](https://primetestlab.com/blog/google-play-12-testers-closed-testing-guide)
- [TestersCommunity — 12 Testers for 14 Days](https://www.testerscommunity.com/blog/google-play-closed-testing-12-testers-14-days)
- [20AppTester — Closed Testing: Everything You Need to Know](https://20apptester.com/2025/03/04/google-play-closed-testing-everything-you-need-to-know/)
- [TestersCommunity — Production Access Rejected](https://www.testerscommunity.com/blog/google-play-production-access-rejected)
