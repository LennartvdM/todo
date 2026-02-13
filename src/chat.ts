import { getStateIndex, createSessie, linkAnalyse } from './graph.js';
import { parse } from './parser.js';
import { resolve } from './resolver.js';
import { analyse } from './analyst.js';
import { sendEmail } from './email.js';
import { ChatResult } from './types.js';

export async function handleInput(userInput: string): Promise<ChatResult> {
  // 1. Read current state
  const stateIndex = await getStateIndex();

  // 2. Parse user input into operations
  const { operations, humanResponse } = await parse(stateIndex, userInput);

  // 3. Create session
  const sessieTimestamp = await createSessie('chat', userInput);

  // 4. Resolve operations to graph writes
  const delta = await resolve(operations, sessieTimestamp);

  // 5. Read updated state for analyst
  const updatedState = await getStateIndex();

  // 6. Run analyst
  const { text: analysis, urgentieLevel } = await analyse(updatedState, delta);

  // 7. Link analysis to session
  await linkAnalyse(sessieTimestamp, analysis, urgentieLevel);

  // 8. Send email
  await sendEmail(humanResponse, analysis, urgentieLevel);

  return { humanResponse, analysis };
}
