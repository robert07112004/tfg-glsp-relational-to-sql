export interface Table {
    name:        string;
    columns:     Column[];
    foreignKeys: ForeignKey[];
}

export interface Column {
    name:       string;
    dataType:   string;
    isPK:       boolean;
    isUnique:   boolean;
    isNotNull:  boolean;
    isFK:       boolean;
}

export interface ForeignKey {
    sourceColumn:        string;
    targetColumn:        string;
    targetTable:         string;
    sourceCardinality?:  string;
    targetCardinality?:  string;
    onDelete?:           'CASCADE' | 'RESTRICT' | 'SET NULL' | 'SET DEFAULT';
    onUpdate?:           'CASCADE' | 'RESTRICT' | 'SET NULL' | 'SET DEFAULT';
}

export type DatabaseSchema = Table[];
export type Tables = Map<string, Table>;

export type ReferentialActionSQL = 'CASCADE' | 'RESTRICT' | 'SET NULL' | 'SET DEFAULT';

const ACTION_MAP: Record<string, ReferentialActionSQL> = {
    'c': 'CASCADE',
    'n': 'SET NULL',
    'r': 'RESTRICT',
    'd': 'SET DEFAULT',
};

export function toSQLAction(code: string | undefined): ReferentialActionSQL | undefined {
    if (!code) return undefined;
    return ACTION_MAP[code];
}

export type RelationKind =
    | '1_1_optional'     // (0,1) — (0,1)
    | '1_1_one_side'     // (0,1) — (1,1)  o  (1,1) — (0,1)
    | '1_1_both'         // (1,1) — (1,1)
    | '1_N_optional'     // (0,1) — (0,N)  etc.  ← para después
    | 'N_M';             // N:M              ← para después

export interface RelationStrategy {
    kind:         RelationKind;
    fkNotNull:    boolean;
    fkUnique:     boolean;
}