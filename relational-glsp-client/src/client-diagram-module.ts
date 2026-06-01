import {
    boundsFeature,
    configureDefaultModelElements,
    configureModelElement,
    connectableFeature,
    ConsoleLogger,
    ContainerConfiguration,
    DefaultTypes,
    deletableFeature,
    editLabelFeature,
    GCompartment,
    GCompartmentView,
    GEdge,
    GLabel,
    GLabelView,
    GNode,
    GPort,
    hoverFeedbackFeature,
    initializeDiagramContainer,
    layoutableChildFeature,
    layoutContainerFeature,
    LogLevel,
    RectangularNodeView,
    selectFeature,
    TYPES
} from '@eclipse-glsp/client';
import 'balloon-css/balloon.min.css';
import { Container, ContainerModule } from 'inversify';
import '../css/diagram.css';
import { AttributeNodeView } from './attribute-views';
import { TransitionEdgeView } from './transition-edge-view';

const relationalDiagramModule = new ContainerModule((bind, unbind, isBound, rebind) => {
    rebind(TYPES.ILogger).to(ConsoleLogger).inSingletonScope();
    rebind(TYPES.LogLevel).toConstantValue(LogLevel.warn);
    const context = { bind, unbind, isBound, rebind };
    configureDefaultModelElements(context);       

    // Nodes
    configureModelElement(context, 'node:relation', GNode, RectangularNodeView, {
        enable: [boundsFeature, layoutContainerFeature, layoutableChildFeature, selectFeature, hoverFeedbackFeature, deletableFeature]
    });
    configureModelElement(context, 'comp:attributes', GCompartment, GCompartmentView, {
        enable: [boundsFeature, layoutContainerFeature, layoutableChildFeature, hoverFeedbackFeature]
    });

    configureModelElement(context, 'port', GPort, RectangularNodeView, {
        enable: [
            boundsFeature, 
            connectableFeature,
            layoutableChildFeature,
            hoverFeedbackFeature
        ]
    });

    const attributeFeatures = {
        enable: [boundsFeature, layoutableChildFeature, layoutContainerFeature, selectFeature, hoverFeedbackFeature, connectableFeature, deletableFeature]
    };
    configureModelElement(context, 'node:attribute', GNode, AttributeNodeView, attributeFeatures);
    
    // Edges
    const edgeFeatures = { enable: [selectFeature, hoverFeedbackFeature, deletableFeature] };
    configureModelElement(context, 'edge:transition', GEdge, TransitionEdgeView, edgeFeatures);

    // Labels
    configureModelElement(context, DefaultTypes.LABEL, GLabel, GLabelView, { enable: [editLabelFeature] });
    configureModelElement(context, 'label:transition', GLabel, GLabelView, { enable: [editLabelFeature] });

});

export function initializeRelationalDiagramContainer(container: Container, ...containerConfiguration: ContainerConfiguration): Container {
    return initializeDiagramContainer(container, relationalDiagramModule, ...containerConfiguration);
}