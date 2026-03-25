export interface Table {
    name:        string;
    columns:     Column[];
    foreignKeys: ForeignKey[];
}

export interface Column {
    name:     string;
    dataType: string;
    isPK:     boolean;
    isUnique: boolean;
    isNotNull:   boolean;
    isFK:     boolean;
}

export interface ForeignKey {
    sourceColumn: string;
    targetColumn: string;
    targetTable:  string;
    onDelete?:    'CASCADE' | 'RESTRICT' | 'SET NULL' | 'SET DEFAULT';
    onUpdate?:    'CASCADE' | 'RESTRICT' | 'SET NULL' | 'SET DEFAULT';
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