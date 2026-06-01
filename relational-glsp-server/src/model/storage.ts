import { AbstractJsonModelStorage, MaybePromise, RequestModelAction, SaveModelAction } from '@eclipse-glsp/server/node';
import { inject, injectable } from 'inversify';
import * as uuid from 'uuid';
import { RelationalModel } from './model';
import { RelationalModelState } from './model-state';

@injectable()
export class RelationalModelStorage extends AbstractJsonModelStorage {
    @inject(RelationalModelState)
    protected override modelState: RelationalModelState;

    loadSourceModel(action: RequestModelAction): MaybePromise<void> {
        const sourceUri = this.getSourceUri(action);
        const model = this.loadFromFile(sourceUri, RelationalModel.is);
        this.modelState.updateSourceModel(model);
    }

    saveSourceModel(action: SaveModelAction): MaybePromise<void> {
        const sourceUri = this.getFileUri(action);
        this.writeFile(sourceUri, this.modelState.sourceModel);
    }

    protected override createModelForEmptyFile(path: string): RelationalModel {
        return {
            id: uuid.v4(),
            relations: [],
            transitions: []
        };
    }
}