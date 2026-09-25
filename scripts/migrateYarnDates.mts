import { readFileSync } from 'node:fs';
import { migrateYarnDates } from '../src/tabs/ThisYear/YarnTracking/migrateYarnDates.ts';

const [exportPath] = process.argv.slice(2);

if (!exportPath) {
  console.error('Usage: node scripts/migrateYarnDates.mts <yarn-export.json>');
  process.exit(1);
}

const yarn = JSON.parse(readFileSync(exportPath, 'utf8'));

console.log(JSON.stringify(migrateYarnDates(yarn), null, 2));
