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
        const emitted = new Set<string>();
        let remaining = Array.from(this.tables.values());

        while (remaining.length > 0) {
            const before = remaining.length;

            remaining = remaining.filter(table => {
                const ready = table.foreignKeys.every(
                    fk => emitted.has(fk.targetTable) || fk.targetTable === table.name);
                if (ready) {
                    sorted.push(table);
                    emitted.add(table.name);
                    return false;
                }
                return true;
            });

            // Sin progreso => ciclo: se fuerza la emision de una tabla
            if (remaining.length === before && remaining.length > 0) {
                const forced = remaining.shift()!;
                sorted.push(forced);
                emitted.add(forced.name);
            }
        }

        return sorted;
    }
}
