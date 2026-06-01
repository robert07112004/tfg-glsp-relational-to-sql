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

            // Recorremos las líneas que el usuario ha movido
            for (const change of operation.newRoutingPoints) {
                const edgeId = change.elementId;
                
                // Buscamos la transición en nuestro modelo semántico
                const transition = sourceModel.transitions.find(t => t.id === edgeId);
                
                if (transition) {
                    // Guardamos los nuevos codos de la flecha
                    transition.routingPoints = change.newRoutingPoints;
                }
            }
        });
    }
}