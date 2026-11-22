# Live checks on November 22, 2026

In a signed-in BrowserOS Neo profile, we ran the extension’s `executeDom` function on the pages below using the catalog selectors. Each read matched one element and returned nonempty text.

| App | Page | What we checked |
| --- | --- | --- |
| [Gmail](../adapters/gmail/) | Inbox and Sent | The first listed subject in each folder. |
| [Outlook](../adapters/outlook/) | Inbox, scrolled to the top | The first message row. Outlook redirected from `outlook.office.com` to `outlook.cloud.microsoft`. |
| [Concur US2](../adapters/concur/) | `/nui/expense` | The heading contained “Manage Expenses” and the first active report card had text. |

We recorded match counts and pass/fail results. These read-only checks covered the page operations. We tested the extension and native CLI together on a [local fixture](https://github.com/open-horizon-labs/browser-recipes/tree/main/integration/fixtures/workshop).

## Calendar recipes

In the signed-in BrowserOS Neo work profile, we executed the current read operations against Outlook Calendar and Google Calendar in Week view. Both returned a range, account label and nonempty event rows. Outlook showed an active filter, and Google returned the checked calendar controls. The Google Import & export page also exposed the file input used by the staging recipe. Calendar checks read page data and changed the displayed week. No file was staged or imported.
