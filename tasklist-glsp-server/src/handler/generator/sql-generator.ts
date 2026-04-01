import { injectable } from 'inversify';
import { Attribute, Relation, RelationalModel, Transition } from '../../model/model';
import { Column, ForeignKey, ReferentialActionSQL, Table, Tables, toSQLAction } from './sql-interfaces';

/*
 * Mirar los atributos de las tablas intermedias en N:M (atributos discriminantes) -> lo pongo como PK -> DONE
 * Dependencias en identificacion -> igual que N:M atributo discriminantes como PK -> DONE
 * Dependencias en existencia -> Delete CASCADE -> DONE
 * Recursividad -> DONE
 * Ordenar las tablas en funcion de las dependencias -> DONE
 * Arreglar routing points (se tienen que quedar guardados)
 */

@injectable()
export class SQLGenerator {

    private tables: Tables = new Map();
    private mergedIds: Set<string> = new Set();

    public generate(model: RelationalModel): string {
        this.tables.clear();
        this.mergedIds.clear();

        // Primera pasada: detectar fusiones (1, 1) - (1, 1)
        for (const transition of model.transitions) {
            const srcCard = transition.sourceCardinality;
            const tgtCard = transition.targetCardinality;

            if (this.isBothMandatoryOneToOne(srcCard, tgtCard)) {
                const sourceRel = this.getRelationByPortId(transition.sourceId, model);
                const targetRel = this.getRelationByPortId(transition.targetId, model);

                if (sourceRel && targetRel && sourceRel.id !== targetRel.id) {
                    this.buildMergedTable(sourceRel, targetRel);
                    this.mergedIds.add(sourceRel.id);
                    this.mergedIds.add(targetRel.id);
                }
            }
        }

        // Mapeo del modelo semántico a la interfaz SQL
        for (const relation of model.relations) {
            if (!this.mergedIds.has(relation.id)) {
                this.buildTableDefinition(relation, model);
            }
        }

        // Generación de código SQL
        const sql: string[] = [this.header()];

        const sortedTables = this.sortTablesTopologically();

        for (const table of sortedTables) {
            sql.push(this.generateCreateTable(table));
        }

        return sql.join('\n');
    }

    // HELPERS --- (1, 1) - (1, 1) transitions ---

    private isBothMandatoryOneToOne(srcCard: string, tgtCard: string): boolean {
        const srcIsOne       = srcCard.includes('1');
        const tgtIsOne       = tgtCard.includes('1');
        const srcIsMandatory = srcCard.includes('1..1');
        const tgtIsMandatory = tgtCard.includes('1..1');
        return srcIsOne && tgtIsOne && srcIsMandatory && tgtIsMandatory;
    }

    private getRelationByPortId(portOrAttrId: string, model: RelationalModel): Relation | undefined {
        const attrId = portOrAttrId.replace(/_port_(left|right)$/, '');
        return model.relations.find(rel =>
            rel.attributes?.some(a => a.id === attrId)
        );
    }

    private buildMergedTable(source: Relation, target: Relation): void {
        const sourceColumns = (source.attributes ?? [])
            .filter(a => !a.isFK)
            .map(a => this.toColumn(a));

        const targetColumns = (target.attributes ?? [])
            .filter(a => !a.isFK)
            .map(a => this.toColumn(a));

        let pkAssigned = false;

        const mergedColumns = [...targetColumns, ...sourceColumns].map(col => {
            if (col.isPK) {
                if (!pkAssigned) {
                    pkAssigned = true;
                    return col;
                }
                return {
                    ...col,
                    isPK: false,
                    isUnique: true,
                    isNotNull: true
                };
            }
            return col;
        });

        this.tables.set(`${target.id}_merged`, {
            name: target.name,
            columns: mergedColumns,
            foreignKeys: []
        });
    }

    private toColumn(attr: Attribute): Column {
        return {
            name:      attr.name,
            dataType:  attr.dataType,
            isPK:      attr.isPK,
            isUnique:  attr.isUN,
            isNotNull: attr.isNN,
            isFK:      false
        };
    }

    // -------------------------------------------------------------------------------

