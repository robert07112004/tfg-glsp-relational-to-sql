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

        // Etiqueta no puede estar vacía
        if (trimmedLabel.length < 1) return { severity: ValidationStatus.Severity.ERROR, message: 'Name must not be empty' };

        // 2. (Opcional) Si es un atributo, verificar que tenga un formato específico
        // Asumiendo que el ID del label tiene la forma "id_del_atributo_label" o podemos buscar a su padre
        // Por simplicidad, si decides forzar el formato "nombre: TIPO", podrías habilitar esto:
        /*
        const parentId = element.id.replace('_label', '');
        const parentNode = this.relationalModelState.index.findElement(parentId);
        
        if (parentNode && parentNode.type === 'attribute') {
            if (!trimmedLabel.includes(':')) {
                return { 
                    severity: ValidationStatus.Severity.ERROR, 
                    message: 'Attributes must specify a type using ":" (e.g., "id: INT")' 
                };
            }
        }
        */

        return { severity: ValidationStatus.Severity.OK };
    }
}