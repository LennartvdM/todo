CREATE CONSTRAINT version_naam_unique IF NOT EXISTS
FOR (v:Version) REQUIRE v.naam IS UNIQUE;

CREATE CONSTRAINT domein_naam_unique IF NOT EXISTS
FOR (d:Domein) REQUIRE d.naam IS UNIQUE;

CREATE CONSTRAINT sessie_timestamp_unique IF NOT EXISTS
FOR (s:Sessie) REQUIRE s.timestamp IS UNIQUE;

CREATE INDEX version_status_index IF NOT EXISTS
FOR (v:Version) ON (v.status);

CREATE INDEX version_is_current_index IF NOT EXISTS
FOR (v:Version) ON (v.is_current)
