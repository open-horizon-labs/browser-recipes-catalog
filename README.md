# Tab Recipes community catalog

This catalog contains JSON recipes for browser apps. Each recipe lists the steps for one task. The app’s adapter defines the site origin and the CSS selectors those steps use. After importing the catalog, a user can run a recipe by ID from a script or an LLM client. The extension executes it in the user’s open tab.

## Contributing

Find the directory for the app’s origin after sign-in. [Browse adapters](adapters)

- **Existing app.** Add a file named `recipes/<recipe-id>.json` and document the starting page, inputs, and result in the app’s README. Check `adapter.json` for selectors you can reuse.
- **New app.** Create `adapters/<app-id>/` with a README, an `adapter.json`, and a `recipes/` directory. Put the ID, title, exact origin, and shared selectors in `adapter.json`. You can leave `recipes/` empty while inspecting the site. [Gmail example](adapters/gmail/)

## Example: add a recipe for Ask HN

The Hacker News adapter already defines `first-headline` for the front page and newest submissions. To try it on Ask HN, navigate to `/ask`, read the same target, and check the result against the page.

1. **Load your working catalog.** Install the extension and CLI. With the two repositories side by side, run the packer from the catalog root. In extension settings, load the resulting file, choose **Save catalog**, grant the app’s origin, and enable developer tools. Saving replaces your local adapter list, so include any private adapters you want to keep. [Runtime setup](https://github.com/open-horizon-labs/tab-recipes#first-run-on-linux)

   ```sh
   node scripts/pack.mjs > /tmp/tab-recipes-catalog.json
   ```

2. **Inspect a tab and try a draft.** Open Hacker News. From the catalog root, run `../tab-recipes/bridge/tab-recipes tabs`. Use the Hacker News tab ID wherever `123` appears below. The first command lists page controls and same-origin links. The second runs the draft.

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

3. **Test the installed recipe.** Compare `outputs.headline` with the leading title on the Ask page. Save the inner `recipe` object as `adapters/hacker-news/recipes/ask-headline.json`. Pack and save the catalog again. Turn developer tools off, bring another tab to the foreground, and run the recipe again.

   ```sh
   ../tab-recipes/bridge/tab-recipes run '{"tabId":123,"adapterId":"hacker-news","recipeId":"ask-headline","inputs":{}}'
   ```

Test writes on disposable records and read back the saved value. For attachment downloads, declare the endpoint or directory in `documentPaths`. [Recipe format](https://github.com/open-horizon-labs/tab-recipes/blob/main/docs/recipes.md)

## Open a pull request

Include the recipe file, the app README, and any changed selectors. Say where and when you tested, what you expected, and what you observed. Mention conditions another tester will need, such as an English interface or a folder with at least one message. Use synthetic examples. Omit account details, page captures, and attachment contents. [Live test results](docs/live-apps.md)

For a fix, identify the catalog revision and failed step. Rerun each recipe that uses the changed selector. If the failed recipe wrote data, check what the app saved before retrying. Propose new interpreter operations in the [runtime repository](https://github.com/open-horizon-labs/tab-recipes).

Compatible with Tab Recipes 0.1. [Apache-2.0 license](LICENSE)
