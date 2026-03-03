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
    MaybePromise,
    Point
} from '@eclipse-glsp/server';
import { inject, injectable } from 'inversify';
import * as uuid from 'uuid';
import { Attribute } from '../model/tasklist-model';
import { TaskListModelState } from '../model/tasklist-model-state';

@injectable()
export class CreateAttributeHandler extends JsonCreateNodeOperationHandler {
    readonly elementTypeIds = ['node:attribute'];

    @inject(TaskListModelState)
    protected override modelState: TaskListModelState;

    override createCommand(operation: CreateNodeOperation): MaybePromise<Command | undefined> {
        return this.commandOf(() => {
            const containerId = operation.containerId;
            
            // ERROR 1 SOLUCIONADO: Comprobamos que containerId no sea undefined
            if (!containerId) {
                throw new GLSPServerError("Los atributos deben soltarse dentro de una Relación, no en el lienzo vacío.");
            }

            const sourceModel = this.modelState.sourceModel;
            
            // Buscamos a qué relación pertenece ese contenedor.
            const targetRelation = sourceModel.relations.find(r => 
                r.id === containerId || containerId.includes(r.id)
            );

            if (!targetRelation) {
                throw new GLSPServerError(`No se encontró la Relación destino para el contenedor: ${containerId}`);
            }

            // Inicializamos el array de atributos de esa relación si aún no existe
            if (!targetRelation.attributes) {
                targetRelation.attributes = [];
            }

            // Obtenemos la posición relativa (por si es necesaria en el futuro, aunque en vbox se ignora)
            const relativeLocation = this.getRelativeLocation(operation) ?? Point.ORIGIN;

            // ERROR 2 SOLUCIONADO: Pasamos la posición y la cantidad actual para generar el nombre
            const attribute = this.createAttribute(relativeLocation, targetRelation.attributes.length);
            
            targetRelation.attributes.push(attribute);
        });
    }

    protected createAttribute(position: Point, currentAttributeCount: number): Attribute {
        return {
            id: uuid.v4(),
            type: 'attribute',
            name: `NewAttributeNode${currentAttributeCount + 1}`,
            position
        };
    }

    get label(): string {
        return 'Attribute';
    }
}
