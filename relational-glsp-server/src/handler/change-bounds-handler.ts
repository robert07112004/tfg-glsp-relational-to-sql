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
import { ChangeBoundsOperation, Command, Dimension, GNode, JsonOperationHandler, MaybePromise, Point } from '@eclipse-glsp/server';
import { inject, injectable } from 'inversify';
import { RelationalModelState } from '../model/model-state';

@injectable()
export class RelationalChangeBoundsHandler extends JsonOperationHandler {
    readonly operationType = ChangeBoundsOperation.KIND;

    @inject(RelationalModelState)
    protected override modelState: RelationalModelState;

    override createCommand(operation: ChangeBoundsOperation): MaybePromise<Command | undefined> {
        return this.commandOf(() => {
            operation.newBounds.forEach(element => 
                this.changeElementBounds(element.elementId, element.newSize, element.newPosition)
            );
        });
    }

    protected changeElementBounds(elementId: string, newSize: Dimension, newPosition?: Point): void {
        const index = this.modelState.index;
        const node = index.findByClass(elementId, GNode);
        if (!node) return;

        if (node.type === 'node:relation') {                                
            const relation = index.findRelation(node.id);
            if (relation) {
                relation.size = newSize;
                if (newPosition) relation.position = newPosition;
            }
        } 
    }
}