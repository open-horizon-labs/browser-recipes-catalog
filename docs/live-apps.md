# Read-only recipes for signed-in apps

Import the catalog into Tab Recipes and grant access to the origin for the app
you plan to use. Use the CLI’s `tabs` command to select an existing tab by ID. These recipes take no inputs.

| Adapter and recipe IDs | What it returns | Where to run it |
| --- | --- | --- |
| `gmail / first-visible-subject` | The first subject in the rendered message list | Open a Gmail folder with messages. |
| `outlook / first-message-summary` | Visible text from the message row at list position one | Open a folder on `https://outlook.cloud.microsoft` and scroll to the top of the message list. |
| `concur / first-expense-report-summary` | Visible text from the first active expense report card | Open SAP Concur on the US2 origin. The recipe navigates to Manage Expenses and checks its heading before reading a card. |

An empty list, a different layout, or a translated interface can make a target
unavailable. The runtime reports the failing recipe step. Other Outlook and
Concur origins require separate adapter definitions and validation.

## Live validation

On November 22, 2026, all three apps opened with authenticated sessions in a
BrowserOS Neo profile. Gmail opened Inbox and Sent. Outlook
redirected from `outlook.office.com` to `outlook.cloud.microsoft` and opened
Inbox. SAP Concur opened its US2 Manage Expenses page at `/nui/expense`.

The checks used the catalog's exact CSS selectors and the extension's
`executeDom` function inside the live pages. The Gmail subject matched once and
returned a nonempty string in each folder. The Outlook message row matched once
and returned a nonempty string. The Concur heading assertion passed and the
report card matched once and returned a nonempty string.

The test recorded selector counts and pass/fail metadata. It required no sign-in
actions or app writes. This validates the live DOM steps. The extension
installation, permission prompts, and native CLI transport were outside this
BrowserOS check.
