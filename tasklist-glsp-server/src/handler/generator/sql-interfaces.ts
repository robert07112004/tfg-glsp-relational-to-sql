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