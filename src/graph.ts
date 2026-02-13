import neo4j, { Driver, Session } from 'neo4j-driver';
import { Version, VersionFields } from './types.js';

let driver: Driver;

export function getDriver(): Driver {
  if (!driver) {
    const uri = process.env.NEO4J_URI;
    const user = process.env.NEO4J_USER;
    const password = process.env.NEO4J_PASSWORD;

    if (!uri || !user || !password) {
      throw new Error('Missing NEO4J_URI, NEO4J_USER, or NEO4J_PASSWORD in .env');
    }

    driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
  }
  return driver;
}

export async function closeDriver(): Promise<void> {
  if (driver) {
    await driver.close();
  }
}

async function withSession<T>(fn: (session: Session) => Promise<T>): Promise<T> {
  const session = getDriver().session();
  try {
    return await fn(session);
  } finally {
    await session.close();
  }
}

export async function runQuery(
  cypher: string,
  params?: Record<string, unknown>
): Promise<Record<string, unknown>[]> {
  return withSession(async (session) => {
    const result = await session.run(cypher, params);
    return result.records.map((r) => r.toObject());
  });
}

export async function getCurrentVersions(): Promise<Version[]> {
  const records = await runQuery(`
    MATCH (v:Version {is_current: true})-[:HOORT_BIJ]->(d:Domein)
    RETURN v.id AS id, v.naam AS naam, v.beschrijving AS beschrijving,
           v.status AS status, v.impact AS impact, d.naam AS domein,
           toString(v.timestamp) AS timestamp, v.is_current AS is_current,
           v.deadline AS deadline
    ORDER BY d.naam, v.naam
  `);
  return records as unknown as Version[];
}

export async function getStateIndex(): Promise<string> {
  const versions = await getCurrentVersions();
  return versions
    .map((v, i) => `${i + 1}. [${v.domein}] ${v.naam} — ${v.status} (${v.impact}) — ${v.beschrijving}`)
    .join('\n');
}

export async function createVersion(fields: VersionFields): Promise<string> {
  const records = await runQuery(
    `
    CREATE (v:Version {
      id: randomUUID(),
      naam: $naam,
      beschrijving: $beschrijving,
      status: $status,
      impact: $impact,
      timestamp: datetime(),
      is_current: true
    })
    WITH v
    MATCH (d:Domein {naam: $domein})
    CREATE (v)-[:HOORT_BIJ]->(d)
    RETURN v.id AS id
    `,
    {
      naam: fields.naam,
      beschrijving: fields.beschrijving,
      status: fields.status,
      impact: fields.impact,
      domein: fields.domein,
    }
  );
  return records[0].id as string;
}

export async function evolveVersion(
  oldId: string,
  newFields: Partial<VersionFields>,
  mutationType: string
): Promise<string> {
  const records = await runQuery(
    `
    MATCH (old:Version {id: $oldId})-[:HOORT_BIJ]->(d:Domein)
    SET old.is_current = false
    CREATE (new:Version {
      id: randomUUID(),
      naam: coalesce($naam, old.naam),
      beschrijving: coalesce($beschrijving, old.beschrijving),
      status: coalesce($status, old.status),
      impact: coalesce($impact, old.impact),
      timestamp: datetime(),
      is_current: true
    })
    CREATE (old)-[:BECAME {type: $mutationType, timestamp: datetime()}]->(new)
    WITH new, coalesce($domein, d.naam) AS domeinNaam
    MATCH (d2:Domein {naam: domeinNaam})
    CREATE (new)-[:HOORT_BIJ]->(d2)
    RETURN new.id AS id
    `,
    {
      oldId,
      naam: newFields.naam ?? null,
      beschrijving: newFields.beschrijving ?? null,
      status: newFields.status ?? null,
      impact: newFields.impact ?? null,
      domein: newFields.domein ?? null,
      mutationType,
    }
  );
  return records[0].id as string;
}

export async function updateVersionProperties(
  id: string,
  fields: Partial<VersionFields>
): Promise<void> {
  const setClauses: string[] = [];
  const params: Record<string, unknown> = { id };

  if (fields.status !== undefined) {
    setClauses.push('v.status = $status');
    params.status = fields.status;
  }
  if (fields.impact !== undefined) {
    setClauses.push('v.impact = $impact');
    params.impact = fields.impact;
  }
  if (fields.deadline !== undefined) {
    setClauses.push('v.deadline = $deadline');
    params.deadline = fields.deadline;
  }

  if (setClauses.length === 0) return;

  await runQuery(
    `MATCH (v:Version {id: $id}) SET ${setClauses.join(', ')}, v.timestamp = datetime()`,
    params
  );
}

export async function archiveVersion(id: string): Promise<void> {
  await runQuery(
    `
    MATCH (v:Version {id: $id})
    SET v.status = 'gearchiveerd', v.is_current = false, v.timestamp = datetime()
    `,
    { id }
  );
}

export async function createSessie(bron: string, userInput: string): Promise<string> {
  const records = await runQuery(
    `
    CREATE (s:Sessie {
      timestamp: datetime(),
      bron: $bron,
      userInput: $userInput
    })
    RETURN toString(s.timestamp) AS timestamp
    `,
    { bron, userInput }
  );
  return records[0].timestamp as string;
}

export async function linkAnalyse(
  sessieTimestamp: string,
  tekst: string,
  urgentieLevel: string
): Promise<void> {
  await runQuery(
    `
    MATCH (s:Sessie)
    WHERE toString(s.timestamp) = $sessieTimestamp
    SET s.analyse = $tekst, s.urgentieLevel = $urgentieLevel
    `,
    { sessieTimestamp, tekst, urgentieLevel }
  );
}

export async function linkVersionToSessie(
  versionId: string,
  sessieTimestamp: string
): Promise<void> {
  await runQuery(
    `
    MATCH (v:Version {id: $versionId}), (s:Sessie)
    WHERE toString(s.timestamp) = $sessieTimestamp
    CREATE (v)-[:MUTATED_IN]->(s)
    `,
    { versionId, sessieTimestamp }
  );
}
