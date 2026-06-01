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
export abstract class CreateAttributeBaseHandler extends JsonCreateNodeOperationHandler {
    get containerElementTypeIds(): string[] {
        return ['node:relation', 'comp:attributes'];
    }

    @inject(RelationalModelState)
    protected override modelState: RelationalModelState;

    protected abstract get defaultFlags(): Pick<Attribute, 'isPK' | 'isFK' | 'isNN' | 'isUN'>;
    protected abstract get attributeLabel(): string;

    override createCommand(operation: CreateNodeOperation): MaybePromise<Command | undefined> {
        return this.commandOf(() => {
            const containerId = operation.containerId;
            if (!containerId) throw new GLSPServerError('Los atributos deben soltarse dentro de una Relación.');

            const sourceModel = this.modelState.sourceModel;
            const targetRelation = sourceModel.relations.find(
                r => r.id === containerId || containerId.includes(r.id)
            );
            if (!targetRelation) throw new GLSPServerError(`Relación destino no encontrada: ${containerId}`);
            if (!targetRelation.attributes) targetRelation.attributes = [];

            const newAttr: Attribute = {
                id:       uuid.v4(),
                type:     'attribute',
                name:     `attr_${targetRelation.attributes.length + 1}`,
                dataType: 'VARCHAR(255)',
                ...this.defaultFlags
            };
            targetRelation.attributes.push(newAttr);
        });
    }

    get label(): string { return this.attributeLabel; }
}

@injectable()
export class CreatePrimaryKeyAttributeHandler extends CreateAttributeBaseHandler {
    readonly elementTypeIds = ['node:attribute-primary-key'];
    protected get attributeLabel() { return 'Primary Key'; }
    protected get defaultFlags() {
        return { isPK: true, isFK: false, isNN: true, isUN: false };
    }
}

@injectable()
export class CreateForeignKeyAttributeHandler extends CreateAttributeBaseHandler {
    readonly elementTypeIds = ['node:attribute-foreign-key'];
    protected get attributeLabel() { return 'Foreign Key'; }
    protected get defaultFlags() {
        return { isPK: false, isFK: true, isNN: true, isUN: false };
    }
}

@injectable()
export class CreateNormalAttributeHandler extends CreateAttributeBaseHandler {
    readonly elementTypeIds = ['node:attribute-normal'];
    protected get attributeLabel() { return 'Normal Attribute'; }
    protected get defaultFlags() {
        return { isPK: false, isFK: false, isNN: true, isUN: false };
    }
}

@injectable()
export class CreateOptionalAttributeHandler extends CreateAttributeBaseHandler {
    readonly elementTypeIds = ['node:attribute-optional'];
    protected get attributeLabel() { return 'Optional Attribute'; }
    protected get defaultFlags() {
        return { isPK: false, isFK: false, isNN: false, isUN: false };
    }
}

@injectable()
export class CreateAlternativeKeyHandler extends CreateAttributeBaseHandler {
    readonly elementTypeIds = ['node:attribute-unique'];
    protected get attributeLabel() { return 'Alternative Key'; }
    protected get defaultFlags() {
        return { isPK: false, isFK: false, isNN: true, isUN: true };
    }
}