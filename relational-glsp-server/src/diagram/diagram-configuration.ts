import {
    DiagramConfiguration,
    EdgeTypeHint,
    getDefaultMapping,
    GModelElement,
    GModelElementConstructor,
    ServerLayoutKind,
    ShapeTypeHint
} from '@eclipse-glsp/server';
import { injectable } from 'inversify';

@injectable()
export class RelationalDiagramConfiguration implements DiagramConfiguration {
    layoutKind = ServerLayoutKind.MANUAL;
    needsClientLayout = true;
    animatedUpdate = true;

    get typeMapping(): Map<string, GModelElementConstructor<GModelElement>> {
        return getDefaultMapping();
    }

    get shapeTypeHints(): ShapeTypeHint[] {
        const attributeTypeIds = [
            'node:attribute-primary-key',
            'node:attribute-foreign-key',
            'node:attribute-normal',
            'node:attribute-optional',
            'node:attribute-unique'
        ];

        return [
            {
                elementTypeId: 'node:relation',
                deletable: true,
                reparentable: false,
                repositionable: true,
                resizable: true,
                containableElementTypeIds: ['node:attribute']
            },
            {
                elementTypeId: 'comp:attributes',
                deletable: false, 
                reparentable: false,
                repositionable: false,
                resizable: false,
                containableElementTypeIds: ['node:attribute']
            },
            ...attributeTypeIds.map(typeId => ({
                elementTypeId: typeId,
                deletable: true,
                reparentable: false,
                repositionable: false,
                resizable: false
            }))
        ];
    }

    get edgeTypeHints(): EdgeTypeHint[] {
        return [{
            elementTypeId: 'edge:transition',
            deletable: true,
            repositionable: true,
            routable: true,
            sourceElementTypeIds: ['port'],
            targetElementTypeIds: ['port', 'node:relation']
        }];
    }
    
}