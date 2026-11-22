# Forms and documents

**Form writes.** Declare each caller-supplied field in the recipe’s `inputs` and refer to it by name from a `fill` step. A field can display the new value while the app still holds the old one. Test a permitted write on a disposable record and check the app’s save confirmation or read back the stored value. If the intended task stops at a draft, leave submission to the user.

**Attachment downloads.** Inspect the actual link on a signed-in page. Give it a named target and declare its same-origin download path in the adapter’s `documentPaths`. Use an exact endpoint, or a directory with a trailing slash if filenames vary. The recipe’s `readAttachment` step must use a declared path as its `allowedPathPrefix`. For example, an adapter with a `receipt` target and `documentPaths` containing `/files/` can use this step:

```json
{ "op": "readAttachment", "target": "receipt", "allowedPathPrefix": "/files/", "as": "receipt" }
```

Check the result kind. Text PDFs and supported Office files can return Markdown; a scan or image can return file bytes as base64. Test with a synthetic document. If the app uses a cross-origin download or redirect, report the unsupported route. The runtime fetches in the tab’s session and rejects redirects.

**File uploads.** Declare an input with type `attachment` and use `attach` on the file input. Pass `name`, `mimeType`, and `base64` at run time. Check the app’s displayed filename or saved attachment. Document whether a later step submits the form. [Supported file types and limits](https://github.com/open-horizon-labs/browser-recipes/blob/main/docs/recipes.md#attachments)
