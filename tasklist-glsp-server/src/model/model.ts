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

import { AnyObject, hasArrayProp, hasObjectProp, hasStringProp } from '@eclipse-glsp/server';

/**
 * The source model for `tasklist` GLSP diagrams. A `TaskList` is a
 * plain JSON objects that contains a set of {@link Task tasks} and {@link Transition transitions}.
 */
export interface RelationalModel {
    id: string;
    relations: Relation[];
    transitions: Transition[];
}

export namespace RelationalModel {
    export function is(object: any): object is RelationalModel {
        return (
            AnyObject.is(object) && 
            hasStringProp(object, 'id') && 
            hasArrayProp(object, 'relations') &&
            hasArrayProp(object, 'transitions')
        );
    }
}

export interface Relation {
    id: string;
    type: 'relation';
    name: string;
    attributes?: Attribute[];
    position: { x: number; y: number };
    size?: { width: number; height: number };
}

export namespace Relation {
    export function is(object: any): object is Relation {
        let isValid = AnyObject.is(object) && 
                      hasStringProp(object, 'id') && 
                      hasStringProp(object, 'type') && (object as Relation).type === 'relation' &&          
                      hasStringProp(object, 'name') && 
                      hasObjectProp(object, 'position');
        
        if (isValid && object.attributes !== undefined) {
            isValid = hasArrayProp(object, 'attributes') && 
                      object.attributes.every(Attribute.is);
        }
        return isValid;
    }
}

export interface Attribute {
    id: string;
    type: 'attribute';
    name: string;
    kind: 'primary-key' | 'alternative-key' | 'normal-attribute' | 'optional-attribute' | 'foreign-key';
}

export namespace Attribute {
    export function is(object: any): object is Attribute {
        return (
            AnyObject.is(object) && 
            hasStringProp(object, 'id') && 
            hasStringProp(object, 'type') && (object as Attribute).type === 'attribute' &&
            hasStringProp(object, 'kind') &&
            hasStringProp(object, 'name')
        );
    }
}

export interface Transition {
    id: string;
    sourceId: string;
    targetId: string;
}

export namespace Transition {
    export function is(object: any): object is Transition {
        return (
            AnyObject.is(object) &&
            hasStringProp(object, 'id') &&
            hasStringProp(object, 'sourceId') &&
            hasStringProp(object, 'targetId')
        );
    }
}
