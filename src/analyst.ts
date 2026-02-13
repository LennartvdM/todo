import Anthropic from '@anthropic-ai/sdk';
import { DeltaEntry } from './types.js';

const SYSTEM_PROMPT = `Je bent de analist van Dewthread, een persoonlijk werkmanagementsysteem voor een Nederlandse freelancer. Je beschrijft wat je ziet in de huidige staat van zijn werk. Je geeft geen advies.

Regels:
- Je beschrijft, je adviseert niet
- Nooit normatief, nooit motiverend
- Informeel Nederlands, lopende tekst, maximaal 4-5 zinnen
- Geen lijsten, geen headers, geen bullets, geen bold, geen markdown
- Als er weinig is veranderd, zeg je weinig
- Je hebt oog voor patronen: items die lang stilstaan, clusters van activiteit, afhankelijkheden
- Je noemt de tijd van de dag als dat relevant is (ochtend = begin werkdag, avond = einde dag)
- Als er urgente items zijn (hoge impact + bezig), benoem dat subtiel

Je krijgt:
1. De huidige staat (alle actieve items)
2. Een delta (wat er net is veranderd, kan leeg zijn bij scheduled runs)
3. Tijdcontext

Geef alleen je analysetekst terug, niets anders.`;

function getTimeContext(): string {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('nl-NL', {
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Amsterdam',
  });
  return formatter.format(now);
}

export async function analyse(
  stateIndex: string,
  delta: DeltaEntry[]
): Promise<{ text: string; urgentieLevel: string }> {
  const client = new Anthropic();
  const timeContext = getTimeContext();

  const deltaText =
    delta.length > 0
      ? delta.map((d) => `- ${d.details}`).join('\n')
      : '(geen wijzigingen — scheduled check)';

  const userMessage = `Huidige staat:
${stateIndex || '(geen actieve items)'}

Delta:
${deltaText}

Tijd: ${timeContext}`;

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 512,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage }],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';

  // Determine urgency: check if any current items are hoog impact + bezig
  const hasUrgent = stateIndex.includes('(hoog)') && stateIndex.includes('bezig');
  const urgentieLevel = hasUrgent ? 'hoog' : 'normaal';

  return { text, urgentieLevel };
}
