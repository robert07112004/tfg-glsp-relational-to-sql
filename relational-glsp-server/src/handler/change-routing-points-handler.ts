import {
    ChangeRoutingPointsOperation,
    Command,
    JsonOperationHandler,
    MaybePromise
} from '@eclipse-glsp/server';
import { inject, injectable } from 'inversify';
import { RelationalModel } from '../model/model';
import { RelationalModelState } from '../model/model-state';

@injectable()
export class ChangeRoutingPointsHandler extends JsonOperationHandler {
    readonly operationType = ChangeRoutingPointsOperation.KIND;

    @inject(RelationalModelState)
    protected override modelState: RelationalModelState;

    override createCommand(operation: ChangeRoutingPointsOperation): MaybePromise<Command | undefined> {
        return this.commandOf(() => {
            const sourceModel = this.modelState.sourceModel as RelationalModel;
            for (const change of operation.newRoutingPoints) {
                const edgeId = change.elementId;
                const transition = sourceModel.transitions.find(t => t.id === edgeId);    
                if (transition) {
                    transition.routingPoints = change.newRoutingPoints;
                }
            }
        });
    }
}