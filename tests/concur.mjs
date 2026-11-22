// Run from the catalog with a built runtime and its integration dependencies.
import assert from 'node:assert/strict';
import { execFile as execFileCallback } from 'node:child_process';
import { once } from 'node:events';
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const execFile = promisify(execFileCallback);
const root = fileURLToPath(new URL('../', import.meta.url));
const runtime = path.resolve(process.env.BROWSER_RECIPES_RUNTIME ?? path.join(root, '../browser-recipes'));
const { chromium } = createRequire(path.join(runtime, 'integration/package.json'))('playwright-core');
const { stdout } = await execFile(process.execPath, [path.join(root, 'scripts/pack.mjs')]);
const adapter = JSON.parse(stdout).find(entry => entry.id === 'concur');
const fixture = await readFile(new URL('./fixtures/concur.html', import.meta.url));
const server = createServer((request, response) => {
  response.setHeader('Content-Type', 'text/html; charset=utf-8');
  if (request.url === '/nui/expense') {
    response.end('<main role="main"><h1 class="sapcnqr-toolbar__title">Manage Expenses</h1>' +
      '<section class="active-reports"><ul class="report-tiles-container"><li class="report-tile">' +
      '<a class="sapcnqr-grid-list-item__link" href="/">Example travel</a></li></ul></section></main>');
  } else response.end(fixture);
});
server.listen(0, '127.0.0.1');
await once(server, 'listening');
adapter.origin = 'http://127.0.0.1:' + server.address().port;
const stage = await mkdtemp(path.join(tmpdir(), 'concur-recipes-'));
const profile = path.join(stage, 'profile');
const extension = path.join(stage, 'extension');
const socketDirectory = path.join(stage, 'runtime');
const env = { ...process.env, XDG_RUNTIME_DIR: socketDirectory };
let browser;
try {
  await mkdir(socketDirectory, { mode: 0o700 });
  await cp(path.join(runtime, 'dist'), extension, { recursive: true });
  const manifestPath = path.join(extension, 'manifest.json');
  const manifest = JSON.parse(await readFile(manifestPath));
  manifest.host_permissions = ['http://127.0.0.1/*'];
  await writeFile(manifestPath, JSON.stringify(manifest));
  browser = await chromium.launchPersistentContext(profile, {
    channel: 'chromium', headless: true, executablePath: process.env.CHROMIUM_PATH,
    args: ['--load-extension=' + extension, '--disable-extensions-except=' + extension], env,
  });
  const worker = browser.serviceWorkers()[0] ?? await browser.waitForEvent('serviceworker', { timeout: 15000 });
  const extensionId = new URL(worker.url()).hostname;
  const hosts = path.join(profile, 'NativeMessagingHosts');
  await mkdir(hosts, { recursive: true });
  const cli = path.join(runtime, 'bridge/browser-recipes');
  await writeFile(path.join(hosts, 'org.openhorizonlabs.tab_recipes.json'), JSON.stringify({
    name: 'org.openhorizonlabs.tab_recipes', description: 'Concur fixture bridge', path: cli, type: 'stdio',
    allowed_origins: ['chrome-extension://' + extensionId + '/'],
  }));
  const options = await browser.newPage();
  await options.goto('chrome-extension://' + extensionId + '/' + manifest.options_ui.page);
  await options.locator('#catalog').fill(JSON.stringify([adapter]));
  await options.locator('#save').click();
  await options.getByText('Catalog saved.', { exact: true }).waitFor();
  await options.getByRole('button', { name: /Grant access/ }).click();
  await options.getByText('Site access granted.', { exact: true }).waitFor();
  await options.locator('#bridge').check();
  await options.waitForFunction(() => /^(Bridge open|Connected)$/.test(document.querySelector('#bridge-status').textContent));
  const target = await browser.newPage();
  await target.goto(adapter.origin);
  const foreground = await browser.newPage();
  await foreground.bringToFront();
  const call = async (command, args) => {
    try {
      const result = await execFile(cli, [command, JSON.stringify(args)], { env });
      return JSON.parse(result.stdout);
    } catch (error) {
      throw new Error(command + ' ' + (args?.recipeId ?? '') + ': ' + (error.stdout || error.stderr || error.message));
    }
  };
  const tab = (await call('tabs', {})).find(entry => entry.adapterIds.includes('concur'));
  assert.ok(tab);
  const active = () => worker.evaluate(async () => (await chrome.tabs.query({ active: true }))[0].id);
  const focused = await active();
  assert.notEqual(focused, tab.tabId);
  const checked = new Set();
  const run = async (recipeId, args = {}) => {
    const recipe = adapter.recipes.find(entry => entry.id === recipeId);
    const inputs = recipe.inputs?.['report-number'] ? { 'report-number': 'EXAMPLE', ...args } : args;
    const response = await call('run', { adapterId: 'concur', tabId: tab.tabId, recipeId, inputs });
    checked.add(recipeId);
    return response.outputs;
  };
  const label = (type, amount) => 'Select expense, ' + type + ', $' + amount + ', date, 11/20/2026';
  const meal = 'Individual Meal & Tip';
  const taxi = 'Taxi/Car Service';
  const fields = { date: '11/20/2026', purpose: 'Example business travel' };
  const state = () => target.evaluate(() => window.fixtureState);

  assert.equal((await run('first-expense-report-summary')).summary, 'Example travel');
  await target.goto(adapter.origin);
  assert.equal((await run('preview-submission')).status, 'Not Submitted');
  await run('open-expense-form', { 'expense-type': meal });
  await run('fill-meal', { ...fields, merchant: 'Example Cafe', amount: '10.00' });
  await run('choose-meal-type', { 'meal-type': 'Breakfast' });
  await run('choose-city', { query: 'Chicago', city: 'Chicago, Illinois' });
  assert.equal((await state()).city, 'Chicago, Illinois', 'use the exact search result rather than the recent copy');
  assert.equal((await state()).meal, 'Breakfast');
  await run('fill-expense-note', { note: 'Example meal' });
  await run('attach-expense-receipt', { receipt: { name: 'example.png', mimeType: 'image/png', base64: 'AA==' } });
  await assert.rejects(run('save-expense', { amount: '12.00' }), /ASSERTION_FAILED/);
  assert.equal((await state()).entries.length, 0);
  await run('save-expense', { amount: '10.00' });
  await run('verify-saved-expense', { 'expense-label': label(meal, '10.00') });
  assert.equal((await state()).entries[0].receipt, 'example.png');

  await run('open-expense-form', { 'expense-type': taxi });
  await run('fill-taxi', { ...fields, merchant: 'Example Taxi', amount: '15.00', from: 'Hotel', to: 'Airport' });
  await run('save-expense', { amount: '15.00' });
  await run('dismiss-save-correction');
  await run('verify-saved-expense', { 'expense-label': label(taxi, '15.00') });

  await run('open-expense-form', { 'expense-type': 'Lodging' });
  await run('fill-lodging', { ...fields, merchant: 'Example Hotel', amount: '120.00', stay: '11/20/2026 - 11/21/2026' });
  await run('save-expense', { amount: '120.00' });
  await run('select-report-expense', { 'expense-label': label('Lodging', '120.00') });
  await run('open-lodging-itemizations');
  await run('open-itemization-form', { 'itemization-type': 'Lodging' });
  await run('fill-room-rate', { 'room-rate-label': 'Room Rate for 11/20/2026', amount: '100.00' });
  await run('save-itemization');
  await run('open-itemization-form', { 'itemization-type': 'Lodging Tax (Not VAT)' });
  await run('fill-tax-or-fee-itemization', { date: fields.date, amount: '15.00' });
  await run('save-itemization');
  await run('open-itemization-form', { 'itemization-type': 'Other' });
  await run('fill-tax-or-fee-itemization', { date: fields.date, amount: '5.00' });
  await run('choose-fee-type', { 'fee-type': 'Other-Miscellaneous' });
  await run('fill-expense-note', { note: 'Example booking fee' });
  await run('save-itemization');
  assert.equal((await state()).itemizations.reduce((sum, entry) => sum + Number(entry.amount), 0), 120);
  assert.equal((await state()).fee, 'Other-Miscellaneous');

  await target.evaluate(() => document.querySelector('button[aria-label^="Report Number:"]').click());
  await run('close-report-dialog', { 'dialog-heading': 'Report Header' });
  // Return to the report using the fixture's equivalent of Concur's back navigation.
  await target.evaluate(() => report());
  const { rows } = await run('read-expense-report');
  const lodging = rows.find(row => row.text.includes('Example Hotel')).text;
  assert.match((await run('read-lodging-itemization-summary', { 'row-text': lodging })).itemizations, /\$100\.00/);

  const { choices } = await run('read-add-expense-menu');
  const available = choices.find(choice => choice.text.startsWith('Select from Available Expenses')).text;
  assert.match((await run('open-available-expenses', { 'menu-label': available }))['available-expenses'], /Example Ride/);
  const { 'available-labels': [availableRow] } = await run('read-available-expenses');
  const availableLabel = availableRow.attributes.label;
  await run('select-available-expense', { 'available-label': availableLabel });
  await run('import-selected-expenses', { 'available-label': availableLabel });
  await run('verify-saved-expense', { 'expense-label': label(taxi, '42.00') });
  assert.ok((await state()).imported);

  await run('select-report-expense', { 'expense-label': label(taxi, '42.00') });
  await run('open-expense-allocations');
  await run('open-new-allocation');
  await run('clear-inherited-allocation-field', { 'field-text': 'Internal Project' });
  await run('choose-allocation-code', { 'picker-label': 'Search filter options for Internal Project',
    code: 'EXAMPLE', 'option-label': 'Example Internal Project' });
  await run('choose-allocation-code', { 'picker-label': 'Search filter options for Work Package',
    code: 'WP1', 'option-label': 'Example Work Package' });
  await run('stage-allocation-row');
  let split = await target.locator('[aria-label="Allocations"] [role="row"]').innerText();
  await run('select-allocation-row', { 'row-text': split });
  await run('remove-selected-allocation');
  assert.equal((await state()).allocations.length, 0);
  await run('open-new-allocation');
  await run('choose-allocation-code', { 'picker-label': 'Search filter options for Internal Project',
    code: 'EXAMPLE', 'option-label': 'Example Internal Project' });
  await run('choose-allocation-code', { 'picker-label': 'Search filter options for Work Package',
    code: 'WP1', 'option-label': 'Example Work Package' });
  await run('stage-allocation-row');
  await run('open-new-allocation');
  await run('choose-allocation-code', { 'picker-label': 'Search filter options for Internal Project',
    code: 'EXAMPLE', 'option-label': 'Example Internal Project' });
  await run('choose-allocation-code', { 'picker-label': 'Search filter options for Work Package',
    code: 'WP2', 'option-label': 'Second Work Package' });
  await run('stage-allocation-row');
  const [firstSplit, secondSplit] = await target.locator('[aria-label="Allocations"] [role="row"]').allInnerTexts();
  await run('set-allocation-percent', { 'row-text': firstSplit, percent: '60' });
  await run('set-allocation-percent', { 'row-text': secondSplit, percent: '40' });
  const allocation = await target.locator('[aria-label="Allocations"]').innerText();
  await assert.rejects(run('save-expense-allocations', {
    'reviewed-table': allocation, 'reviewed-percentages': '["40","60"]',
  }), /ASSERTION_FAILED/);
  assert.deepEqual((await state()).allocations.map(entry => entry.percent), [0, 0], 'changed percentages never reach Save');
  await run('save-expense-allocations', { 'reviewed-table': allocation, 'reviewed-percentages': '["60","40"]' });
  assert.deepEqual((await state()).allocations.map(entry => entry.percent), [60, 40]);

  assert.match((await run('read-report-summary')).summary, /\$187\.00/);
  assert.match((await run('read-allocation-summary'))['allocation-summary'], /\$187\.00/);
  const preview = await run('preview-submission');
  assert.equal(preview.status, 'Not Submitted');
  assert.equal(preview.total, '187.00');
  const started = await run('start-submission', { 'report-title': preview.title });
  await assert.rejects(run('continue-submission-review', { 'reviewed-dialog': 'Unreviewed text' }), /TARGET_UNAVAILABLE/);
  await run('continue-submission-review', { 'reviewed-dialog': started['submission-review'] });
  const agreement = await target.getByRole('dialog').innerText();
  await run('confirm-submission', { 'reviewed-dialog': agreement });
  assert.equal((await run('read-report-header')).status, 'Submitted');
  await assert.rejects(run('start-submission', { 'report-title': preview.title }), /ASSERTION_FAILED/);
  await run('dismiss-report-dialog', { 'dialog-heading': 'Report Header' });
  assert.equal(await active(), focused);
  assert.deepEqual([...checked].sort(), adapter.recipes.map(recipe => recipe.id).sort());
  console.log('PASS ' + checked.size + ' Concur recipes through the native CLI in an inactive, disposable browser tab.');
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
  await rm(stage, { recursive: true, force: true });
}
