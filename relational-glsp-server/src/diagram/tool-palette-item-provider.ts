import {
    Args,
    CreateEdgeOperation,
    CreateNodeOperation,
    CreateOperationHandler,
    MaybePromise,
    OperationHandlerRegistry,
    PaletteItem,
    ToolPaletteItemProvider
} from '@eclipse-glsp/server';
import { inject, injectable } from 'inversify';

const RELATION_TYPE_IDS = ['node:relation'];
const ATTRIBUTE_TYPE_IDS = [
    'node:attribute-primary-key',
    'node:attribute-foreign-key',
    'node:attribute-normal',
    'node:attribute-optional',
    'node:attribute-unique'
];

@injectable()
export class RelationalToolPaletteItemProvider extends ToolPaletteItemProvider {
    @inject(OperationHandlerRegistry) operationHandlerRegistry: OperationHandlerRegistry;

    private counter = 0;

    getItems(_args?: Args): MaybePromise<PaletteItem[]> {
        this.counter = 0;
        const all = this.operationHandlerRegistry.getAll().filter(CreateOperationHandler.is) as CreateOperationHandler[];
        const nodes = all.filter(h => h.operationType === CreateNodeOperation.KIND);
        const edges = all.filter(h => h.operationType === CreateEdgeOperation.KIND);

        return [
            this.group('relations-group', 'Relations', 'A', nodes, RELATION_TYPE_IDS, 'rel-relation'),
            this.group('attributes-group', 'Attributes', 'B', nodes, ATTRIBUTE_TYPE_IDS, 'rel-attribute'),
            this.group('edges-group', 'Edges', 'C', edges, [], 'rel-edge')
        ];
    }

    private group(id: string, label: string, sortString: string, handlers: CreateOperationHandler[], typeIds: string[], icon: string): PaletteItem {
        const filtered = typeIds.length > 0
            ? handlers.filter(h => h.elementTypeIds.some(t => typeIds.includes(t)))
            : handlers;
        const children = filtered.map(h => this.toItem(h)).sort((a, b) => a.sortString.localeCompare(b.sortString));
        return { id, label, actions: [], children, icon, sortString };
    }

    private toItem(handler: CreateOperationHandler): PaletteItem {
        const action = handler.getTriggerActions()[0];
        return {
            id: `palette-item-${this.counter++}`,
            label: handler.label,
            actions: [action],
            sortString: handler.label.charAt(0)
        };
    }
}
