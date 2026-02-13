# Dewthread

Personal work management system using a Neo4j graph database as an event-sourced store.

Items (tasks, projects, threads) are modeled as chains of **Version** nodes connected by mutation edges (`BECAME`, `SPLIT_INTO`, `MERGED_FROM`). Instead of traditional kanban boards, Dewthread tracks how work *transforms* over time — Sankey-style.

## Data Model

**Nodes:**
- `Version` — snapshot of an item at a point in time
- `Domein` — category (klantwerk, projecten, omgeving, overig)
- `Sessie` — interaction moment with context

**Edges:**
- `:HOORT_BIJ` — Version → Domein
- `:BECAME` — identity mutation (rename, redefine)
- `:SPLIT_INTO` — one Version splits into multiple
- `:MERGED_FROM` — multiple Versions merge into one
- `:DEPENDS_ON` — dependency between Versions
- `:MUTATED_IN` — Version created/changed in a Sessie
- `:OBSERVED_IN` — Version seen unchanged in a Sessie

**Key principle:** Status changes update the existing node. Identity changes create a new Version node with an edge. The graph IS the event log.

## Setup

```bash
npm install
cp .env.example .env  # fill in your Neo4j credentials
node scripts/run-cypher.js schema/constraints.cypher
node scripts/run-cypher.js schema/seed.cypher
```

## Project Structure

```
dewthread/
├── schema/           # Cypher schema and seed files
├── queries/          # Reusable Cypher queries
├── scripts/          # Utility scripts
├── n8n/              # n8n workflow exports
└── .env              # Neo4j credentials (gitignored)
```
