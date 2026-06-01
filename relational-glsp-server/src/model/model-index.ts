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
import { GModelIndex } from '@eclipse-glsp/server';
import { injectable } from 'inversify';
import { Attribute, Relation, RelationalModel, Transition } from './model';

@injectable()
export class RelationalModelIndex extends GModelIndex {
    protected idToElements = new Map<string, Relation | Attribute | Transition>();

    indexRelationalModel(model: RelationalModel): void {
        this.idToElements.clear();
        
        for (const transition of model.transitions) {
            this.idToElements.set(transition.id, transition);
        }

        for (const relation of model.relations) {
            this.idToElements.set(relation.id, relation);
            
            if (relation.attributes) {
                for (const attribute of relation.attributes) {
                    this.idToElements.set(attribute.id, attribute);
                }
            }
        }
    }

    findRelation(id: string): Relation | undefined {
        const element = this.findElement(id);
        return Relation.is(element) ? element : undefined;
    }

    findAttribute(id: string): Attribute | undefined {
        const element = this.findElement(id);
        return Attribute.is(element) ? element : undefined;
    }

    findTransition(id: string): Transition | undefined {
        const element = this.findElement(id);
        return Transition.is(element) ? element : undefined;
    }

    findElement(id: string): Relation | Attribute | Transition | undefined {
        return this.idToElements.get(id);
    }
}