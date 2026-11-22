# Google Calendar

Open Week view in the Google account you want to use. In a calendar sync, show only the destination calendar so its events can be compared with the same period in Outlook.

| Recipe | What it does |
| --- | --- |
| [`read-calendar-week`](recipes/read-calendar-week.json) | Reads the visible week label, event chips, signed-in account label, and calendar checkboxes. Each event row contains displayed text and Google’s opaque `data-eventid`. |
| [`stage-calendar-import`](recipes/stage-calendar-import.json) | Selects the `calendar-file` attachment on the open Import & export settings page. Confirm the account and the calendar in **Add to calendar**, then click **Import** when ready. |
| [`choose-import-calendar`](recipes/choose-import-calendar.json) | Opens import settings under the current Google account, selects the named calendar and returns the verified calendar name. |
| [`apply-calendar-import`](recipes/apply-calendar-import.json) | Checks the reviewed `destination-account` and `calendar-name`, attaches the approved `calendar-file`, clicks **Import**, and reads a visible receipt when available. Confirm **Add to calendar** before approval and verify the week if no receipt appears. |

## Create a single event

Choose **Review and create one timed Google Calendar event** or **Review and
create one all-day Google Calendar event** in Workflows. Start on the intended
Google account's Calendar tab and get the exact account label from
`read-calendar-week`.

1. Enter the title, optional location, and compact range. For a timed event use
   a range such as `20270201T090000/20270201T103000` for February 1 from 9 to
   10:30 in Calendar's time zone. For a one-day all-day event use an exclusive
   end date, such as `20270201/20270202`. Enter each date and time in the exact
   display format from the Google editor. The preparation recipe checks these
   values and the all-day setting after opening the new-event editor.
2. Review the destination calendar and all fields in Google's editor. Select
   **Approve and press Save** in the workflow. The save recipe checks the
   account, the exact new-event path, and the field values again before clicking.
3. Open the week that contains the expected event. Use its exact event label
   from `read-calendar-week` to run the verification step. It requires one
   matching event and returns its opaque event ID. If verification fails,
   inspect the calendar before trying Save again.

The timed and all-day editor recipes were tested against an isolated fixture.
Google's current editor and its localized formatting still require live
validation.

Choose a dedicated destination calendar for copied availability. Imports are a snapshot. Changes and cancellations in Outlook require another comparison.

**Origin** `https://calendar.google.com` · [Shared targets](adapter.json) · [Google’s import instructions](https://support.google.com/calendar/answer/37118)

Supply both `first-day` and `last-day` to `read-calendar-week` for an inclusive range, for example `{"first-day":"2026-11-08","last-day":"2026-11-14"}`. Omit both to read the visible week. Start in English-language Week view. The recipe pages through the calendar in the same tab and leaves it on the final week. Filters and calendar visibility still apply.
