// Emit the JSON array accepted by the extension's catalog importer.
import { readFile, readdir } from 'node:fs/promises';
const dir = new URL('../adapters/', import.meta.url);
const files = (await readdir(dir)).filter(name => name.endsWith('.json')).sort();
const adapters = await Promise.all(files.map(name =>
  readFile(new URL(name, dir), 'utf8').then(JSON.parse)));
if (new Set(adapters.map(adapter => adapter.id)).size !== adapters.length) {
  throw new Error('Adapter IDs must be unique across the catalog.');
}
console.log(JSON.stringify(adapters, null, 2));
