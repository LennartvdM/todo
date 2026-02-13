// Get all current versions grouped by domain
MATCH (v:Version {is_current: true})-[:HOORT_BIJ]->(d:Domein)
RETURN d.naam AS domein, v.naam AS naam, v.status AS status, v.impact AS impact, v.beschrijving AS beschrijving
ORDER BY d.naam, v.naam
