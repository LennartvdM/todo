// Verify: show all nodes and relationships
MATCH (n)
OPTIONAL MATCH (n)-[r]->(m)
RETURN labels(n) AS from_labels, n.naam AS from_naam, type(r) AS rel_type, labels(m) AS to_labels, m.naam AS to_naam
ORDER BY from_labels, from_naam
