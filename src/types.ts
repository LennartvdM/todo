export interface VersionFields {
  naam: string;
  domein: string;
  beschrijving: string;
  status: string;
  impact: string;
  deadline?: string;
}

export interface Version {
  id: string;
  naam: string;
  beschrijving: string;
  status: string;
  impact: string;
  domein: string;
  timestamp: string;
  is_current: boolean;
  deadline?: string;
}

export interface CreateOp {
  op: 'create';
  fields: VersionFields;
}

export interface UpdateOp {
  op: 'update';
  ref: number;
  fields: Partial<VersionFields>;
}

export interface ArchiveOp {
  op: 'archive';
  ref: number;
}

export type Operation = CreateOp | UpdateOp | ArchiveOp;

export interface ParseResult {
  operations: Operation[];
  humanResponse: string;
}

export interface DeltaEntry {
  type: 'created' | 'updated' | 'evolved' | 'archived';
  naam: string;
  details: string;
}

export interface ChatResult {
  humanResponse: string;
  analysis: string;
}
