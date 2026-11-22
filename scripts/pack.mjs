// Assemble the directory-based sources into the extension's catalog format.
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const adaptersRoot = fileURLToPath(new URL('../adapters/', import.meta.url));
const workflowsRoot = fileURLToPath(new URL('../workflows/', import.meta.url));
const flags = process.argv.slice(2);
if (flags.length > 1 || flags.some(flag => flag !== '--adapters-only')) {
  throw new Error('Usage: node scripts/pack.mjs [--adapters-only]');
}

async function readDefinition(path, expectedId) {
  const definition = JSON.parse(await readFile(path, 'utf8'));
  if (definition.id !== expectedId) {
    throw new Error(`Expected ID "${expectedId}" in ${path}`);
  }
  return definition;
}

async function packAdapter(id) {
  const directory = join(adaptersRoot, id);
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

const entries = await readdir(adaptersRoot, { withFileTypes: true });
const names = entries.filter(entry => entry.isDirectory()).map(entry => entry.name).sort();
const adapters = await Promise.all(names.map(packAdapter));
if (flags.includes('--adapters-only')) {
  console.log(JSON.stringify(adapters, null, 2));
} else {
  const files = (await readdir(workflowsRoot, { withFileTypes: true }))
    .filter(entry => entry.isFile() && entry.name.endsWith('.json')).map(entry => entry.name).sort();
  const workflows = await Promise.all(files.map(name =>
    readDefinition(join(workflowsRoot, name), name.slice(0, -5))));
  console.log(JSON.stringify({ adapters, workflows }, null, 2));
}
