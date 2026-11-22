# New adapter files

Work from the catalog checkout. Directory names and JSON filenames must match their IDs. Use lowercase letters, digits, and hyphens, starting with a letter.

```text
adapters/issue-tracker/
  README.md
  adapter.json
  recipes/
    read-issue-title.json
```

The following synthetic example assumes a ticket page with a single visible `h1` inside `main`. Substitute an observed origin and selector when authoring for a real app.

`adapter.json`

```json
{
  "id": "issue-tracker",
  "title": "Issue Tracker",
  "origin": "https://issues.example.com",
  "targets": { "issue-title": "main h1" }
}
```

`recipes/read-issue-title.json`

```json
{
  "id": "read-issue-title",
  "title": "Read the current issue title",
  "steps": [
    { "op": "read", "target": "issue-title", "as": "title" }
  ]
}
```

The README for this example would tell the caller to open an issue and read `outputs.title`. Keep recipe objects in individual files. The packer adds the `recipes` array when building the import file. To inspect a new app before writing any recipes, create its `recipes/` directory and leave it empty for the first local import.

For a maintained example of two recipes using the same target, inspect `adapters/hacker-news/` in the checkout.
