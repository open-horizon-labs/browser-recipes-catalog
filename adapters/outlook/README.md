# Outlook on the web

Open a folder with messages in a signed-in Outlook tab and scroll to the top. Run `first-message-summary` to get the visible text of the first message row in `outputs.summary` without opening the message. The selector uses the English label “Message list.” [Recipe](recipes/first-message-summary.json)

**Origin** `https://outlook.cloud.microsoft` · [Shared targets](adapter.json)

Open Calendar in **Week** view for the dates you want and review the visible calendars and filters. [`read-calendar-week`](recipes/read-calendar-week.json) returns the displayed `range`, event descriptions in `events[].attributes["aria-label"]`, the account label and the Outlook filter indicator when present. Results are limited to the loaded view. Check the range, visible calendar and filters before comparing the output with Google Calendar.

Before operating, the adapter reads the mailbox email in Outlook’s account panel and binds that identity locally. If the panel was closed, the adapter opens it in the selected tab and dismisses it with Escape. A missing, ambiguous or changed identity stops the run. Settings lets you forget a binding after you switch accounts.

Supply both `first-day` and `last-day` to `read-calendar-week` for an inclusive range, for example `{"first-day":"2026-11-08","last-day":"2026-11-14"}`. Omit both to read the visible week. Start in English-language Week view. The recipe pages through the calendar in the same tab and leaves it on the final week. Filters and calendar visibility still apply.
