// Trace the full mutation history of an item
// Replace $naam with the item name
MATCH path = (v:Version {naam: $naam})-[:BECAME|SPLIT_INTO|MERGED_FROM*0..]->(successor:Version)
RETURN [node IN nodes(path) | {naam: node.naam, status: node.status, timestamp: node.timestamp}] AS history
