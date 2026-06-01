import { injectable } from 'inversify';
import { RelationalModel } from '../../model/model';
import { SQLEmitter } from './sql-emitter';
import { Table, Tables } from './sql-interfaces';
import { SQLTableTransformer } from './sql-table-transformer';

@injectable()
export class SQLGenerator {

    private tables: Tables = new Map();

    public generate(model: RelationalModel): string {
        this.tables.clear();

        for (const relation of model.relations) {
            const table = SQLTableTransformer.buildTableDefinition(relation, model);
            this.tables.set(relation.id, table);
        }

        const sql: string[] = [SQLEmitter.header()];
        for (const table of this.sortTablesTopologically()) {
            sql.push(SQLEmitter.generateCreateTable(table));
        }
        return sql.join('\n');
    }

    private sortTablesTopologically(): Table[] {
        const sorted: Table[] = [];
        const visited  = new Set<string>();
        const visiting = new Set<string>();

        const byName = new Map<string, Table>();
        for (const table of this.tables.values()) {
            byName.set(table.name, table);
        }

        const visit = (name: string) => {
            if (visited.has(name)) return;
            if (visiting.has(name)) {
                console.warn(`Ciclo detectado involucrando la tabla: ${name}`);
                return;
            }
            visiting.add(name);
            const table = byName.get(name);
            if (table) {
                for (const fk of table.foreignKeys) {
                    if (fk.targetTable !== name) visit(fk.targetTable);
                }
                visited.add(name);
                sorted.push(table);
            }
            visiting.delete(name);
        };

        for (const table of this.tables.values()) visit(table.name);
        return sorted;
    }
}
