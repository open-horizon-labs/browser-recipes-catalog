# Browser Recipes Catalog

This is the community repository for the **Browser Recipes** extension. Each adapter describes an app and its controls, each recipe defines a task in that app, and a workflow can combine recipes across apps. The extension and CLI that run these definitions live in the companion repository. [Browser Recipes runtime and installation guide](https://github.com/open-horizon-labs/browser-recipes/blob/main/docs/getting-started.md)

Many browser apps have no Model Context Protocol (MCP) server for the task you need. You or your agent can work out the steps in the browser, but the next person faces the same questions. Which page do I open? Which control do I use? How do I check that it worked? With a computer-use tool, figuring that out can also tie up the active window and cursor.

Share the recipe you tested and the selectors it uses. The next person can run the same steps in their own signed-in session. When an app changes, contributors can update a shared selector in its adapter and test the recipes that use it.

## Features in the catalog

| Task | What you can install |
| --- | --- |
| Compare two calendars | Read an Outlook date range, compare it with Google Calendar, and preview missing time blocks. Choose which blocks to import. [Outlook to Google Calendar workflow](workflows/outlook-to-google-calendar.json) |
| Create a calendar event | Prepare a timed or all-day Google Calendar event, review it, and verify the saved event. [Timed event](workflows/create-timed-calendar-event.json) · [All-day event](workflows/create-all-day-calendar-event.json) |
| Work on a Concur expense report | Read the expense rows and report total, attach a receipt, or preview submission for a US2 report. Each task has its own recipe. [Concur recipes](adapters/concur/) |
| Find Hacker News stories on a topic | Read the first page of Front and New, then filter the titles and links with your own prompt. [Hacker News workflow](workflows/filter-hacker-news.json) |
| Check a mailbox | Read the first visible Gmail subject without opening the conversation, or get a summary of the first listed Outlook message. [Gmail recipe](adapters/gmail/recipes/first-visible-subject.json) · [Outlook recipe](adapters/outlook/recipes/first-message-summary.json) |

## Install from the community catalog

In Browser Recipes settings, choose **Browse community catalog**, select **Recipes**, **Adapters**, or **Workflows**, and search by app or task. Choose **Install** to add the item to your library, or **Update** for a newer definition. A recipe brings its adapter. An adapter includes all its published recipes. A workflow brings the recipes it calls, including verification steps and alternate app hosts. Grant access to the sites you want to run.

## Run a workflow

Open both calendars in the same browser profile in Week view. Enter the first and last day to compare when the workflow starts. In **Workflows**, choose [Copy Outlook events to Google Calendar](workflows/outlook-to-google-calendar.json). Review the two snapshots, choose what to send to the agent, and select the missing blocks you want to copy. Blocks are titled **Busy** by default, with an option to include titles.

Enter the exact destination calendar name. The workflow opens import settings in the selected Google tab and checks the account and calendar. Approve the separate import step to attach the file and click **Import**. A missing or unclear receipt calls for checking the destination week before trying again. [Outlook recipes](adapters/outlook/) · [Google Calendar recipes](adapters/google-calendar/)

[Filter Hacker News stories with ChatGPT](workflows/filter-hacker-news.json) reads the front page and New. Use **Additional instructions** to describe what you want to read, such as “Keep stories about browser automation and open-source developer tools.”

## Contributing

If Outlook changes a calendar control, update the selector in this catalog’s Outlook adapter. If your recipe needs a new operation that the extension cannot execute yet, propose it in the runtime repository. [Outlook adapter](adapters/outlook/adapter.json) · [Runtime repository](https://github.com/open-horizon-labs/browser-recipes)

In an agent session opened in this checkout, use `$browser-recipes-author` to add an adapter or recipe. For example, “Use `$browser-recipes-author` to add a recipe that reads the title of the current issue in our tracker.” [Contributor skill](.agents/skills/browser-recipes-author/SKILL.md)

Find the directory for the app’s origin after sign-in. [Browse adapters](adapters)

- **Existing app.** Add a file named `recipes/<recipe-id>.json` and document the starting page, inputs, and result in the app’s README. Check `adapter.json` for selectors you can reuse.
- **New app.** Create `adapters/<app-id>/` with a README, an `adapter.json`, and a `recipes/` directory. Put the ID, title, exact origin, and shared selectors in `adapter.json`. You can leave `recipes/` empty while inspecting the site. [Gmail example](adapters/gmail/)
- **Cross-app workflow.** Put an ordered definition in `workflows/<workflow-id>.json`. Reference installed adapters and recipes, use a built-in transform for deterministic data handling, and mark application writes with `effect: "write"`. [Workflow authoring](docs/workflows.md)

After editing the source files, rebuild the catalog served to the extension and include it in your commit. CI checks that it matches the source definitions.

```sh
node scripts/pack.mjs > distribution/catalog.json
```

## Example: add a recipe for Ask HN

The Hacker News adapter already defines `story-links` for the front page and newest submissions. To try it on Ask HN, navigate to `/ask`, read the same target, and check the result against the page.

1. **Load your working catalog.** Install the extension and CLI. With the two repositories side by side, run the packer from the catalog root. In extension settings, open **Installed library**, choose the resulting file, review the changes, and click **Install changes**. Grant the app’s origin and enable developer tools. Imports update matching IDs and preserve other installed definitions. The packer normally emits both. Use `--adapters-only` for extension versions that accept only an adapter array. [Runtime setup](https://github.com/open-horizon-labs/browser-recipes/blob/main/docs/getting-started.md)

   ```sh
   node scripts/pack.mjs > /tmp/browser-recipes-catalog.json
   ```

2. **Inspect a tab and try a draft.** Open Hacker News. From the catalog root, run `../browser-recipes/bridge/browser-recipes tabs`. Use the Hacker News tab ID wherever `123` appears below. The first command lists page controls and same-origin links. The second runs the draft.

   ```sh
   ../browser-recipes/bridge/browser-recipes dev.inspect '{"tabId":123,"adapterId":"hacker-news"}'
   ../browser-recipes/bridge/browser-recipes dev.test - <<'JSON'
   {
     "tabId": 123,
     "adapterId": "hacker-news",
     "recipe": {
       "id": "ask-stories",
       "title": "Read Ask HN stories",
       "steps": [
         { "op": "navigate", "path": "/ask" },
         { "op": "readList", "target": "story-links", "attributes": ["href"], "as": "stories" }
       ]
     },
     "inputs": {}
   }
   JSON
   ```

3. **Test the installed recipe.** Compare `outputs.stories` with the titles and links on the Ask page. Save the inner `recipe` object as `adapters/hacker-news/recipes/ask-stories.json`. Choose that recipe file under **Installed library**, select its adapter, and click **Install changes**. Turn developer tools off, bring another tab to the foreground, and run the recipe again.

   ```sh
   ../browser-recipes/bridge/browser-recipes run '{"tabId":123,"adapterId":"hacker-news","recipeId":"ask-stories","inputs":{}}'
   ```

Test writes on disposable records and read back the saved value. For attachment downloads, declare the endpoint or directory in `documentPaths`. [Recipe format](https://github.com/open-horizon-labs/browser-recipes/blob/main/docs/recipes.md)

## Open a pull request

Include the recipe file, the app README, and any changed selectors. Say where and when you tested, what you expected, and what you observed. Mention conditions another tester will need, such as an English interface or a folder with at least one message. Use synthetic examples. Omit account details, page captures, and attachment contents. [Live test results](docs/live-apps.md)

For a fix, identify the catalog revision and failed step. Rerun each recipe that uses the changed selector. If the failed recipe wrote data, check what the app saved before retrying.

Use a current Browser Recipes checkout for the full catalog. The Concur adapter
uses the runtime capabilities listed in its [README](adapters/concur/).
[Apache-2.0 license](LICENSE)
