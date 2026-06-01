import { ChangeBoundsOperation, Command, Dimension, GNode, JsonOperationHandler, MaybePromise, Point } from '@eclipse-glsp/server';
import { inject, injectable } from 'inversify';
import { RelationalModelState } from '../model/model-state';

@injectable()
export class RelationalChangeBoundsHandler extends JsonOperationHandler {
    readonly operationType = ChangeBoundsOperation.KIND;

    @inject(RelationalModelState)
    protected override modelState: RelationalModelState;

    override createCommand(operation: ChangeBoundsOperation): MaybePromise<Command | undefined> {
        return this.commandOf(() => {
            operation.newBounds.forEach(element => 
                this.changeElementBounds(element.elementId, element.newSize, element.newPosition)
            );
        });
    }

    protected changeElementBounds(elementId: string, newSize: Dimension, newPosition?: Point): void {
        const index = this.modelState.index;
        const node = index.findByClass(elementId, GNode);
        if (!node) return;

        if (node.type === 'node:relation') {                                
            const relation = index.findRelation(node.id);
            if (relation) {
                relation.size = newSize;
                if (newPosition) relation.position = newPosition;
            }
        } 
    }
}