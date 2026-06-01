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
    RequestClipboardDataActionHandler,
    SourceModelStorage
} from '@eclipse-glsp/server';
import { injectable } from 'inversify';
import { RelationalApplyLabelEditHandler } from '../handler/apply-label-edit-handler';
import { RelationalChangeBoundsHandler } from '../handler/change-bounds-handler';
import { ChangeRoutingPointsHandler } from '../handler/change-routing-points-handler';
import { RelationalDeleteElementHandler } from '../handler/delete-element-handler';
import { CreateTransitionHandler } from '../handler/edge-handlers/create-transition-handler';
import { SQLGenerator } from '../handler/generator/sql-generator';
import { RelationalLabelEditValidator } from '../handler/label-edit-validator';
import { CreateAlternativeKeyHandler, CreateForeignKeyAttributeHandler, CreateNormalAttributeHandler, CreateOptionalAttributeHandler, CreatePrimaryKeyAttributeHandler } from '../handler/node-handlers/create-attribute-node-handler';
import { CreateRelationHandler } from '../handler/node-handlers/create-relation-node-handler';
import { RelationalPasteOperationHandler } from '../handler/paste-operation-handler';
import { GenerateSqlActionHandler } from '../handler/sql-handler/generate-sql-handler';
import { RelationalModelValidator } from '../handler/validation/model-validator';
import { RelationalGModelFactory } from '../model/gmodel-factory';
import { RelationalModelIndex } from '../model/model-index';
import { RelationalModelState } from '../model/model-state';
import { RelationalModelStorage } from '../model/storage';
import { RelationalDiagramConfiguration } from './diagram-configuration';

@injectable()
export class RelationalDiagramModule extends DiagramModule {
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
        binding.add(RequestClipboardDataActionHandler);
        binding.add(GenerateSqlActionHandler);
    }

    protected override configureOperationHandlers(binding: InstanceMultiBinding<OperationHandlerConstructor>): void {
        super.configureOperationHandlers(binding);
        binding.add(CreateRelationHandler);
        binding.add(CreatePrimaryKeyAttributeHandler);
        binding.add(CreateAlternativeKeyHandler);
        binding.add(CreateNormalAttributeHandler);
        binding.add(CreateOptionalAttributeHandler);
        binding.add(CreateForeignKeyAttributeHandler);
        binding.add(CreateTransitionHandler);
        binding.add(RelationalChangeBoundsHandler);
        binding.add(RelationalApplyLabelEditHandler);
        binding.add(RelationalDeleteElementHandler);
        binding.add(ChangeRoutingPointsHandler);
        binding.add(RelationalPasteOperationHandler);
    }

    protected override bindModelValidator(): BindingTarget<RelationalModelValidator> | undefined {
        this.context.bind(RelationalModelValidator).toSelf().inSingletonScope();
        this.context.bind(SQLGenerator).toSelf().inSingletonScope();
        return RelationalModelValidator;
    }

    protected override bindGModelIndex(): BindingTarget<GModelIndex> {
        this.context.bind(RelationalModelIndex).toSelf().inSingletonScope();
        return { service: RelationalModelIndex };
    }

    protected override bindLabelEditValidator(): BindingTarget<LabelEditValidator> | undefined {
        return RelationalLabelEditValidator;
    }
}