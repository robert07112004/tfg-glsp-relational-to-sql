/********************************************************************************
 * Copyright (c) 2022 EclipseSource and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * This Source Code may also be made available under the following Secondary
 * Licenses when the conditions for such availability set forth in the Eclipse
 * Public License v. 2.0 are satisfied:
 * -- GNU General Public License, version 2 with the GNU Classpath Exception
 * which is available at https://www.gnu.org/software/classpath/license.html
 * -- MIT License which is available at https://opensource.org/license/mit.
 *
 * SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0 OR MIT
 ********************************************************************************/
import { ApplyLabelEditOperation } from '@eclipse-glsp/protocol';
import { Command, GEdge, GLSPServerError, GNode, JsonOperationHandler, MaybePromise, toTypeGuard } from '@eclipse-glsp/server';
import { inject, injectable } from 'inversify';
import { Attribute, ReferentialAction } from '../model/model';
import { RelationalModelState } from '../model/model-state';

@injectable()
export class RelationalApplyLabelEditHandler extends JsonOperationHandler {
    readonly operationType = ApplyLabelEditOperation.KIND;

    @inject(RelationalModelState)
    protected override readonly modelState: RelationalModelState;

    override createCommand(operation: ApplyLabelEditOperation): MaybePromise<Command | undefined> {
        return this.commandOf(() => {
            const index = this.modelState.index;
            const parentNode = index.findParentElement(operation.labelId, toTypeGuard(GNode));
            if (parentNode) {
                if (parentNode.type === 'node:relation') {
                    const relation = index.findRelation(parentNode.id);
                    if (!relation) throw new GLSPServerError(`Relation not found: ${parentNode.id}`);
                    relation.name = operation.text;
                    return;
                }
                if (parentNode.type === 'node:attribute') {
                    const attribute = index.findAttribute(parentNode.id);
                    if (!attribute) throw new GLSPServerError(`Attribute not found: ${parentNode.id}`);

                    console.log('[LabelEdit] Texto recibido:', operation.text);
                    console.log('[LabelEdit] Estado ANTES:', {
                        name: attribute.name,
                        dataType: attribute.dataType,
                        isPK: attribute.isPK,
                        isFK: attribute.isFK,
                        isNN: attribute.isNN,
                        isUN: attribute.isUN
                    });

                    try {
                        const parsed       = Attribute.parseDisplayText(operation.text);
                        attribute.name     = parsed.name;
                        attribute.dataType = parsed.dataType;
                        attribute.isFK     = parsed.isFK;
                        attribute.isNN     = parsed.isNN;

                        console.log('[LabelEdit] Parsed:', parsed);
                        console.log('[LabelEdit] Estado DESPUÉS:', {
                            name: attribute.name,
                            dataType: attribute.dataType,
                            isPK: attribute.isPK,
                            isFK: attribute.isFK,
                            isNN: attribute.isNN,
                            isUN: attribute.isUN
                        });
                    } catch (msg) {
                        console.error('[LabelEdit] Error de parseo:', msg);
                        throw new GLSPServerError(String(msg));
                    }
                    return;
                }
            }

            // Intentar padre GEdge (label de transición)
            const parentEdge = index.findParentElement(operation.labelId, toTypeGuard(GEdge));
            if (parentEdge) {
                const transition = index.findTransition(parentEdge.id);
                if (!transition) throw new GLSPServerError(`Transition not found: ${parentEdge.id}`);
                
                // Parsear formato "u:c d:n"
                const match = operation.text.trim().match(/^u:([cnrd])\s+d:([cnrd])$/i);
                if (!match) throw new GLSPServerError(`Formato inválido. Usa "u:c d:n" (c=cascade, n=set null, r=restrict, d=set default)`);
                
                transition.onUpdate = match[1].toLowerCase() as ReferentialAction;
                transition.onDelete = match[2].toLowerCase() as ReferentialAction;
                return;
            }

            throw new GLSPServerError(`No parent found for label: ${operation.labelId}`);
        });
    }
}