import cron from 'node-cron';
import { getStateIndex, createSessie, linkAnalyse } from './graph.js';
import { analyse } from './analyst.js';
import { sendEmail } from './email.js';

async function scheduledRun(): Promise<void> {
  try {
    console.log('[schedule] Scheduled run gestart...');

    const stateIndex = await getStateIndex();
    const sessieTimestamp = await createSessie('scheduled', 'Geplande check');
    const { text: analysis, urgentieLevel } = await analyse(stateIndex, []);
    await linkAnalyse(sessieTimestamp, analysis, urgentieLevel);
    await sendEmail(null, analysis, urgentieLevel);

    console.log('[schedule] Scheduled run klaar.');
  } catch (err) {
    console.error('[schedule] Fout bij scheduled run:', err);
  }
}

export function startScheduler(): void {
  // 08:00 and 21:00 Europe/Amsterdam
  cron.schedule('0 8 * * *', scheduledRun, { timezone: 'Europe/Amsterdam' });
  cron.schedule('0 21 * * *', scheduledRun, { timezone: 'Europe/Amsterdam' });

  console.log('[schedule] Cron ingepland: 08:00 en 21:00 (Europe/Amsterdam)');
}
