/********************************************************************************
 * Copyright (c) 2022-2023 EclipseSource and others.
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
import {
    Command,
    CreateNodeOperation,
    GLSPServerError,
    JsonCreateNodeOperationHandler,
    MaybePromise
} from '@eclipse-glsp/server';
import { inject, injectable } from 'inversify';
import * as uuid from 'uuid';
import { Attribute } from '../model/model';
import { RelationalModelState } from '../model/model-state';

@injectable()
export class CreateAttributeHandler extends JsonCreateNodeOperationHandler {
    readonly elementTypeIds = ['node:attribute'];

    get containerElementTypeIds(): string[] {
        return ['node:relation', 'comp:attributes'];
    }

    @inject(RelationalModelState)
    protected override modelState: RelationalModelState;

    override createCommand(operation: CreateNodeOperation): MaybePromise<Command | undefined> {
        return this.commandOf(() => {
            const containerId = operation.containerId;
            if (!containerId) throw new GLSPServerError("Los atributos deben soltarse dentro de una Relación, no en el lienzo vacío.");
            const sourceModel = this.modelState.sourceModel;
            const targetRelation = sourceModel.relations.find(r => r.id === containerId || containerId.includes(r.id));

            if (!targetRelation) throw new GLSPServerError(`No se encontró la Relación destino para el contenedor: ${containerId}`);
            if (!targetRelation.attributes) targetRelation.attributes = [];

            const attribute = this.createAttribute(targetRelation.attributes.length);            
            targetRelation.attributes.push(attribute);
        });
    }

    protected createAttribute(currentAttributeCount: number): Attribute {
        return {
            id: uuid.v4(),
            type: 'attribute',
            name: `new_column_${currentAttributeCount + 1}: VARCHAR`
        };
    }

    get label(): string {
        return 'Attribute';
    }
}
