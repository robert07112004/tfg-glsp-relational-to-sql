/********************************************************************************
 * Copyright (c) 2022 EclipseSource and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * This Source Code may also be made available under the following Secondary
 * Licenses when the conditions for such availability set forth in the Eclipse
 * Public License v. 2.0 are satisfied:
 * -- GNU General Public License, version 2 with the GNU Classpath Exception
 * which is available at https://www.gnu.org/software/classpath/license.html
 * -- MIT License which is available at https://opensource.org/license/mit.
 *
 * SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0 OR MIT
 ********************************************************************************/
import { GCompartment, GEdge, GGraph, GLabel, GModelFactory, GNode, GPort } from '@eclipse-glsp/server';
import { inject, injectable } from 'inversify';
import { Attribute, Relation, Transition } from './model';
import { RelationalModelState } from './model-state';

@injectable()
export class RelationalGModelFactory implements GModelFactory {
    @inject(RelationalModelState)
    protected modelState: RelationalModelState;

    createModel(): void {
        const model = this.modelState.sourceModel;
        this.modelState.index.indexRelationalModel(model); 
        
        const childNodes = [
            ...model.relations.map(relation => this.createRelationNode(relation))
        ];
        const childEdges = model.transitions.map(transition => this.createTransitionEdge(transition));
        
        const newRoot = GGraph.builder() 
            .id(model.id)
            .addChildren(childNodes)
            .addChildren(childEdges)
            .build();
            
        this.modelState.updateRoot(newRoot);
    }

    protected createRelationNode(relation: Relation): GNode {
        const builder = GNode.builder()
            .id(relation.id)
            .type('node:relation')
            .addCssClass('relation-node') 
            .layout('vbox') 
            .addLayoutOption('padding', 5)
            .position(relation.position)
            .add(GLabel.builder()
                .text(relation.name)
                .id(`${relation.id}_label`)
                .build()
            );

        const attrCompartment = GCompartment.builder()                  
            .id(`${relation.id}_attributes_comp`)
            .type('comp:attributes') 
            .layout('vbox')
            .addCssClass('attributes-compartment');

        if (relation.attributes && relation.attributes.length > 0) {
            relation.attributes.forEach(attr => {                           
                attrCompartment.add(this.createAttributeNode(attr));
            });
        }

        builder.add(attrCompartment.build());                           
        if (relation.size) builder.addLayoutOptions({ prefWidth: relation.size.width, prefHeight: relation.size.height });
        
        return builder.build();
    }

    protected createAttributeNode(attribute: Attribute): GNode {
        const builder = GNode.builder()
            .id(attribute.id)
            .type('node:attribute')
            .addCssClass('attribute');

        if (attribute.isPK) builder.addCssClass('attribute-pk');
        if (attribute.isFK) builder.addCssClass('attribute-fk');
        if (attribute.isUN) builder.addCssClass('attribute-un');

        builder
            .layout('hbox')
            .addLayoutOption('paddingLeft', 8)
            .addLayoutOption('paddingRight', 8);

        builder.add(GPort.builder()
            .id(`${attribute.id}_port_left`)
            .type('port')
            .size({ width: 10, height: 10 })
            .addCssClass('port-left')
            .addLayoutOption('position', 'absolute')
            .position({ x: -5, y: 0 })
            .build()
        );

        builder.add(GLabel.builder()
            .text(Attribute.toDisplayText(attribute))
            .id(`${attribute.id}_label`)
            .build()
        );

        builder.add(GPort.builder()
            .id(`${attribute.id}_port_right`)
            .type('port')
            .size({ width: 10, height: 10 })
            .addCssClass('port-right')
            .addLayoutOption('position', 'absolute')
            .position({ x: 9999, y: 0 })
            .build()
        );

        return builder.build();
    }

    protected createTransitionEdge(transition: Transition): GEdge {
        const builder = GEdge.builder()
            .id(transition.id)
            .type('edge:transition')
            .addCssClass('transition')
            .sourceId(transition.sourcePortId || transition.sourceId)
            .targetId(transition.targetPortId || transition.targetId);
            
        if (transition.routingPoints && transition.routingPoints.length > 0) {
            builder.addRoutingPoints(transition.routingPoints);
        }

        return builder.add(
                GLabel.builder()
                    .id(`${transition.id}_sourceCard`)
                    .type('label:cardinality')
                    .addCssClass('cardinality-label')
                    .text(transition.sourceCardinality || '1..1')
                    .edgePlacement({
                        position: 0.05,
                        side: 'top',
                        offset: 5,
                        rotate: false
                    })
                    .build()
            )
            .add(
                GLabel.builder()
                    .id(`${transition.id}_actions`)
                    .type('label:transition')
                    .addCssClass('transition-label')
                    .text(Transition.getLabel(transition))
                    .edgePlacement({
                        position: 0.5,
                        side: 'top',
                        offset: 5,
                        rotate: false
                    })
                    .build()
            )
            .add(
                GLabel.builder()
                    .id(`${transition.id}_targetCard`)
                    .type('label:cardinality')
                    .addCssClass('cardinality-label')
                    .text(transition.targetCardinality || '0..N')
                    .edgePlacement({
                        position: 0.90,
                        side: 'top',
                        offset: 5,
                        rotate: false
                    })
                    .build()
            )
            .build();
    }
}