# Google Calendar

Open Week view in the Google account you want to use. In a calendar sync, show only the destination calendar so its events can be compared with the same period in Outlook.

| Recipe | What it does |
| --- | --- |
| [`read-calendar-week`](recipes/read-calendar-week.json) | Reads the visible week label, event chips, signed-in account label, and calendar checkboxes. Each event row contains displayed text and Google’s opaque `data-eventid`. |
| [`stage-calendar-import`](recipes/stage-calendar-import.json) | Selects the `calendar-file` attachment on the open Import & export settings page. Confirm the account and the calendar in **Add to calendar**, then click **Import** when ready. |

Choose a dedicated destination calendar for copied availability. Imports are a snapshot. Changes and cancellations in Outlook require another comparison.

**Origin** `https://calendar.google.com` · [Shared targets](adapter.json) · [Google’s import instructions](https://support.google.com/calendar/answer/37118)
