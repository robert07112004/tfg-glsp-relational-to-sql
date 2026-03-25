import { injectable } from 'inversify';
import { Attribute, Relation, RelationalModel, Transition } from '../../model/model';
import { Column, ForeignKey, ReferentialActionSQL, Table, Tables, toSQLAction } from './sql-interfaces';

@injectable()
export class SQLGenerator {

    private tables: Tables = new Map();

    public generate(model: RelationalModel): string {
        this.tables.clear();

        // Mapeo del modelo semántico a la interfaz SQL
        for (const relation of model.relations) {
            this.buildTableDefinition(relation, model);
        }

        // Generación de óodigo SQL
        const sql: string[] = [this.header()];

        for (const table of this.tables.values()) {
            sql.push(this.generateCreateTable(table));
        }


        return sql.join('\n');
    }

    private buildTableDefinition(relation: Relation, model: RelationalModel): void {
        const columns: Column[] = [];
        const foreignKeys: ForeignKey[] = [];
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

        const fks = relation.attributes?.filter(attr => attr.isFK) as Attribute[];
        for (const fk of fks) {
            const { columnName: column, tableName: table } = this.getTarget(fk, model);
            foreignKeys.push({
                sourceColumn: fk.name,
                targetColumn: column, 
                targetTable: table,
                onDelete: this.getOnDelete(fk, model),
                onUpdate: this.getOnUpdate(fk, model)
            });
        }

        const table: Table = {
            name: relation.name,
            columns: columns,
            foreignKeys: foreignKeys
        };

        this.tables.set(relation.id, table);
    }

    private getEdge(fk: Attribute, model: RelationalModel): Transition | undefined {
        return model.transitions.find(t =>
            t.sourceId === `${fk.id}_port_right` || t.sourceId === fk.id
        );
    }

    private getTarget(fk: Attribute, model: RelationalModel) {
        const edge = this.getEdge(fk, model);
        if (!edge) return {columnName: '', tableName: ''};

        const targetAttrId = edge.targetId.replace(/_port_(left|right)$/, '');

        for (const relation of model.relations) {
            const match = relation.attributes?.find(attr => attr.id === targetAttrId && attr.isPK);
            if (match) return { columnName: match.name, tableName: relation.name };
        }
        return { columnName: '', tableName: '' };
    }

    private getOnDelete(fk: Attribute, model: RelationalModel): ReferentialActionSQL | undefined {
        const edge = this.getEdge(fk, model);
        return toSQLAction(edge?.onDelete);
    }

    private getOnUpdate(fk: Attribute, model: RelationalModel): ReferentialActionSQL | undefined {
        const edge = this.getEdge(fk, model);
        return toSQLAction(edge?.onUpdate);
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

        for (const fk of table.foreignKeys) {
            lines.push(this.generateFKDef(fk));
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

        if (column.isNotNull && !column.isPK && column.isUnique) {
            parts.push('NOT NULL UNIQUE');
        }

        if (!column.isNotNull && !column.isPK && column.isUnique) {
            parts.push('NULL UNIQUE');
        }

        return parts.join(' ');
    }

    private generateFKDef(fk: ForeignKey): string {
        const parts = [
            `    FOREIGN KEY (${fk.sourceColumn}) REFERENCES ${fk.targetTable}(${fk.targetColumn})`
        ];
        if (fk.onDelete) parts.push(`ON DELETE ${fk.onDelete}`);
        if (fk.onUpdate) parts.push(`ON UPDATE ${fk.onUpdate}`);
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