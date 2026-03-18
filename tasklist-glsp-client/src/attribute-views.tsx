import { GLabel, GNode, GPort, RenderingContext, ShapeView, svg } from '@eclipse-glsp/client';
import { injectable } from 'inversify';
import { VNode } from 'snabbdom';

function repositionPorts(node: GNode): void {
    const width  = node.bounds.width  || 100;
    const height = node.bounds.height || 20;

    node.children.forEach(child => {
        if (child instanceof GPort) {
            const portW = child.bounds.width  || 10;
            const portH = child.bounds.height || 10;
            const y = (height - portH) / 2;

            if (child.cssClasses?.includes('port-left')) child.position = { x: -(portW / 2), y };
            else if (child.cssClasses?.includes('port-right')) child.position = { x: width - portW / 2, y };
        }
    });
}

function getLabelUnderline(node: GNode, height: number): { x1: number; x2: number; y: number } | undefined {
    const label = node.children.find(c => c instanceof GLabel) as GLabel | undefined;
    if (!label) return undefined;

    const labelX = label.bounds.x ?? 0;
    const labelW = label.bounds.width ?? 0;
    const y = (height / 2) + 6;

    return {
        x1: labelX,
        x2: labelX + labelW,
        y
    };
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

        repositionPorts(node);

        const underline = getLabelUnderline(node, height);

        return (
            <g>
                <rect x={0} y={0} width={width} height={height}
                    fill="transparent" stroke="none" />
                {context.renderChildren(node)}
                {underline && (
                    <line
                        x1={underline.x1} y1={underline.y}
                        x2={underline.x2} y2={underline.y}
                        stroke="#283593"
                        stroke-width="1.2"
                        stroke-dasharray="4,3"
                    />
                )}
            </g>
        );
    }
}