import 'dotenv/config';
import * as readline from 'readline';
import { handleInput } from './chat.js';
import { startScheduler } from './schedule.js';
import { closeDriver } from './graph.js';

async function main(): Promise<void> {
  console.log('Dewthread v8 gestart. Typ wat er in je hoofd zit...');
  console.log('(Ctrl+C om te stoppen)\n');

  startScheduler();

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '> ',
  });

  rl.prompt();

  rl.on('line', async (line) => {
    const input = line.trim();
    if (!input) {
      rl.prompt();
      return;
    }

    try {
      const { humanResponse, analysis } = await handleInput(input);
      if (humanResponse) {
        console.log(`\n${humanResponse}\n`);
      }
      console.log(`${analysis}\n`);
    } catch (err) {
      console.error('Fout:', err instanceof Error ? err.message : err);
    }

    rl.prompt();
  });

  rl.on('close', async () => {
    console.log('\nDewthread afgesloten.');
    await closeDriver();
    process.exit(0);
  });
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