    private buildTableDefinition(relation: Relation, model: RelationalModel): void {
        const columns: Column[] = [];
        const foreignKeys: ForeignKey[] = [];
        const attributes = relation.attributes ?? [];

        for (const attr of attributes) {
            if (attr.isFK) {
                const edge = this.getEdge(attr, model);
                if (edge) {
                    const srcCard = this.getSourceCardinality(attr, model);
                    const tgtCard = this.getTargetCardinality(attr, model);

                    if (srcCard && tgtCard) {
                        const srcIsOne       = srcCard.includes('1');
                        const tgtIsOne       = tgtCard.includes('1');
                        const srcIsMandatory = srcCard.startsWith('1');
                        const tgtIsMandatory = tgtCard.startsWith('1');

                        if (srcIsOne && tgtIsOne) {
                            // (1,1)-(1,1) nunca llega aquí: lo filtra mergedIds en generate()
                            if (srcIsMandatory || tgtIsMandatory) {
                                // (1,1)-(0,1) o (0,1)-(1,1) → FK NOT NULL UNIQUE
                                attr.isNN = true;
                                attr.isUN = true;
                            } else {
                                // (0,1)-(0,1) → FK NULL UNIQUE
                                attr.isNN = false;
                                attr.isUN = true;
                            }
                        }

                        // 1:N → NOT NULL lo decide el mínimo del lado N (el source) / depende de si es recursiva o no
                        if (srcCard.includes('N') || tgtCard.includes('N')) {
                            attr.isNN = srcIsMandatory; // Si empieza por '0' será false (NULL). Si empieza por '1' será true (NOT NULL).
                            attr.isUN = false;
                        }

                        if (attr.isPK) {        // Forzar NOT NULL
                            attr.isNN = true;
                        }
                    }
                }
            }

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
                sourceCardinality: this.getSourceCardinality(fk, model),
                targetCardinality: this.getTargetCardinality(fk, model),
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

    private getSourceCardinality(fk: Attribute, model: RelationalModel): string | undefined {
        const edge = this.getEdge(fk, model);
        return edge?.sourceCardinality;
    }

    private getTargetCardinality(fk: Attribute, model: RelationalModel): string | undefined {
        const edge = this.getEdge(fk, model);
        return edge?.targetCardinality;
    }

   private getEdge(fk: Attribute, model: RelationalModel): Transition | undefined {
        return model.transitions.find(t =>
            t.sourceId === `${fk.id}_port_right` || 
            t.sourceId === `${fk.id}_port_left` || 
            t.sourceId === fk.id
        );
    }

    private getTarget(fk: Attribute, model: RelationalModel) {
        const edge = this.getEdge(fk, model);
        if (!edge) return { columnName: '', tableName: '' };

        const targetBaseId = edge.targetId.replace(/_port_(left|right)$/, '');

        const targetRelation = model.relations.find(rel => rel.id === targetBaseId);
        if (targetRelation) {
            const matchPK = targetRelation.attributes?.find(attr => attr.isPK);
            if (matchPK) return { columnName: matchPK.name, tableName: targetRelation.name };
        }

        for (const relation of model.relations) {
            const match = relation.attributes?.find(attr => attr.id === targetBaseId && attr.isPK);
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

    // Generación SQL

    private generateCreateTable(table: Table) {
        const lines: string[] = [];

        const pkColumns = table.columns.filter(c => c.isPK).map(c => c.name);
        const isCompositePK = pkColumns.length > 1;

        for (const col of table.columns) {
            lines.push('    ' + this.generateColumnDef(col, !isCompositePK));
        }

        if (isCompositePK) lines.push(`    PRIMARY KEY (${pkColumns.join(', ')})`);

        for (const fk of table.foreignKeys) {
            lines.push(this.generateFKDef(fk));
        }

        return `CREATE TABLE ${table.name} (\n${lines.join(',\n')}\n);\n`;
    }

    private generateColumnDef(column: Column, inlinePK: boolean): string {
        const parts: string[] = [column.name, column.dataType];        

        if      (column.isNotNull &&  column.isUnique) parts.push('NOT NULL UNIQUE');
        else if (column.isNotNull && !column.isUnique) parts.push('NOT NULL');
        else if (column.isUnique)                      parts.push('NULL UNIQUE');
        else                                           parts.push('NULL');

        if (inlinePK && column.isPK) parts.push('PRIMARY KEY');

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

    private sortTablesTopologically(): Table[] {
        const sorted: Table[] = [];
        const visited = new Set<string>();
        const visiting = new Set<string>();

        const tablesByName = new Map<string, Table>();
        for (const table of this.tables.values()) {
            tablesByName.set(table.name, table);
        }

        const visit = (tableName: string) => {
            if (visited.has(tableName)) return; 
            
            if (visiting.has(tableName)) {
                console.warn(`Ciclo detectado involucrando la tabla: ${tableName}`);
                return; 
            }

            visiting.add(tableName);

            const table = tablesByName.get(tableName);
            if (table) {
                for (const fk of table.foreignKeys) {
                    if (fk.targetTable !== tableName) { 
                        visit(fk.targetTable);
                    }
                }
                
                visited.add(tableName);
                sorted.push(table);
            }

            visiting.delete(tableName);
        };

        for (const table of this.tables.values()) {
            visit(table.name);
        }

        return sorted;
    }

}