import { Column, ForeignKey, Table } from './sql-interfaces';

export class SQLEmitter {

    static header(): string {
        const now = new Date().toLocaleString();
        return [
            `Fecha: ${now}`
        ].join('\n') + '\n';
    }

    static generateCreateTable(table: Table): string {
        const lines: string[] = [];

        const pkColumns = table.columns.filter(c => c.isPK).map(c => c.name);
        const isCompositePK = pkColumns.length > 1;

        for (const col of table.columns) {
            lines.push('    ' + SQLEmitter.columnDef(col, !isCompositePK));
        }

        if (isCompositePK) {
            lines.push(`    PRIMARY KEY (${pkColumns.join(', ')})`);
        }

        for (const fk of table.foreignKeys) {
            lines.push(SQLEmitter.fkDef(fk));
        }

        return `CREATE TABLE ${table.name} (\n${lines.join(',\n')}\n);\n`;
    }

    private static columnDef(column: Column, inlinePK: boolean): string {
        const parts: string[] = [column.name, column.dataType];

        if      (column.isNotNull &&  column.isUnique) parts.push('NOT NULL UNIQUE');
        else if (column.isNotNull && !column.isUnique) parts.push('NOT NULL');
        else if (column.isUnique)                      parts.push('UNIQUE');
        
        if (inlinePK && column.isPK) parts.push('PRIMARY KEY');

        return parts.join(' ');
    }

    private static fkDef(fk: ForeignKey): string {
        const parts = [
            `    FOREIGN KEY (${fk.sourceColumn}) REFERENCES ${fk.targetTable}(${fk.targetColumn})`
        ];
        if (fk.onDelete) parts.push(`ON DELETE ${fk.onDelete}`);
        if (fk.onUpdate) parts.push(`ON UPDATE ${fk.onUpdate}`);
        return parts.join(' ');
    }
}
