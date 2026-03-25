import { Command, CreateEdgeOperation, JsonCreateEdgeOperationHandler, MaybePromise } from '@eclipse-glsp/server';
import { inject, injectable } from 'inversify';
import * as uuid from 'uuid';
import { Transition } from '../model/model';
import { RelationalModelState } from '../model/model-state';

@injectable()
export class CreateTransitionHandler extends JsonCreateEdgeOperationHandler {
    readonly elementTypeIds = ['edge:transition'];
    
    @inject(RelationalModelState)
    protected override modelState: RelationalModelState;

    override createCommand(operation: CreateEdgeOperation): MaybePromise<Command | undefined> {
        return this.commandOf(() => {
            const cleanSourceId = operation.sourceElementId.replace(/_port_(left|right)$/, '');
            const cleanTargetId = operation.targetElementId.replace(/_port_(left|right)$/, '');
            
            const transition: Transition = {
                id: uuid.v4(),
                sourceId: cleanSourceId,
                targetId: cleanTargetId,
                sourcePortId: operation.sourceElementId,
                targetPortId: operation.targetElementId,
                sourceCardinality: '1..1', 
                targetCardinality: '1..1', 
                onUpdate: 'c',  
                onDelete: 'c'
            };
            this.modelState.sourceModel.transitions.push(transition);
        });
    }

    get label(): string { return 'Transition'; }
}