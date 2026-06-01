import { DefaultModelState, JsonModelState } from '@eclipse-glsp/server';
import { inject, injectable } from 'inversify';
import { RelationalModel } from './model';
import { RelationalModelIndex } from './model-index';

@injectable()
export class RelationalModelState extends DefaultModelState implements JsonModelState<RelationalModel> {
    @inject(RelationalModelIndex)
    override readonly index: RelationalModelIndex;

    protected _relationalModel: RelationalModel;

    get sourceModel(): RelationalModel {
        return this._relationalModel;
    }

    updateSourceModel(model: RelationalModel): void {
        this._relationalModel = model;
        this.index.indexRelationalModel(model); 
    }
}