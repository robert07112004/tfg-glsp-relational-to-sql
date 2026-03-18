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
import { GModelElement, LabelEditValidator, ValidationStatus } from '@eclipse-glsp/server';
import { inject, injectable } from 'inversify';
import { Attribute, SqlDataType } from '../model/model';
import { RelationalModelState } from '../model/model-state';

/**
 * A simple edit label validator that verifies that the given name label is not empty,
 * and optionally validates the format for specific node types.
 */
@injectable()
export class RelationalLabelEditValidator implements LabelEditValidator {
    @inject(RelationalModelState)
    protected relationalModelState: RelationalModelState;

    validate(label: string, element: GModelElement): ValidationStatus {
        const trimmedLabel = label.trim();

        if (trimmedLabel.length < 1) return { severity: ValidationStatus.Severity.ERROR, message: 'Name must not be empty' };

        // Validar label de transición
        if (element.type === 'label:transition') {
            const valid = /^u:[cnrd]\s+d:[cnrd]$/i.test(trimmedLabel);
            if (!valid) return {
                severity: ValidationStatus.Severity.ERROR,
                message: 'Formato: "u:X d:X" (c=cascade, n=set null, r=restrict, d=set default)'
            };
            return { severity: ValidationStatus.Severity.OK };
        }

        // Validar label de atributo
        const parentId = element.id.replace(/_label$/, '');
        const parent   = this.relationalModelState.index.findElement(parentId);

        if (parent && Attribute.is(parent)) {
            let raw = trimmedLabel;
            if (raw.startsWith('FK ')) raw = raw.slice(3).trim();
            if (raw.endsWith(' *'))    raw = raw.slice(0, -2).trim();

            const colonIndex = raw.indexOf(':');
            if (colonIndex === -1 || !raw.slice(0, colonIndex).trim() || !raw.slice(colonIndex + 1).trim()) {
                return {
                    severity: ValidationStatus.Severity.ERROR,
                    message: 'Formato: "nombreAtributo: TIPO" (ej: "email: VARCHAR(255)")'
                };
            }

            const dataType = raw.slice(colonIndex + 1).trim().toUpperCase();
            const error    = SqlDataType.validate(dataType);
            if (error) return { severity: ValidationStatus.Severity.ERROR, message: error };
        }

        return { severity: ValidationStatus.Severity.OK };
    }
}