const neo4j = require('neo4j-driver');
const fs = require('fs');
const path = require('path');

require('dotenv/config');

const uri = process.env.NEO4J_URI;
const user = process.env.NEO4J_USER;
const password = process.env.NEO4J_PASSWORD;

if (!uri || !user || !password) {
  console.error('Missing NEO4J_URI, NEO4J_USER, or NEO4J_PASSWORD in .env');
  process.exit(1);
}

const file = process.argv[2];
if (!file) {
  console.error('Usage: node scripts/run-cypher.js <file.cypher>');
  process.exit(1);
}

const filePath = path.resolve(file);
const cypher = fs.readFileSync(filePath, 'utf-8');

// Split on semicolons, filter empty statements
const statements = cypher
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0);

async function main() {
  const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
  const session = driver.session();

  try {
    for (const stmt of statements) {
      console.log(`\n> ${stmt.substring(0, 80)}${stmt.length > 80 ? '...' : ''}`);
      const result = await session.run(stmt);
      const summary = result.summary.counters.updates();
      const nonZero = Object.entries(summary).filter(([, v]) => v > 0);
      if (nonZero.length > 0) {
        console.log('  ', Object.fromEntries(nonZero));
      }
      if (result.records.length > 0) {
        for (const record of result.records) {
          console.log('  ', record.toObject());
        }
      }
    }
    console.log('\nDone.');
  } finally {
    await session.close();
    await driver.close();
  }
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
