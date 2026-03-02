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
import { Command, GLSPServerError, GNode, JsonOperationHandler, MaybePromise, toTypeGuard } from '@eclipse-glsp/server/node';
import { inject, injectable } from 'inversify';
import { TaskListModelState } from '../model/tasklist-model-state';

@injectable()
export class TaskListApplyLabelEditHandler extends JsonOperationHandler {
    readonly operationType = ApplyLabelEditOperation.KIND;

    @inject(TaskListModelState)
    protected override readonly modelState: TaskListModelState;

    override createCommand(operation: ApplyLabelEditOperation): MaybePromise<Command | undefined> {
        return this.commandOf(() => {
            const index = this.modelState.index;
            const parentNode = index.findParentElement(operation.labelId, toTypeGuard(GNode));
            
            if (!parentNode) throw new GLSPServerError(`Could not find parent node for label with id ${operation.labelId}`);

            if (parentNode.type === 'node:relation') {                                                                      // padre === relation
                const relation = index.findRelation(parentNode.id);
                if (!relation) throw new GLSPServerError(`Could not retrieve the Relation with id ${parentNode.id}`);
                relation.name = operation.text;
            } else if (parentNode.type === 'node:attribute') {                                                              // padre === attribute
                const attribute = index.findAttribute(parentNode.id);
                if (!attribute) throw new GLSPServerError(`Could not retrieve the Attribute with id ${parentNode.id}`);
                attribute.name = operation.text;
            } else throw new GLSPServerError(`Editing labels for node type '${parentNode.type}' is not supported.`);        // Tipo no soportado
        });
    }
}