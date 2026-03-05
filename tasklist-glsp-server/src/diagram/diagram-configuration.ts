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
import {
    DiagramConfiguration,
    EdgeTypeHint,
    getDefaultMapping,
    GModelElement,
    GModelElementConstructor,
    ServerLayoutKind,
    ShapeTypeHint
} from '@eclipse-glsp/server';
import { injectable } from 'inversify';

@injectable()
export class RelationalDiagramConfiguration implements DiagramConfiguration {
    layoutKind = ServerLayoutKind.MANUAL;
    needsClientLayout = true;
    animatedUpdate = true;

    get typeMapping(): Map<string, GModelElementConstructor<GModelElement>> {
        return getDefaultMapping();
    }

    get shapeTypeHints(): ShapeTypeHint[] {
        const attributeTypeIds = [
            'node:attribute-primary-key',
            'node:attribute-alternative-key',
            'node:attribute-normal',
            'node:attribute-optional',
            'node:attribute-foreign-key'
        ];

        return [
            {
                elementTypeId: 'node:relation',
                deletable: true,
                reparentable: false,
                repositionable: true,
                resizable: true,
                containableElementTypeIds: ['node:attribute']
            },
            {
                elementTypeId: 'comp:attributes',
                deletable: false, 
                reparentable: false,
                repositionable: false,
                resizable: false,
                containableElementTypeIds: ['node:attribute']
            },
            ...attributeTypeIds.map(typeId => ({
                elementTypeId: typeId,
                deletable: true,
                reparentable: true,
                repositionable: false,
                resizable: false
            }))
        ];
    }

    get edgeTypeHints(): EdgeTypeHint[] {
        return [
            {
                elementTypeId: 'edge:transition',
                deletable: true,
                repositionable: true,
                routable: true,
                sourceElementTypeIds: ['node:attribute-primary-key', 'node:attribute-foreign-key'],
                targetElementTypeIds: ['node:attribute-primary-key', 'node:attribute-foreign-key']
            }
        ];
    }
}