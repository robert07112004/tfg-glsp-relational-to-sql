import { AbstractModelValidator, GModelElement, Marker } from '@eclipse-glsp/server';
import { inject, injectable } from 'inversify';
import { RelationalModel } from '../model/model';
import { RelationalModelState } from '../model/model-state';

/*
 * Reglas de validacion:
 * Regla 1: El esquema no puede estar vacío
 * Regla 2: No pueden haber dos tablas con el mismo nombre en el diagrama
 * Regla 3: No se ha puesto nombe a la tabla
 * Regla 4: La tabla tiene que tener al menos un atributo en su interior
 * Regla 5: La tabla tiene que tener una clave primaria
 * Regla 6: Dentro de una misma tabla no pueden haber atributos que se llamen igual
 * Regla 7: El atributo tiene que tener un nombre puesto por el usuario
 * Regla 8: El target de la transition no puede apuntar a una tabla que no tenga ni PK ni UNIQUE.
 * Regla 9: Coincidencia de datos entre FKs. FK debe coincidir con PK
 */

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

        // ==========================================
        // 1. VALIDACIONES DEL ESQUEMA GLOBAL
        // ==========================================
        
        // Regla 1: El esquema no puede estar vacío
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
            // Guardar nombres para comprobar duplicados globales
            if (relation.name) {
                const ids = relationNames.get(relation.name.toLowerCase()) || [];
                ids.push(relation.id);
                relationNames.set(relation.name.toLowerCase(), ids);
            }

            // ==========================================
            // 2. VALIDACIONES DE LA RELACIÓN (Tabla)
            // ==========================================

            // Regla 3: No se ha puesto nombe a la tabla
            if (!relation.name || relation.name.trim() === '' || relation.name.includes('NewRelation')) {
                markers.push({
                    kind: 'error',
                    description: 'La tabla debe tener un nombre definido y válido.',
                    elementId: relation.id,
                    label: ''
                });
            }

            // Regla 4: La tabla tiene que tener al menos un atributo en su interior
            if (!relation.attributes || relation.attributes.length === 0) {
                markers.push({
                    kind: 'error',
                    description: `La tabla '${relation.name}' debe contener al menos un atributo.`,
                    elementId: relation.id,
                    label: ''
                });
            } else {
                // Regla 5: La tabla tiene que tener una clave primaria
                const hasPK = relation.attributes.some(attr => attr.isPK);
                if (!hasPK) {
                    markers.push({
                        kind: 'error',
                        description: `La tabla '${relation.name}' debe tener definida una Clave Primaria (PK).`,
                        elementId: relation.id,
                        label: ''
                    });
                }

                // ==========================================
                // 3. VALIDACIONES DE LOS ATRIBUTOS
                // ==========================================
                const attributeNames = new Map<string, string[]>();

                for (const attr of relation.attributes) {
                    // Guardar nombres para duplicados locales
                    if (attr.name) {
                        const attrIds = attributeNames.get(attr.name.toLowerCase()) || [];
                        attrIds.push(attr.id);
                        attributeNames.set(attr.name.toLowerCase(), attrIds);
                    }

                    // Regla 7: El atributo tiene que tener un nombre puesto por el usuario
                    if (!attr.name || attr.name.trim() === '' || attr.name.includes('attr')) {
                        markers.push({
                            kind: 'error',
                            description: 'El atributo debe tener un nombre definido.',
                            elementId: attr.id,
                            label: ''
                        });
                    }
                }

                // Regla 6: Dentro de una misma tabla no pueden haber atributos que se llamen igual
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

        // Regla 2: No pueden haber dos tablas con el mismo nombre en el diagrama
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

        // ==========================================
        // 4. VALIDACIONES DE LAS TRANSICIONES (FKs)
        // ==========================================
        if (model.transitions) {
            for (const transition of model.transitions) {
                
                // Regla 8: El target de la transition no puede apuntar a una tabla que no tenga ni PK ni UNIQUE.
                const targetBaseId = transition.targetId.replace(/_port_(left|right|top)$/, '');
                const targetRelation = model.relations.find(r => 
                    r.id === targetBaseId || r.attributes?.some(a => a.id === targetBaseId)
                );

                if (targetRelation) {
                    const hasValidTarget = targetRelation.attributes?.some(a => a.isPK || a.isUN);
                    if (!hasValidTarget) {
                        markers.push({
                            kind: 'error',
                            description: `La tabla destino '${targetRelation.name}' no tiene PK ni campo UNIQUE, por lo que no puede recibir una Clave Foránea.`,
                            elementId: transition.id,
                            label: ''
                        });
                    }

                    const sourceAttrId = transition.sourceId.replace(/_port_(left|right)$/, '');
                    let sourceAttr;
                    for (const rel of model.relations) {
                        sourceAttr = rel.attributes?.find(a => a.id === sourceAttrId);
                        if (sourceAttr) break;
                    }

                    
                    const targetPK = targetRelation.attributes?.find(a => a.isPK);
                    // Regla 9: Coincidencia de datos entre FKs. FK debe coincidir con PK
                    if (sourceAttr && targetPK && sourceAttr.dataType !== targetPK.dataType) {
                        markers.push({
                            kind: 'error',
                            description: `Incompatibilidad de tipos: La FK '${sourceAttr.name}' (${sourceAttr.dataType}) debe tener el mismo tipo que la PK destino '${targetPK.name}' (${targetPK.dataType}).`,
                            elementId: transition.id,
                            label: ''
                        });
                    }
                }
            }
        }

        return markers;

    }
}