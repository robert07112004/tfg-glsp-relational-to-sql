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
import { Command, CreateEdgeOperation, JsonCreateEdgeOperationHandler, MaybePromise } from '@eclipse-glsp/server';
import { inject, injectable } from 'inversify';
import * as uuid from 'uuid';
import { Transition } from '../model/model';
import { RelationalModelState } from '../model/model-state';

@injectable()
export abstract class CreateTransitionBaseHandler extends JsonCreateEdgeOperationHandler {
    @inject(RelationalModelState)
    protected override modelState: RelationalModelState;

    protected abstract get relationType(): Transition['kind'];
    protected abstract get transitionLabel(): string;

    override createCommand(operation: CreateEdgeOperation): MaybePromise<Command | undefined> {
        return this.commandOf(() => {
            const transition: Transition = {
                id: uuid.v4(),
                sourceId: operation.sourceElementId,
                targetId: operation.targetElementId,
                kind: this.relationType
            };
            this.modelState.sourceModel.transitions.push(transition);
        });
    }

    get label(): string { return this.transitionLabel; }
}

@injectable()
export class CreateOneToOneHandler extends CreateTransitionBaseHandler {
    readonly elementTypeIds = ['edge:one-to-one'];
    protected get relationType(): Transition['kind'] { return 'one-to-one'; }
    protected get transitionLabel(): string { return 'One to One'; }
}

@injectable()
export class CreateOneToManyHandler extends CreateTransitionBaseHandler {
    readonly elementTypeIds = ['edge:one-to-many'];
    protected get relationType(): Transition['kind'] { return 'one-to-many'; }
    protected get transitionLabel(): string { return 'One to Many'; }
}

@injectable()
export class CreateZeroOrOneToManyHandler extends CreateTransitionBaseHandler {
    readonly elementTypeIds = ['edge:zero-or-one-to-many'];
    protected get relationType(): Transition['kind'] { return 'zero-or-one-to-many'; }
    protected get transitionLabel(): string { return 'Zero or One to Many'; }
}

@injectable()
export class CreateOneToOneOrManyHandler extends CreateTransitionBaseHandler {
    readonly elementTypeIds = ['edge:one-to-one-or-many'];
    protected get relationType(): Transition['kind'] { return 'one-to-one-or-many'; }
    protected get transitionLabel(): string { return 'One to One or Many'; }
}

@injectable()
export class CreateZeroOrOneToOneHandler extends CreateTransitionBaseHandler {
    readonly elementTypeIds = ['edge:zero-or-one-to-one'];
    protected get relationType(): Transition['kind'] { return 'zero-or-one-to-one'; }
    protected get transitionLabel(): string { return 'Zero or One to One'; }
}
