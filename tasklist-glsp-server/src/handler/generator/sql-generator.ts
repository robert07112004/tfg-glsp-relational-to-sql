import { injectable } from 'inversify';
import { Relation, RelationalModel } from '../../model/model';
import { Column, Table, Tables } from './sql-interfaces';

@injectable()
export class SQLGenerator {

    private tables: Tables = new Map();

    public generate(model: RelationalModel): string {
        this.tables.clear();

        // Mapeo del modelo semántico a la interfaz SQL
        for (const relation of model.relations) {
            this.buildTableDefinition(relation);
        }

        // Generación de óodigo SQL
        const sql: string[] = [this.header()];

        for (const table of this.tables.values()) {
            sql.push(this.generateCreateTable(table));
        }


        return sql.join('\n');
    }

    private buildTableDefinition(relation: Relation): void {
        const columns: Column[] = [];
        const attributes = relation.attributes ?? [];

        for (const attr of attributes) {
            columns.push({
                name: attr.name,
                dataType: attr.dataType,
                isPK: attr.isPK,
                isUnique: attr.isUN,
                isNotNull: attr.isNN,
                isFK: attr.isFK
            });
        }

        const table: Table = {
            name: relation.name,
            columns: columns,
            foreignKeys: []
        };

        this.tables.set(relation.id, table);
    }

    private generateCreateTable(table: Table) {
        const lines: string[] = [];

        for (const col of table.columns) {
            lines.push('    ' + this.generateColumnDef(col));
        }

        const pkColumns = table.columns
            .filter(c => c.isPK)
            .map(c => c.name);

        if (pkColumns.length > 0) {
            lines.push(`    PRIMARY KEY (${pkColumns.join(', ')})`);
        }

        const body = lines.join(',\n');
        return `CREATE TABLE ${table.name} (\n${body}\n);\n`;
    }

    private generateColumnDef(column: Column): string {
        const parts: string[] = [
            column.name,
            column.dataType
        ];

        if (column.isNotNull && !column.isPK && !column.isUnique && !column.isFK) {
            parts.push('NOT NULL');
        }

        if (!column.isNotNull && !column.isPK && !column.isUnique && !column.isFK) {
            parts.push('NULL');
        }

        if (column.isNotNull && !column.isPK && column.isUnique && !column.isFK) {
            parts.push('UNIQUE NOT NULL');
        }

        if (!column.isNotNull && !column.isPK && column.isUnique && !column.isFK) {
            parts.push('UNIQUE NULL');
        }

        // FK aun no implementadas

        return parts.join(' ');
    }

    private header(): string {
        const now = new Date().toLocaleString();
        return [
            '-- ======================================================',
            `-- Script SQL generado por GLSP a las ${now}`,
            '-- ======================================================'
        ].join('\n') + '\n';
    }

}