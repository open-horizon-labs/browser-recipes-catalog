# Outlook on the web

Open a folder with messages in a signed-in Outlook tab and scroll to the top. Run `first-message-summary` to get the visible text of the first message row in `outputs.summary` without opening the message. The selector uses the English label “Message list.” [Recipe](recipes/first-message-summary.json)

**Origin** `https://outlook.cloud.microsoft` · [Shared targets](adapter.json)

Open Calendar in **Week** view for the dates you want and review the visible calendars and filters. [`read-calendar-week`](recipes/read-calendar-week.json) returns the displayed `range`, event descriptions in `events[].attributes["aria-label"]`, the account label and the Outlook filter indicator when present. Results are limited to the loaded view. Check the range, visible calendar and filters before comparing the output with Google Calendar.
