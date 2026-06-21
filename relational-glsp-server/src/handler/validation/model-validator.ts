import { AbstractModelValidator, GModelElement, Marker } from '@eclipse-glsp/server';
import { inject, injectable } from 'inversify';
import { RelationalModel } from '../../model/model';
import { RelationalModelState } from '../../model/model-state';

/*
 * Validation rules:
 * Rule 1:  The schema cannot be empty
 * Rule 2:  Two tables cannot share the same name in the diagram
 * Rule 3:  The table must have a user-defined name
 * Rule 4:  The table must contain at least one attribute
 * Rule 5:  The table must have a Primary Key (PK)
 * Rule 6:  Two attributes within the same table cannot share the same name
 * Rule 7:  The attribute must have a user-defined name
 * Rule 8:  Type match between FKs: the FK data type must match the referenced attribute data type
 * Rule 9:  The attribute from which an edge originates must be marked as FK (isFK = true)
 * Rule 10: An attribute marked as FK must have at least one outgoing edge
 * Rule 11: A table or attribute name cannot be a SQL reserved word
 * Rule 12: Circular references between tables are not allowed
 */

const SQL_RESERVED_WORDS = new Set([
    'ADD', 'ALL', 'ALTER', 'AND', 'AS', 'ASC', 'BACKUP', 'BETWEEN', 'BY', 'CASE',
    'CHECK', 'COLUMN', 'CONSTRAINT', 'CREATE', 'CROSS', 'DATABASE', 'DEFAULT',
    'DELETE', 'DESC', 'DISTINCT', 'DROP', 'EXEC', 'EXISTS', 'FOREIGN', 'FROM',
    'FULL', 'GROUP', 'HAVING', 'IN', 'INDEX', 'INNER', 'INSERT', 'INTO', 'IS',
    'JOIN', 'KEY', 'LEFT', 'LIKE', 'LIMIT', 'NOT', 'NULL', 'ON', 'OR', 'ORDER',
    'OUTER', 'PRIMARY', 'PROCEDURE', 'RIGHT', 'ROWNUM', 'SELECT', 'SET', 'TABLE',
    'TOP', 'TRUNCATE', 'UNION', 'UNIQUE', 'UPDATE', 'VALUES', 'VIEW', 'WHERE'
]);

@injectable()
export class RelationalModelValidator extends AbstractModelValidator {
    
    @inject(RelationalModelState)
    protected modelState: RelationalModelState;

