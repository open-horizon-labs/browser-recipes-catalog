# Live checks on November 22, 2026

In a signed-in BrowserOS Neo profile, we ran the extension’s `executeDom` function on the pages below using the catalog selectors. Each read matched one element and returned nonempty text.

| App | Page | What we checked |
| --- | --- | --- |
| [Gmail](../adapters/gmail/) | Inbox and Sent | The first listed subject in each folder. |
| [Outlook](../adapters/outlook/) | Inbox, scrolled to the top | The first message row. Outlook redirected from `outlook.office.com` to `outlook.cloud.microsoft`. |
| [Concur US2](../adapters/concur/) | `/nui/expense` | The heading contained “Manage Expenses” and the first active report card had text. |

We recorded match counts and pass/fail results. These read-only checks covered the page operations. We tested the extension and native CLI together on a [local fixture](https://github.com/open-horizon-labs/tab-recipes/tree/main/integration/fixtures/workshop).
