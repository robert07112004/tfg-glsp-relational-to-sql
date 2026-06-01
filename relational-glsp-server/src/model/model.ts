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

export type ReferentialAction = 'c' | 'n' | 'r' | 'd';
export type SqlDataType = string;

export namespace SqlDataType {
    export const LENGTH_TYPES           = new Set<string>(['VARCHAR', 'CHAR', 'BINARY', 'VARBINARY']);
    export const PRECISION_TYPES        = new Set<string>(['DECIMAL', 'NUMERIC']);
    export const SINGLE_PRECISION_TYPES = new Set<string>(['FLOAT', 'DOUBLE', 'BIT']);
    export const BASE_TYPES             = new Set<string>([
        'TINYINT', 'SMALLINT', 'MEDIUMINT', 'INT', 'BIGINT',
        'REAL', 'BOOLEAN', 'TINYTEXT', 'TEXT', 'MEDIUMTEXT', 'LONGTEXT',
        'BLOB', 'DATE', 'TIME', 'DATETIME', 'TIMESTAMP', 'YEAR',
        'JSON', 'UUID', 'ENUM', 'SET'
    ]);
    export const ALL_BASE_NAMES = new Set<string>([
        ...LENGTH_TYPES, ...PRECISION_TYPES, ...SINGLE_PRECISION_TYPES, ...BASE_TYPES
    ]);

    export function validate(raw: string): string | null {
        const match = raw.match(/^([A-Z]+)(\((.+)\))?$/);
        if (!match) return 'Formato inválido. Usa "TIPO" o "TIPO(n)"';

        const baseName = match[1];
        const params   = match[3];

        if (!ALL_BASE_NAMES.has(baseName)) {
            return `Tipo "${baseName}" no reconocido`;
        }

        if (LENGTH_TYPES.has(baseName)) {
            if (params === undefined) return `${baseName} requiere longitud. Ej: ${baseName}(255)`;
            const n = Number(params);
            if (!Number.isInteger(n) || n < 1) return `${baseName}(n): n debe ser un entero positivo`;
        }

        if (PRECISION_TYPES.has(baseName)) {
            if (params === undefined) return `${baseName} requiere precisión. Ej: ${baseName}(10,2)`;
            const parts = params.split(',');
            if (parts.length > 2) return `${baseName} acepta máximo dos parámetros: (precisión, escala)`;
            const p = Number(parts[0]);
            const s = parts[1] !== undefined ? Number(parts[1]) : 0;
            if (!Number.isInteger(p) || p < 1) return `${baseName}(p,s): precisión debe ser entero positivo`;
            if (!Number.isInteger(s) || s < 0 || s > p) return `${baseName}(p,s): escala debe ser entre 0 y ${p}`;
        }

        if (SINGLE_PRECISION_TYPES.has(baseName)) {
            if (params === undefined) return `${baseName} requiere precisión. Ej: ${baseName}(24)`;
            const n = Number(params);
            if (!Number.isInteger(n) || n < 1) return `${baseName}(p): p debe ser un entero positivo`;
        }

        if (BASE_TYPES.has(baseName) && params !== undefined) return `${baseName} no acepta parámetros`;
        return null;
    }
}

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
    dataType: SqlDataType;
    isPK: boolean;
    isFK: boolean;
    isNN: boolean;
    isUN: boolean;
}

export namespace Attribute {
    
    export function toDisplayText(attr: Attribute): string {
        const prefix = attr.isFK ? 'FK ' : '';
        const suffix = !attr.isNN ? ' *' : '';
        return `${prefix}${attr.name}: ${attr.dataType}${suffix}`;
    }

    export function parseDisplayText(text: string): Pick<Attribute, 'name' | 'dataType' | 'isFK' | 'isNN'> {
        let raw = text.trim();

        // Sufijo nullable
        const isNN = !raw.endsWith(' *');
        if (!isNN) raw = raw.slice(0, -2).trim();

        // Prefijo FK
        const isFK = raw.toUpperCase().startsWith('FK ');
        if (isFK) raw = raw.slice(3).trim();

        // "nombre: TIPO"
        const colonIndex = raw.indexOf(':');
        if (colonIndex <= 0 || !raw.slice(colonIndex + 1).trim()) {
            throw 'Formato: "[FK] nombre: TIPO [*]"';
        }

        return {
            name:     raw.slice(0, colonIndex).trim(),
            dataType: raw.slice(colonIndex + 1).trim().toUpperCase(),
            isFK,
            isNN
        };
    }

    export function is(object: any): object is Attribute {
        return (
            AnyObject.is(object) &&
            hasStringProp(object, 'id') &&
            hasStringProp(object, 'type') && (object as Attribute).type === 'attribute' &&
            hasStringProp(object, 'name') &&
            hasStringProp(object, 'dataType')
        );
    }
}

export interface Transition {
    id: string;
    sourceId: string;
    targetId: string;
    sourcePortId?: string;
    targetPortId?: string;
    sourceCardinality: string;
    targetCardinality: string;
    onUpdate?: ReferentialAction;
    onDelete?: ReferentialAction;
    routingPoints?: { x: number, y: number }[];
}

export namespace Transition {
    export function getLabel(t: Transition): string {
        const u = t.onUpdate ?? 'r';
        const d = t.onDelete ?? 'r';
        return `u:${u} d:${d}`;
    }

    export function is(object: any): object is Transition {
        return (
            AnyObject.is(object) &&
            hasStringProp(object, 'id') &&
            hasStringProp(object, 'sourceId') &&
            hasStringProp(object, 'targetId') &&
            hasStringProp(object, 'sourceCardinality') &&
            hasStringProp(object, 'targetCardinality')
        );
    }
}
