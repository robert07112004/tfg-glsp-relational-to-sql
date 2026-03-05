import { GNode, RenderingContext, ShapeView, svg } from '@eclipse-glsp/client';
import { injectable } from 'inversify';
import { VNode } from 'snabbdom';

@injectable()
export class AlternativeKeyAttributeView extends ShapeView {
    render(node: GNode, context: RenderingContext): VNode | undefined {
        const width  = node.bounds.width  || 100;
        const height = node.bounds.height || 20;
        const textBaseline = (height / 2) + 6;

        return (
            <g>
                <rect
                    x={0} y={0}
                    width={width} height={height}
                    fill="transparent"  
                    stroke="none"
                />
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