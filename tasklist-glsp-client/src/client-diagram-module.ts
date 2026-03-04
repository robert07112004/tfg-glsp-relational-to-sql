/********************************************************************************
 * Copyright (c) 2022-2023 EclipseSource and others.
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
import {
    boundsFeature,
    configureDefaultModelElements,
    configureModelElement,
    ConsoleLogger,
    ContainerConfiguration,
    DefaultTypes,
    editLabelFeature,
    GCompartment,
    GCompartmentView,
    GEdge,
    GLabel,
    GLabelView,
    GNode,
    hoverFeedbackFeature,
    initializeDiagramContainer,
    layoutableChildFeature,
    layoutContainerFeature,
    LogLevel,
    PolylineEdgeView,
    RectangularNodeView,
    selectFeature,
    TYPES
} from '@eclipse-glsp/client';
import 'balloon-css/balloon.min.css';
import { Container, ContainerModule } from 'inversify';
import '../css/diagram.css';

const relationalDiagramModule = new ContainerModule((bind, unbind, isBound, rebind) => {
    rebind(TYPES.ILogger).to(ConsoleLogger).inSingletonScope();
    rebind(TYPES.LogLevel).toConstantValue(LogLevel.warn);
    const context = { bind, unbind, isBound, rebind };
    configureDefaultModelElements(context);       

    // Nodes
    configureModelElement(context, 'node:relation', GNode, RectangularNodeView, {
        enable: [boundsFeature, layoutContainerFeature, layoutableChildFeature, selectFeature, hoverFeedbackFeature]
    });
    configureModelElement(context, 'comp:attributes', GCompartment, GCompartmentView, {
        enable: [boundsFeature, layoutContainerFeature, layoutableChildFeature, hoverFeedbackFeature]
    });
    configureModelElement(context, 'node:attribute', GNode, RectangularNodeView, { 
        enable: [boundsFeature, layoutableChildFeature, selectFeature]
    });
    
    // Edges
    configureModelElement(context, 'edge:transition', GEdge, PolylineEdgeView, { enable: [selectFeature] });

    // Labels
    configureModelElement(context, DefaultTypes.LABEL, GLabel, GLabelView, { enable: [editLabelFeature] });
});

export function initializeRelationalDiagramContainer(container: Container, ...containerConfiguration: ContainerConfiguration): Container {
    return initializeDiagramContainer(container, relationalDiagramModule, ...containerConfiguration);
}