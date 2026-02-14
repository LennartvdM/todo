import 'dotenv/config';
import { parse } from '../src/parser';

const stateIndex = `1. [klantwerk] BFM team crawler — bezig (midden) — ~750 namen van Wikipedia
2. [klantwerk] Neoflix migratie — bezig (midden) — Webflow → React
3. [projecten] Dewthread v8 — bezig (hoog) — CLI tool voor persoonlijk werkbeheer`;

const input = 'Neoflix migratie is eigenlijk meer een rebuild geworden';

(async () => {
  const result = await parse(stateIndex, input);
  console.log(JSON.stringify(result, null, 2));
})();
