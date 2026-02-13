// Create Domeinen
CREATE (d1:Domein {naam: 'klantwerk'})
CREATE (d2:Domein {naam: 'projecten'})
CREATE (d3:Domein {naam: 'omgeving'})
CREATE (d4:Domein {naam: 'overig'});

// Create initial Sessie
CREATE (s:Sessie {
  timestamp: datetime('2025-06-01T10:00:00Z'),
  bron: 'seed',
  userInput: 'Initiële setup van Dewthread',
  analyse: 'Eerste import van bestaande items naar grafiekstructuur'
});

// BFM team crawler
MATCH (dk:Domein {naam: 'klantwerk'}), (s:Sessie {bron: 'seed'})
CREATE (v:Version {
  id: randomUUID(),
  naam: 'BFM team crawler',
  beschrijving: '~750 namen van Wikipedia, seizoensgebonden updates',
  status: 'bezig',
  impact: 'midden',
  timestamp: datetime('2025-04-15T09:00:00Z'),
  is_current: true
})
CREATE (v)-[:HOORT_BIJ]->(dk)
CREATE (v)-[:MUTATED_IN]->(s);

// Neoflix migratie
MATCH (dk:Domein {naam: 'klantwerk'}), (s:Sessie {bron: 'seed'})
CREATE (v:Version {
  id: randomUUID(),
  naam: 'Neoflix migratie',
  beschrijving: 'Webflow → React, kost €25/maand. Wacht op klant (KNAW PhD-project)',
  status: 'bezig',
  impact: 'midden',
  timestamp: datetime('2025-03-20T14:00:00Z'),
  is_current: true
})
CREATE (v)-[:HOORT_BIJ]->(dk)
CREATE (v)-[:MUTATED_IN]->(s);

// Annual reports prototype
MATCH (dk:Domein {naam: 'klantwerk'}), (s:Sessie {bron: 'seed'})
CREATE (v:Version {
  id: randomUUID(),
  naam: 'Annual reports prototype',
  beschrijving: 'Storytelling platform',
  status: 'stilgevallen',
  impact: 'laag',
  timestamp: datetime('2025-02-10T11:00:00Z'),
  is_current: true
})
CREATE (v)-[:HOORT_BIJ]->(dk)
CREATE (v)-[:MUTATED_IN]->(s);

// Voronoi gallery
MATCH (dp:Domein {naam: 'projecten'}), (s:Sessie {bron: 'seed'})
CREATE (v:Version {
  id: randomUUID(),
  naam: 'Voronoi gallery',
  beschrijving: 'Bento portfolio-stuk',
  status: 'bezig',
  impact: 'midden',
  timestamp: datetime('2025-05-01T16:00:00Z'),
  is_current: true
})
CREATE (v)-[:HOORT_BIJ]->(dp)
CREATE (v)-[:MUTATED_IN]->(s);

// Thuisrenovatie
MATCH (do:Domein {naam: 'omgeving'}), (s:Sessie {bron: 'seed'})
CREATE (v:Version {
  id: randomUUID(),
  naam: 'Thuisrenovatie',
  beschrijving: 'Vloeren, drempels, planken',
  status: 'bezig',
  impact: 'hoog',
  timestamp: datetime('2025-05-10T08:30:00Z'),
  is_current: true
})
CREATE (v)-[:HOORT_BIJ]->(do)
CREATE (v)-[:MUTATED_IN]->(s);

// DEPENDS_ON: Neoflix migratie depends on BFM team crawler
MATCH (neoflix:Version {naam: 'Neoflix migratie'}), (bfm:Version {naam: 'BFM team crawler'})
CREATE (neoflix)-[:DEPENDS_ON]->(bfm)
