import { Command, JsonOperationHandler, MaybePromise, PasteOperation, Point } from '@eclipse-glsp/server';
import { inject, injectable } from 'inversify';
import * as uuid from 'uuid';
import { Attribute, Relation, RelationalModel } from '../model/model';
import { RelationalModelIndex } from '../model/model-index';
import { RelationalModelState } from '../model/model-state';

const PASTE_OFFSET = 20;

@injectable()
export class RelationalPasteOperationHandler extends JsonOperationHandler {
    readonly operationType = PasteOperation.KIND;

    @inject(RelationalModelState)
    protected override modelState: RelationalModelState;

    protected get index(): RelationalModelIndex {
        return this.modelState.index as RelationalModelIndex;
    }

    override createCommand(operation: PasteOperation): MaybePromise<Command | undefined> {
        const jsonString = (operation.clipboardData as any)?.['application/json'];
        if (!jsonString) return undefined;

        let schemas: any[];
        try {
            schemas = JSON.parse(jsonString);
        } catch {
            return undefined;
        }

        const relations = schemas
            .filter(s => s.type === 'node:relation')
            .map(s => this.index.findRelation(s.id))
            .filter((r): r is Relation => r !== undefined);

        if (relations.length === 0) return undefined;

        return this.commandOf(() => {
            const offset = this.computeOffset(relations, (operation.editorContext as any)?.lastMousePosition);
            const model = this.modelState.sourceModel as RelationalModel;
            for (const relation of relations) {
                this.cloneRelation(model, relation, offset);
            }
        });
    }

    private computeOffset(relations: Relation[], lastMousePosition?: Point): Point {
        if (!lastMousePosition) {
            return { x: PASTE_OFFSET, y: PASTE_OFFSET };
        }
        const ref = relations.reduce((top, r) => r.position.y < top.position.y ? r : top);
        return {
            x: lastMousePosition.x - ref.position.x,
            y: lastMousePosition.y - ref.position.y
        };
    }

    private cloneRelation(model: RelationalModel, relation: Relation, offset: Point): void {
        const newAttributes: Attribute[] = (relation.attributes ?? []).map(attr => ({
            ...attr,
            id: uuid.v4()
        }));

        const clone: Relation = {
            ...relation,
            id: uuid.v4(),
            position: {
                x: relation.position.x + offset.x,
                y: relation.position.y + offset.y
            },
            attributes: newAttributes
        };

        model.relations.push(clone);
    }
}
