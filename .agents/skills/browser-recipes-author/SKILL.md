---
name: browser-recipes-author
description: Add an app adapter or one or more deterministic recipes to Browser Recipes Catalog. Use for site discovery, drafting recipe JSON, and checking replay against an open browser tab.
---

# Author a Browser Recipes contribution

Start with the task someone will call. Identify the starting page, inputs, expected output, and any changes to the signed-in account. For multiple tasks on one origin, use one adapter and give each independently callable task its own recipe.

1. **Find the app.** From the catalog root, inspect `adapters/*/adapter.json` for the exact origin after sign-in. Read only the matching adapter, its README, and recipes that use relevant controls. For a new origin, create the files in [Catalog layout](references/catalog-layout.md).
2. **Discover one flow.** Follow [Discovery and replay](references/discovery-and-replay.md) to inspect the selected tab. Check the relevant link, control, and result in the page. Use observed selectors and share them under names in the adapter’s `targets`. If browser access is unavailable, use any supplied page evidence and state which behavior still needs a live check.
3. **Draft the recipe.** Write the ordered operations and name the outputs a caller will read. Use the runtime’s [recipe format](https://github.com/open-horizon-labs/browser-recipes/blob/main/docs/recipes.md) when choosing operations or input types. For forms, file uploads, and authenticated downloads, read [Writes and attachments](references/writes-and-attachments.md).
4. **Verify the installed files.** Pack the catalog, validate it, and replay each new recipe with another tab in front. If you changed a shared target, rerun existing recipes that use it. Update the app README with the use case, starting state, inputs, outputs, side effects, and links to the recipes. Report which checks passed and what you could only verify from source.

For tasks that use several recipes, follow [Workflow authoring](../../../docs/workflows.md) to declare the tabs, pass outputs between steps, and specify where the user reviews a write.

Keep page captures, account data, and attachment contents out of the contribution. A synthetic example and the observed result shape are enough for review.
