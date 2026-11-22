# Discover a flow and test replay

Run commands from the catalog root. These examples assume the runtime checkout is next to it. Use the installed CLI path if it differs. [Runtime setup](https://github.com/open-horizon-labs/browser-recipes#first-run-on-linux)

## Load the adapter

```sh
node scripts/pack.mjs > /tmp/browser-recipes-catalog.json
```

Packing checks the file layout and IDs. **Install changes** in extension settings validates selectors’ target names, inputs, and operations against the runtime schema. Imports merge by ID. For a standalone recipe file, choose its owning adapter. Grant the exact site origin, enable the local bridge and developer tools, and open the app.

For an offline schema check with the runtime checkout present:

```sh
node --input-type=module -e '
  import { readFileSync } from "node:fs";
  import { validateBundle } from "../browser-recipes/extension/workflow.js";
  validateBundle(JSON.parse(readFileSync("/tmp/browser-recipes-catalog.json", "utf8")));
'
```

## Inspect only the relevant tab

```sh
cli=../browser-recipes/bridge/browser-recipes
"$cli" tabs
"$cli" dev.inspect '{"adapterId":"issue-tracker","tabId":123}'
```

Replace the example IDs with the installed adapter ID and a tab ID returned by `tabs`. Look for same-origin navigation, a selector matching one intended element, and a result the caller can check. No Chrome remote debugging is required.

## Test the draft, then the installed recipe

After adding named targets to `adapter.json`, install the updated adapter file so `dev.test` can resolve them. The draft command takes the recipe object itself. This example uses `jq` to build a request from the file, avoiding a second copy of the steps.

```sh
jq -n --argjson tab 123 --arg adapter issue-tracker \
  --slurpfile draft adapters/issue-tracker/recipes/read-issue-title.json \
  '{tabId:$tab,adapterId:$adapter,recipe:$draft[0],inputs:{}}' |
  "$cli" dev.test -
```

Supply synthetic values for any required inputs. Compare named outputs with the page. Pack and import the final files, turn off developer tools, select a different foreground tab, and run the installed recipe.

```sh
"$cli" run '{"tabId":123,"adapterId":"issue-tracker","recipeId":"read-issue-title","inputs":{}}'
```

On failure, inspect the reported step number, operation, and target. With developer tools enabled, `dev.failures` returns recent failure records. If the recipe wrote data, check what the app saved before retrying.
