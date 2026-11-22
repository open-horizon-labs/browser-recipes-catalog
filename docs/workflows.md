# Contributing a workflow

Place a workflow in `workflows/<id>.json`. The file name matches its `id`. The packer combines the definitions with the tab adapters. Import the packed catalog into Browser Recipes to test.

- Declare each tab in `tabs` with its `adapterId` and display `label`. Use `alternatives` to list compatible adapter IDs for sites served under different exact origins. Every candidate must support the referenced recipe and inputs. Choose a specific signed-in tab for each role when running.
- Use `op: "recipe"` with the tab key, installed `recipeId` and `effect`. Mark a recipe that writes to an app as `effect: "write"` so the runner can ask for approval.
- Use `op: "agent"` for interpretation through the runner’s Sign in with ChatGPT connection. Write a fixed `instruction` that describes the expected result and treats page content as untrusted data. Use named `inputs` to pass only the information needed.
- Use `op: "transform"` with a built-in `transform` for deterministic operations. Argument references point to earlier step IDs and output fields, such as `read-front.headline`. A field entered in an earlier step is available through `step-id.$fields.field-id`. A transform marked `select: true` exposes the checked values through `step-id.$selected`.
- Provide a receipt for writes when the app offers one. If an attempted write has an uncertain outcome, verify the destination before retrying. Test the write on fixture or disposable data.

See the [read-only headlines comparison](../workflows/compare-hacker-news.json) and the [calendar workflow](../workflows/outlook-to-google-calendar.json) for examples. Add runtime transforms in the [Browser Recipes runtime repository](https://github.com/open-horizon-labs/browser-recipes).

For repeated writes, set `repeat.items` to a prior result array and map item properties onto recipe inputs with `repeat.map`. Each item has its own approval and checkpoint. A `repeat.verify` can name a read-only recipe, its inputs, an output field and the expected value. An uncertain write stays pending review until the user checks it.

For a decision a person must make in the app, use a step with `op: "handoff"`, a specific `label`, and one or more stable `tags`. Supply the tab role and named outputs needed to recognize the item. The run pauses until the person resumes it. The [Concur draft submission workflow](../workflows/review-draft-submission.json) uses the tag `draft-submission` so a reviewer can find those requests in the queue. Completion of the handoff records the reviewer's acknowledgement. Concur is the source of the submission receipt.

Publish stable caller names through the workflow’s top-level `inputs` and `outputs` objects. Each input maps to a declared field using `step-id.field-name`. For example, callers pass `calendarName` to fill `choose-destination.calendar-name` in the Outlook calendar workflow. Each output maps to a step result. The calendar workflow returns `receipt` from `apply-import.receipt`. The headlines workflow exposes `left`, `right` and `equal` from its comparison.

Use the optional positive integer `onboardingOrder` to feature a workflow in the community installer. Lower numbers appear first. Workflows without an order remain available through browsing and search.
