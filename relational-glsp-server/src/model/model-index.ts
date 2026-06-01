import { GModelIndex } from '@eclipse-glsp/server';
import { injectable } from 'inversify';
import { Attribute, Relation, RelationalModel, Transition } from './model';

@injectable()
export class RelationalModelIndex extends GModelIndex {
    protected idToElements = new Map<string, Relation | Attribute | Transition>();

    indexRelationalModel(model: RelationalModel): void {
        this.idToElements.clear();
        
        for (const transition of model.transitions) {
            this.idToElements.set(transition.id, transition);
        }

        for (const relation of model.relations) {
            this.idToElements.set(relation.id, relation);
            
            if (relation.attributes) {
                for (const attribute of relation.attributes) {
                    this.idToElements.set(attribute.id, attribute);
                }
            }
        }
    }

    findRelation(id: string): Relation | undefined {
        const element = this.findElement(id);
        return Relation.is(element) ? element : undefined;
    }

    findAttribute(id: string): Attribute | undefined {
        const element = this.findElement(id);
        return Attribute.is(element) ? element : undefined;
    }

    findTransition(id: string): Transition | undefined {
        const element = this.findElement(id);
        return Transition.is(element) ? element : undefined;
    }

    findElement(id: string): Relation | Attribute | Transition | undefined {
        return this.idToElements.get(id);
    }
}