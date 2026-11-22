# Live checks on November 22, 2026

In a signed-in BrowserOS Neo profile, we ran the extension’s `executeDom` function on the pages below using the catalog selectors. Each read matched one element and returned nonempty text.

| App | Page | What we checked |
| --- | --- | --- |
| [Gmail](../adapters/gmail/) | Inbox and Sent | The first listed subject in each folder. |
| [Outlook](../adapters/outlook/) | Inbox, scrolled to the top | The first message row. Outlook redirected from `outlook.office.com` to `outlook.cloud.microsoft`. |
| [Concur US2](../adapters/concur/) | `/nui/expense` | The heading contained “Manage Expenses” and the first active report card had text. |

We recorded match counts and pass/fail results. These read-only checks covered the page operations. We tested the extension and native CLI together on a [local fixture](https://github.com/open-horizon-labs/browser-recipes/tree/main/integration/fixtures/workshop).

## Concur expense workflow

The Concur workflow port also replayed the report and allocation summaries,
submission preview, saved lodging breakdown, and an unsaved taxi form in
inactive signed-in tabs. The report showed Approved during the final check.
All 44 Concur recipes also passed through the native bridge on a local
disposable fixture. The test covers receipt attachment, hotel itemization,
import, allocations, approval dialogs, and common refusal paths. Live
itemization saves, imports, allocation writes and submission still need a
disposable Concur draft.

From the catalog root, run `node tests/concur.mjs` after building the adjacent
Browser Recipes runtime and installing its `integration` dependencies. Use
`CHROMIUM_PATH` for the browser executable or `BROWSER_RECIPES_RUNTIME` for a
different runtime checkout.

## Calendar recipes

In the signed-in BrowserOS Neo work profile, we executed the current read operations against Outlook Calendar and Google Calendar in Week view. Both returned a range, account label and nonempty event rows. Outlook showed an active filter, and Google returned the checked calendar controls. The Google Import & export page also exposed the file input used by the staging recipe. Calendar checks read page data and changed the displayed week. No file was staged or imported.
