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
    ActionHandlerConstructor,
    BindingTarget,
    ComputedBoundsActionHandler,
    DiagramConfiguration,
    DiagramModule,
    GModelFactory,
    GModelIndex,
    InstanceMultiBinding,
    LabelEditValidator,
    ModelState,
    OperationHandlerConstructor,
    SourceModelStorage
} from '@eclipse-glsp/server';
import { injectable } from 'inversify';
import { RelationalApplyLabelEditHandler } from '../handler/apply-label-edit-handler';
import { RelationalChangeBoundsHandler } from '../handler/change-bounds-handler';
import { CreateAttributeHandler } from '../handler/create-attribute-node-handler';
import { CreateRelationHandler } from '../handler/create-relation-node-handler';
import { CreateTransitionHandler } from '../handler/create-transition-handler';
import { RelationalDeleteElementHandler } from '../handler/delete-element-handler'; // Le he puesto el prefijo Relational por consistencia
import { RelationalLabelEditValidator } from '../handler/label-edit-validator';
import { RelationalGModelFactory } from '../model/gmodel-factory';
import { RelationalModelIndex } from '../model/model-index';
import { RelationalModelState } from '../model/model-state';
import { RelationalModelStorage } from '../model/storage';
import { RelationalDiagramConfiguration } from './diagram-configuration';

@injectable()
export class RelationalDiagramModule extends DiagramModule {
    // CRÍTICO: Este string debe coincidir EXACTAMENTE con el tipo de diagrama que registres en el cliente web/theia/vscode.
    readonly diagramType = 'relational-diagram';

    protected bindDiagramConfiguration(): BindingTarget<DiagramConfiguration> {
        return RelationalDiagramConfiguration;
    }

    protected bindSourceModelStorage(): BindingTarget<SourceModelStorage> {
        return RelationalModelStorage;
    }

    protected bindModelState(): BindingTarget<ModelState> {
        return { service: RelationalModelState };
    }

    protected bindGModelFactory(): BindingTarget<GModelFactory> {
        return RelationalGModelFactory;
    }

    protected override configureActionHandlers(binding: InstanceMultiBinding<ActionHandlerConstructor>): void {
        super.configureActionHandlers(binding);
        binding.add(ComputedBoundsActionHandler);
    }

    protected override configureOperationHandlers(binding: InstanceMultiBinding<OperationHandlerConstructor>): void {
        super.configureOperationHandlers(binding);
        binding.add(CreateRelationHandler);
        binding.add(CreateAttributeHandler);
        binding.add(CreateTransitionHandler);
        binding.add(RelationalChangeBoundsHandler);
        binding.add(RelationalApplyLabelEditHandler);
        binding.add(RelationalDeleteElementHandler);
    }

    protected override bindGModelIndex(): BindingTarget<GModelIndex> {
        this.context.bind(RelationalModelIndex).toSelf().inSingletonScope();
        return { service: RelationalModelIndex };
    }

    protected override bindLabelEditValidator(): BindingTarget<LabelEditValidator> | undefined {
        return RelationalLabelEditValidator;
    }
}