    override doBatchValidation(element: GModelElement): Marker[] {
        
        if (element.type !== 'graph') {
            return [];
        }

        const markers: Marker[] = [];
        const model = this.modelState.sourceModel as RelationalModel;

        if (!model || !model.relations) return markers;

        // Rule 1:  The schema cannot be empty
        if (model.relations.length === 0) {
            markers.push({
                kind: 'warning',
                description: 'El esquema está vacío. Debes crear al menos una tabla.',
                elementId: element.id,
                label: ''
            });
        }

        const relationNames = new Map<string, string[]>();

        for (const relation of model.relations) {
            if (relation.name) {
                const ids = relationNames.get(relation.name.toLowerCase()) || [];
                ids.push(relation.id);
                relationNames.set(relation.name.toLowerCase(), ids);
            }

            
            // Rule 3:  The table must have a user-defined name
            if (!relation.name || relation.name.trim() === '' || relation.name.includes('NewRelation')) {
                markers.push({
                    kind: 'error',
                    description: 'La tabla debe tener un nombre definido y válido.',
                    elementId: relation.id,
                    label: ''
                });
            }

            // Rule 11: A table or attribute name cannot be a SQL reserved word
            if (relation.name && SQL_RESERVED_WORDS.has(relation.name.toUpperCase())) {
                markers.push({
                    kind: 'error',
                    description: `'${relation.name}' es una palabra reservada de SQL y no puede usarse como nombre de tabla.`,
                    elementId: relation.id,
                    label: ''
                });
            }

            // Rule 4:  The table must contain at least one attribute
            if (!relation.attributes || relation.attributes.length === 0) {
                markers.push({
                    kind: 'error',
                    description: `La tabla '${relation.name}' debe contener al menos un atributo.`,
                    elementId: relation.id,
                    label: ''
                });
            } else {
                // Rule 5:  The table must have a Primary Key (PK)
                const hasPK = relation.attributes.some(attr => attr.isPK);
                if (!hasPK) {
                    markers.push({
                        kind: 'error',
                        description: `La tabla '${relation.name}' debe tener definida una Clave Primaria (PK).`,
                        elementId: relation.id,
                        label: ''
                    });
                }

                const attributeNames = new Map<string, string[]>();

                for (const attr of relation.attributes) {
                    if (attr.name) {
                        const attrIds = attributeNames.get(attr.name.toLowerCase()) || [];
                        attrIds.push(attr.id);
                        attributeNames.set(attr.name.toLowerCase(), attrIds);
                    }

                    // Rule 7:  The attribute must have a user-defined name
                    if (!attr.name || attr.name.trim() === '' || attr.name.includes('attr')) {
                        markers.push({
                            kind: 'error',
                            description: 'El atributo debe tener un nombre definido.',
                            elementId: attr.id,
                            label: ''
                        });
                    }

                    // Rule 11: A table or attribute name cannot be a SQL reserved word
                    if (attr.name && SQL_RESERVED_WORDS.has(attr.name.toUpperCase())) {
                        markers.push({
                            kind: 'error',
                            description: `'${attr.name}' es una palabra reservada de SQL y no puede usarse como nombre de atributo.`,
                            elementId: attr.id,
                            label: ''
                        });
                    }

                    // Rule 10: An attribute marked as FK must have at least one outgoing edge
                    if (attr.isFK && model.transitions) {
                        const hasOutgoingEdge = model.transitions.some(t => {
                            const sourceBaseId = t.sourceId.replace(/_port_(left|right)$/, '');
                            return sourceBaseId === attr.id;
                        });
                        if (!hasOutgoingEdge) {
                            markers.push({
                                kind: 'error',
                                description: `El atributo '${attr.name}' está marcado como FK pero no tiene ninguna arista de referencia hacia otra tabla.`,
                                elementId: attr.id,
                                label: ''
                            });
                        }
                    }
                }

                // Rule 6:  Two attributes within the same table cannot share the same name
                attributeNames.forEach((ids, name) => {
                    if (ids.length > 1) {
                        ids.forEach(id => markers.push({
                            kind: 'error',
                            description: `El nombre de atributo '${name}' está repetido en la misma tabla.`,
                            elementId: id,
                            label: ''
                        }));
                    }
                });
            }
        }

        // Rule 2:  Two tables cannot share the same name in the diagram
        relationNames.forEach((ids, name) => {
            if (ids.length > 1) {
                ids.forEach(id => markers.push({
                    kind: 'error',
                    description: `El nombre de tabla '${name}' ya existe en el diagrama.`,
                    elementId: id,
                    label: ''
                }));
            }
        });

        if (model.transitions) {
            for (const transition of model.transitions) {

                const sourceBaseId = transition.sourceId.replace(/_port_(left|right)$/, '');
                const targetBaseId = transition.targetId.replace(/_port_(left|right|top)$/, '');

                let sourceAttr;
                for (const rel of model.relations) {
                    sourceAttr = rel.attributes?.find(a => a.id === sourceBaseId);
                    if (sourceAttr) break;
                }

                // Rule 9: The attribute from which an edge originates must be marked as FK (isFK = true)
                if (sourceAttr && !sourceAttr.isFK) {
                    markers.push({
                        kind: 'error',
                        description: `El atributo '${sourceAttr.name}' del que sale la arista debe estar marcado como FK (añade el prefijo "FK " a su nombre en el editor).`,
                        elementId: transition.id,
                        label: ''
                    });
                }

                // Rule 8: Type match between FKs: the FK data type must match the referenced attribute data type
                const targetRelation = model.relations.find(r =>
                    r.id === targetBaseId || r.attributes?.some(a => a.id === targetBaseId)
                );

                if (targetRelation) {
                    let targetAttr = undefined;
                    for (const rel of model.relations) {
                        targetAttr = rel.attributes?.find(a => a.id === targetBaseId);
                        if (targetAttr) break;
                    }

                    if (sourceAttr && targetAttr && sourceAttr.dataType !== targetAttr.dataType) {
                        markers.push({
                            kind: 'error',
                            description: `Incompatibilidad de tipos: La FK '${sourceAttr.name}' (${sourceAttr.dataType}) debe tener el mismo tipo que el atributo destino '${targetAttr.name}' (${targetAttr.dataType}).`,
                            elementId: transition.id,
                            label: ''
                        });
                    }
                }
            }
        }

        // Rule 12: Circular references between tables are not allowed
        if (model.transitions && model.transitions.length > 0) {
            const graph = new Map<string, Set<string>>();
            for (const rel of model.relations) {
                graph.set(rel.id, new Set());
            }

            for (const transition of model.transitions) {
                const sourceBaseId = transition.sourceId.replace(/_port_(left|right)$/, '');
                const targetBaseId = transition.targetId.replace(/_port_(left|right|top)$/, '');

                let sourceRelId: string | undefined;
                for (const rel of model.relations) {
                    if (rel.id === sourceBaseId || rel.attributes?.some(a => a.id === sourceBaseId)) {
                        sourceRelId = rel.id;
                        break;
                    }
                }

                let targetRelId: string | undefined;
                for (const rel of model.relations) {
                    if (rel.id === targetBaseId || rel.attributes?.some(a => a.id === targetBaseId)) {
                        targetRelId = rel.id;
                        break;
                    }
                }

                if (sourceRelId && targetRelId && sourceRelId !== targetRelId) {
                    graph.get(sourceRelId)?.add(targetRelId);
                }
            }

            const findCycle = (): string[] | null => {
                const WHITE = 0, GRAY = 1, BLACK = 2;
                const color = new Map<string, number>();
                const parent = new Map<string, string | null>();

                for (const id of graph.keys()) {
                    color.set(id, WHITE);
                    parent.set(id, null);
                }

                const dfs = (u: string): string[] | null => {
                    color.set(u, GRAY);
                    for (const v of graph.get(u) ?? []) {
                        if (color.get(v) === GRAY) {
                            const cycle: string[] = [v, u];
                            let cur = u;
                            while (cur !== v) {
                                cur = parent.get(cur)!;
                                cycle.push(cur);
                            }
                            return cycle.reverse();
                        }
                        if (color.get(v) === WHITE) {
                            parent.set(v, u);
                            const result = dfs(v);
                            if (result) return result;
                        }
                    }
                    color.set(u, BLACK);
                    return null;
                };

                for (const id of graph.keys()) {
                    if (color.get(id) === WHITE) {
                        const cycle = dfs(id);
                        if (cycle) return cycle;
                    }
                }
                return null;
            };

            const cycle = findCycle();
            if (cycle) {
                const cycleNames = cycle
                    .map(id => model.relations.find(r => r.id === id)?.name ?? id)
                    .join(' → ');
                markers.push({
                    kind: 'warning',
                    description: `Ciclo de referencias detectado: ${cycleNames}. Esto puede causar problemas al generar el SQL (orden de CREATE TABLE y restricciones de FK).`,
                    elementId: element.id,
                    label: ''
                });
            }
        }

        return markers;
    }
}