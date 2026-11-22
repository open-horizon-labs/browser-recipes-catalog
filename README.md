# Tab Recipes community catalog

If you know how to do a task in a browser app, you can teach it to someone else’s script. You and an LLM can explore the app in your own browser, give the relevant controls names, and write down the steps that produce a useful result. A contribution here lets another person run those steps in their own tab, with their own account, while they keep working. A script and an LLM can call the same recipe by ID.

## Contributing

Start with one task you already do. “Read the first active expense report in Concur” gives you a starting page, a record to find, and a result to check. The Concur recipe opens Manage Expenses, checks the heading, and reads the first report card into an output called `summary`. You can inspect the whole contribution in one file. [Concur adapter](adapters/concur.json)

Look in the [adapters directory](adapters) for the exact origin you use, including the host you land on after signing in.

- **The app is already here.** Add a recipe to its `recipes` array. Reuse a named target when it identifies the control you need. On Hacker News, the front page and newest submissions share a layout, so both recipes read `first-headline`. If the markup changes, one selector fixes both. [Hacker News adapter](adapters/hacker-news.json)
- **You’re bringing a new app or origin.** Create `adapters/<app-id>.json` with an ID, a title, the exact origin and an empty `recipes` array. That’s enough to import the adapter and start discovery. Add entries to `targets` as you identify controls. The Gmail adapter implements its first recipe with one target and one read. [Gmail adapter](adapters/gmail.json)

## Try a contribution in your browser

Suppose you want the leading headline on Ask HN. The existing Hacker News adapter already knows how to read a headline. You need to check whether that target works on the Ask page and, if it does, give the new route a recipe ID.

1. **Load your working catalog.** Set up the Chromium extension and Linux CLI, with the runtime and catalog checked out side by side. From the catalog root, run the command below. In extension settings, load the resulting file, choose **Save catalog**, grant the app’s origin, and enable developer tools. Saving replaces your local adapter list, so include any private adapters you want to keep. [Runtime setup](https://github.com/open-horizon-labs/tab-recipes#first-run-on-linux)

   ```sh
   node scripts/pack.mjs > /tmp/tab-recipes-catalog.json
   ```

2. **Inspect a tab and try a draft.** Open Hacker News. From the catalog root, run `../tab-recipes/bridge/tab-recipes tabs`. Use the Hacker News tab ID wherever `123` appears below. With `dev.inspect`, you or your agent can find same-origin links and controls on the page. With `dev.test`, you can run the proposed steps before adding them to the catalog.

   ```sh
   ../tab-recipes/bridge/tab-recipes dev.inspect '{"tabId":123,"adapterId":"hacker-news"}'
   ../tab-recipes/bridge/tab-recipes dev.test - <<'JSON'
   {
     "tabId": 123,
     "adapterId": "hacker-news",
     "recipe": {
       "id": "ask-headline",
       "title": "Read the leading Ask HN headline",
       "steps": [
         { "op": "navigate", "path": "/ask" },
         { "op": "read", "target": "first-headline", "as": "headline" }
       ]
     },
     "inputs": {}
   }
   JSON
   ```

3. **Replay what you plan to share.** Compare `outputs.headline` with the leading title on the Ask page. Copy the inner `recipe` object into the adapter’s `recipes` array. Pack and save the catalog again. Turn developer tools off, bring another tab to the foreground, and call the installed recipe as a script would.

   ```sh
   ../tab-recipes/bridge/tab-recipes run '{"tabId":123,"adapterId":"hacker-news","recipeId":"ask-headline","inputs":{}}'
   ```

For a recipe that writes data, test on a disposable record. Read back the saved value or check the app’s confirmation so the caller can tell whether the write took effect. For a recipe that downloads an attachment, declare the same-origin endpoint or directory it needs in `documentPaths`. [Recipe format and attachment operations](https://github.com/open-horizon-labs/tab-recipes/blob/main/docs/recipes.md)

## Open a pull request

Commit the adapter JSON. In the PR, tell the reviewer which task it handles, where to start, what inputs it accepts, what it changes, and how to recognize success. Include the test date and any layout, locale, or account state that mattered. A reviewer with an empty inbox should know whether an empty result or a missing-target error is expected. Use synthetic values for examples and keep account data, private page captures, and attachment contents out of the PR. [Live checks for Gmail, Outlook, and Concur](docs/live-apps.md)

A repair is a contribution too. If an existing recipe fails, keep the installed catalog revision and the error’s step number, operation, and target name. Inspect the control on the changed page, patch the adapter, and replay each recipe that uses that target. If a write failed partway through, check what the app saved before retrying. Changes that require a new interpreter operation belong in the [runtime repository](https://github.com/open-horizon-labs/tab-recipes).

This catalog targets Tab Recipes 0.1 and uses the [Apache-2.0 license](LICENSE).
