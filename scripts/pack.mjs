// Assemble the directory-based sources into the extension's catalog format.
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../adapters/', import.meta.url));

async function readDefinition(path, expectedId) {
  const definition = JSON.parse(await readFile(path, 'utf8'));
  if (definition.id !== expectedId) {
    throw new Error(`Expected ID "${expectedId}" in ${path}`);
  }
  return definition;
}

async function packAdapter(id) {
  const directory = join(root, id);
  const adapter = await readDefinition(join(directory, 'adapter.json'), id);
  if (Object.hasOwn(adapter, 'recipes')) {
    throw new Error(`Place recipes for ${id} in its recipes/ directory`);
  }
  const recipesDir = join(directory, 'recipes');
  const files = (await readdir(recipesDir)).filter(name => name.endsWith('.json')).sort();
  const recipes = await Promise.all(files.map(name =>
    readDefinition(join(recipesDir, name), name.slice(0, -5))));
  return { ...adapter, recipes };
}

const entries = await readdir(root, { withFileTypes: true });
const names = entries.filter(entry => entry.isDirectory()).map(entry => entry.name).sort();
console.log(JSON.stringify(await Promise.all(names.map(packAdapter)), null, 2));
