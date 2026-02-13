import {
  getCurrentVersions,
  createVersion,
  evolveVersion,
  updateVersionProperties,
  archiveVersion,
  linkVersionToSessie,
} from './graph.js';
import { Operation, DeltaEntry, Version } from './types.js';

function isIdentityChange(fields: Record<string, unknown>): boolean {
  return 'naam' in fields || 'beschrijving' in fields;
}

export async function resolve(
  operations: Operation[],
  sessieTimestamp: string
): Promise<DeltaEntry[]> {
  const versions = await getCurrentVersions();
  const delta: DeltaEntry[] = [];

  for (const op of operations) {
    switch (op.op) {
      case 'create': {
        const newId = await createVersion(op.fields);
        await linkVersionToSessie(newId, sessieTimestamp);
        delta.push({
          type: 'created',
          naam: op.fields.naam,
          details: `Nieuw item: ${op.fields.naam} [${op.fields.domein}] — ${op.fields.status} (${op.fields.impact})`,
        });
        break;
      }

      case 'update': {
        const refIndex = op.ref - 1;
        if (refIndex < 0 || refIndex >= versions.length) {
          console.error(`Resolver: invalid ref ${op.ref}, skipping`);
          continue;
        }
        const target = versions[refIndex] as Version;

        if (isIdentityChange(op.fields)) {
          const mutationType = op.fields.naam ? 'rename' : 'redefine';
          const newId = await evolveVersion(target.id, op.fields, mutationType);
          await linkVersionToSessie(newId, sessieTimestamp);
          delta.push({
            type: 'evolved',
            naam: op.fields.naam ?? target.naam,
            details: `${target.naam} → ${op.fields.naam ?? target.naam}: ${mutationType}`,
          });
        } else {
          await updateVersionProperties(target.id, op.fields);
          await linkVersionToSessie(target.id, sessieTimestamp);
          const changes = Object.entries(op.fields)
            .map(([k, v]) => `${k}: ${v}`)
            .join(', ');
          delta.push({
            type: 'updated',
            naam: target.naam,
            details: `${target.naam} bijgewerkt: ${changes}`,
          });
        }
        break;
      }

      case 'archive': {
        const refIndex = op.ref - 1;
        if (refIndex < 0 || refIndex >= versions.length) {
          console.error(`Resolver: invalid ref ${op.ref}, skipping`);
          continue;
        }
        const target = versions[refIndex] as Version;
        await archiveVersion(target.id);
        await linkVersionToSessie(target.id, sessieTimestamp);
        delta.push({
          type: 'archived',
          naam: target.naam,
          details: `${target.naam} gearchiveerd`,
        });
        break;
      }
    }
  }

  return delta;
}
