// attribute-views.ts
import { GNode, GPort, RenderingContext, ShapeView, svg } from '@eclipse-glsp/client';
import { injectable } from 'inversify';
import { VNode } from 'snabbdom';

// Función compartida para reposicionar puertos en los bordes laterales
function repositionPorts(node: GNode): void {
    const width  = node.bounds.width  || 100;
    const height = node.bounds.height || 20;

    node.children.forEach(child => {
        if (child instanceof GPort) {
            const portW = child.bounds.width  || 10;
            const portH = child.bounds.height || 10;
            const y = (height - portH) / 2;

            if (child.cssClasses?.includes('port-left')) {
                child.position = { x: -(portW / 2), y };
            } else if (child.cssClasses?.includes('port-right')) {
                child.position = { x: width - portW / 2, y };
            }
        }
    });
}

@injectable()
export class AttributeNodeView extends ShapeView {
    render(node: GNode, context: RenderingContext): VNode | undefined {
        const width  = node.bounds.width  || 100;
        const height = node.bounds.height || 20;

        repositionPorts(node);

        return (
            <g>
                <rect x={0} y={0} width={width} height={height}
                    fill="transparent" stroke="none" /> 
                {context.renderChildren(node)}
            </g>
        );
    }
}

@injectable()
export class AlternativeKeyAttributeView extends ShapeView {
    render(node: GNode, context: RenderingContext): VNode | undefined {
        const width  = node.bounds.width  || 100;
        const height = node.bounds.height || 20;
        const textBaseline = (height / 2) + 6;

        repositionPorts(node);  // misma lógica

        return (
            <g>
                <rect x={0} y={0} width={width} height={height}
                    fill="transparent" stroke="none" />
                {context.renderChildren(node)}
                <line
                    x1={4}         y1={textBaseline}
                    x2={width - 4} y2={textBaseline}
                    stroke="#283593"
                    stroke-width="1.2"
                    stroke-dasharray="4,3"
                />
            </g>
        );
    }
}