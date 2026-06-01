import {
    Command,
    CreateNodeOperation,
    JsonCreateNodeOperationHandler,
    MaybePromise,
    Point
} from '@eclipse-glsp/server';
import { inject, injectable } from 'inversify';
import * as uuid from 'uuid';
import { Relation } from '../../model/model';
import { RelationalModelState } from '../../model/model-state';

@injectable()
export class CreateRelationHandler extends JsonCreateNodeOperationHandler {
    readonly elementTypeIds = ['node:relation'];

    @inject(RelationalModelState)
    protected override modelState: RelationalModelState;

    override createCommand(operation: CreateNodeOperation): MaybePromise<Command | undefined> {
        return this.commandOf(() => {
            const relativeLocation = this.getRelativeLocation(operation) ?? Point.ORIGIN;
            const relation = this.createRelation(relativeLocation);
            const model = this.modelState.sourceModel;
            model.relations.push(relation);
        });
    }

    protected createRelation(position: Point): Relation {
        const relationCounter = this.modelState.sourceModel.relations.length;
        return {
            id: uuid.v4(),
            type: 'relation',
            name: `NewRelation${relationCounter + 1}`,
            position,
            attributes: [] 
        };
    }

    get label(): string {
        return 'Relation';
    }
}
