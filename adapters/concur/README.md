# SAP Concur Expense

**Origin** `https://us2.concursolutions.com` · [Shared targets](adapter.json) · [Recipe files](recipes)

Open the intended report in a signed-in US2 tab and pass that tab ID to the
runtime. The report recipes that interact with a report also take its visible
`report-number`. Open another tab in front while the recipes run.

This adapter uses background-only runs and requires a runtime checkout that supports `match`,
`assertValue`, `assertValues`, `readValue`, and `readList`. The original
[first-expense-report-summary](recipes/first-expense-report-summary.json)
still opens Manage Expenses to read the first active report card.

## Audit a report

- [read-expense-report](recipes/read-expense-report.json) reads the title,
  report number, expense grid, row text, checkbox and attachment labels, and visible alert controls.
- [read-report-header](recipes/read-report-header.json) reads approval status,
  total and reimbursement and closes the header.
- [read-report-summary](recipes/read-report-summary.json) and
  [read-allocation-summary](recipes/read-allocation-summary.json) read the
  visible dialogs and close them.
- [verify-saved-expense](recipes/verify-saved-expense.json) checks an exact
  `expense-label` against the report. Reconcile any uncertain write this way
  before repeating it. Compare the resulting row and attachment with the
  receipt and intended coding.

## Enter a meal, taxi or hotel

1. [open-expense-form](recipes/open-expense-form.json) takes the exact
   `expense-type`, such as `Individual Meal & Tip`, `Taxi/Car Service`
   or `Lodging`.
2. Call [fill-meal](recipes/fill-meal.json), [fill-taxi](recipes/fill-taxi.json)
   or [fill-lodging](recipes/fill-lodging.json). The shared fields are
   `date` (MM/DD/YYYY), `purpose`, `merchant` and `amount`. Taxi uses
   `from` and `to`. Lodging uses `stay` (MM/DD/YYYY - MM/DD/YYYY).
   [choose-city](recipes/choose-city.json) takes the search `query` and
   the exact `city` option.
   [choose-meal-type](recipes/choose-meal-type.json) takes `meal-type`.
3. [fill-expense-note](recipes/fill-expense-note.json) takes `note`.
   [attach-expense-receipt](recipes/attach-expense-receipt.json) takes
   `receipt` with `name`, `mimeType` and `base64`. Use the runtime’s
   [attachment size and file rules](https://github.com/open-horizon-labs/browser-recipes/blob/main/docs/recipes.md#attachments).
4. Review currency, payment type, coding and the attachment.
   [save-expense](recipes/save-expense.json) checks the displayed `amount`
   and saves the expense. If Concur opens the correction prompt,
   [dismiss-save-correction](recipes/dismiss-save-correction.json) closes it
   before reconciliation. Itemize lodging after the parent row appears.

Example of inputs to preview a synthetic meal:

```json
{
  "report-number": "EXAMPLE",
  "date": "11/20/2026",
  "purpose": "Client travel",
  "merchant": "Example Cafe",
  "amount": "15.00"
}
```

## Itemize lodging

Use the hotel row label from the report with
[select-report-expense](recipes/select-report-expense.json). Keep only that
row selected. [open-lodging-itemizations](recipes/open-lodging-itemizations.json)
opens the lodging editor and returns the existing itemization grid.
[read-lodging-itemization-summary](recipes/read-lodging-itemization-summary.json)
reads the saved breakdown using the exact hotel `row-text`, including on an
approved report.
[open-itemization-form](recipes/open-itemization-form.json) takes the exact
`itemization-type`.

- [fill-room-rate](recipes/fill-room-rate.json) takes `room-rate-label` and
  `amount`. Fill the reviewed rates for the nights shown in the worksheet.
- [fill-tax-or-fee-itemization](recipes/fill-tax-or-fee-itemization.json)
  takes `date` and `amount`. For an Other fee, use
  [choose-fee-type](recipes/choose-fee-type.json) with `fee-type` and
  fill the comment.
- [save-itemization](recipes/save-itemization.json) writes the open
  itemization. Reopen the grid and check the saved rows against the folio.

The caller reconciles the room, tax and fees to the hotel total and checks
existing rows before opening another itemization.

## Import matched receipts

[read-add-expense-menu](recipes/read-add-expense-menu.json) returns exact
menu choices. Supply the available-expenses choice as `menu-label` to
[open-available-expenses](recipes/open-available-expenses.json).
[read-available-expenses](recipes/read-available-expenses.json) returns the
dialog contents and available checkbox labels. Match source date, merchant,
amount and receipt or trip evidence. Use the unique `available-label` with
[select-available-expense](recipes/select-available-expense.json), then
[import-selected-expenses](recipes/import-selected-expenses.json) to move the
single reviewed selection into the report. Repeat for other matched rows.
Audit the report after the move.

## Allocate an expense

Select one report row and call
[open-expense-allocations](recipes/open-expense-allocations.json). Its output
shows the existing split. Use
[open-new-allocation](recipes/open-new-allocation.json) to open a new split.
[choose-allocation-code](recipes/choose-allocation-code.json) takes the exact
`picker-label`, a search `code` and the exact displayed `option-label`.
[clear-inherited-allocation-field](recipes/clear-inherited-allocation-field.json)
takes the allocation field’s exact rendered `field-text` if an inherited
choice conflicts. [stage-allocation-row](recipes/stage-allocation-row.json)
adds the new split to the editor.

For existing splits,
[select-allocation-row](recipes/select-allocation-row.json) takes the exact
rendered `row-text`. [remove-selected-allocation](recipes/remove-selected-allocation.json)
removes the reviewed selection from the editor.
[set-allocation-percent](recipes/set-allocation-percent.json) takes
`row-text` and `percent`. Confirm the intended split totals 100%.
[save-expense-allocations](recipes/save-expense-allocations.json) takes
`reviewed-table`, the rendered allocation table, and `reviewed-percentages`,
a JSON array encoded as a string, such as `["60","40"]`. It verifies both the
rows and the percentages in display order before saving.
Reopen allocations to verify the result.

## Submit a reviewed report

[preview-submission](recipes/preview-submission.json) reads approval status,
total and the expense grid. Read the alerts and receipts before requesting
submission.

With explicit authorization for that report,
[start-submission](recipes/start-submission.json) checks the exact
`report-title` and verifies that the status is Not Submitted before clicking
Submit Report. That click can submit on some
Concur configurations. If Concur shows a review dialog, pass its exact
`reviewed-dialog` text to
[continue-submission-review](recipes/continue-submission-review.json) for
the Submit Report action or
[confirm-submission](recipes/confirm-submission.json) for Accept & Submit.
Review any agreement before invoking its confirmation. Read the approval
status afterward. Check the report before retrying a timed-out operation.

## Verification boundaries

The catalog uses explicit phases because recipes are ordered operations.
The caller supplies reviewed data and reconciles duplicates, totals and
state between phases. Site variations such as different field IDs, English
labels, tenant-specific approval prompts and unsupported upload controls
can stop a recipe. Commit phases must be tested on a disposable report
before treating them as verified for a tenant.
