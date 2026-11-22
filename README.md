# Tab Recipes community catalog

Each JSON file in [adapters](adapters) describes one browser app. An adapter owns its site's origin, named controls, attachment paths and recipes. Scripts and agents call the same recipe by ID through the [Tab Recipes runtime](https://github.com/open-horizon-labs/tab-recipes).

## Try the catalog

From this repository, run `node scripts/pack.mjs > /tmp/tab-recipes-catalog.json`. Paste the resulting JSON array into the runtime's catalog importer. Grant access to the sites you use. To import just one adapter, enclose its JSON object in an array.

* **Workshop** runs on your machine. Serve it with `python3 -m http.server 8765 --bind 127.0.0.1 --directory demo` and open `http://127.0.0.1:8765/`. Recipes navigate to a support ticket, save a response and read the stored value, or download the ticket's dispatch note. Changes stay in that tab's session storage.
* **Hacker News** reads the leading headline from the front page or the newest submissions. Both recipes share one named control.

See [live app notes](docs/live-apps.md) for the mail and expense adapters and their verification status.

## Contributing

1. Start with a concrete task and an observable outcome. Specify which page and signed-in state it needs, what the recipe changes, and the result the caller can check.
2. Add an adapter file with an exact origin. Centralize shared selectors under `targets` and reference them by name from the steps. Separate reading a form from submitting a transaction when users need to review it.
3. In extension authoring mode, inspect a disposable test tab, run a draft, and replay the imported recipe with another tab in front. Include a check for app state after a write. For attachments, declare only the download path needed by the task.
4. In your pull request describe the page variants tested, test date, inputs, expected output shape and any unsupported states. Use synthetic examples. Omit real account names, message subjects, URLs containing tokens and attachment contents.
5. Run `node scripts/pack.mjs` before submitting. Reimport the pack with a compatible runtime to exercise its full validator. Corrections to a site's controls belong here. Changes to interpreter operations belong in the runtime.

This catalog targets the Tab Recipes 0.1 runtime. The catalog and runtime are distributed under Apache-2.0.
