// Create Domeinen
CREATE (d1:Domein {naam: 'klantwerk'})
CREATE (d2:Domein {naam: 'projecten'})
CREATE (d3:Domein {naam: 'omgeving'})
CREATE (d4:Domein {naam: 'overig'});

// Create initial Sessie
CREATE (s:Sessie {
  timestamp: datetime(),
  bron: 'seed',
  userInput: 'Initiële setup van Dewthread',
  analyse: 'Eerste import van bestaande items naar grafiekstructuur'
});

// Create Versions and wire them up
MATCH (dk:Domein {naam: 'klantwerk'}), (s:Sessie {bron: 'seed'})
CREATE (v:Version {
  naam: 'BFM team crawler',
  beschrijving: '~750 namen van Wikipedia, seizoensgebonden updates',
  status: 'bezig',
  impact: 'midden',
  timestamp: datetime(),
  is_current: true
})
CREATE (v)-[:HOORT_BIJ]->(dk)
CREATE (v)-[:MUTATED_IN]->(s);

MATCH (dk:Domein {naam: 'klantwerk'}), (s:Sessie {bron: 'seed'})
CREATE (v:Version {
  naam: 'Neoflix migratie',
  beschrijving: 'Webflow → React, kost €25/maand. Wacht op klant (KNAW PhD-project)',
  status: 'bezig',
  impact: 'midden',
  timestamp: datetime(),
  is_current: true
})
CREATE (v)-[:HOORT_BIJ]->(dk)
CREATE (v)-[:MUTATED_IN]->(s);

MATCH (dk:Domein {naam: 'klantwerk'}), (s:Sessie {bron: 'seed'})
CREATE (v:Version {
  naam: 'Annual reports prototype',
  beschrijving: 'Storytelling platform',
  status: 'stilgevallen',
  impact: 'laag',
  timestamp: datetime(),
  is_current: true
})
CREATE (v)-[:HOORT_BIJ]->(dk)
CREATE (v)-[:MUTATED_IN]->(s);

MATCH (dp:Domein {naam: 'projecten'}), (s:Sessie {bron: 'seed'})
CREATE (v:Version {
  naam: 'Voronoi gallery',
  beschrijving: 'Bento portfolio-stuk',
  status: 'bezig',
  impact: 'midden',
  timestamp: datetime(),
  is_current: true
})
CREATE (v)-[:HOORT_BIJ]->(dp)
CREATE (v)-[:MUTATED_IN]->(s);

MATCH (do:Domein {naam: 'omgeving'}), (s:Sessie {bron: 'seed'})
CREATE (v:Version {
  naam: 'Thuisrenovatie',
  beschrijving: 'Vloeren, drempels, planken',
  status: 'bezig',
  impact: 'hoog',
  timestamp: datetime(),
  is_current: true
})
CREATE (v)-[:HOORT_BIJ]->(do)
CREATE (v)-[:MUTATED_IN]->(s)
