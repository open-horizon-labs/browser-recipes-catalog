# SAP Concur Expense

Read the first active expense report card in a signed-in US2 Concur tab. This is useful when a script needs the summary shown on Manage Expenses.

The recipe navigates to Manage Expenses, checks the English heading, and returns the first active card’s visible text in `outputs.summary`. It requires at least one active report.

- [first-expense-report-summary](recipes/first-expense-report-summary.json) — Read the first active report card from Manage Expenses.

**Origin** `https://us2.concursolutions.com` · [Shared targets](adapter.json)
