# Outlook on the Office host

Use this adapter if the signed-in tab stays on `outlook.office.com`. It reads the first visible message or the current calendar week. The calendar workflow accepts either Outlook host. If the app redirects, select the tab at its final origin. The selectors and expected outputs follow the [Outlook recipes](../outlook/README.md). This host has not been retested on a live tenant.

Supply both `first-day` and `last-day` to `read-calendar-week` for an inclusive range, for example `{"first-day":"2026-11-08","last-day":"2026-11-14"}`. Omit both to read the visible week. Start in English-language Week view. The recipe pages through the calendar in the same tab and leaves it on the final week. Filters and calendar visibility still apply.
