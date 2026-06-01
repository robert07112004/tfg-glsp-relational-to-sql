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

@injectable()
export class AttributeNodeView extends ShapeView {
    render(node: GNode, context: RenderingContext): VNode | undefined {
        const width  = node.bounds.width  || 100;
        const height = node.bounds.height || 20;

        repositionPorts(node);

        const css  = node.cssClasses ?? [];
        const isPK = css.includes('attribute-pk');
        const isUN = css.includes('attribute-un');

        const label  = node.children.find(c => c instanceof GLabel) as GLabel | undefined;
        const labelX = label?.bounds?.x ?? 8;
        const labelW = label?.bounds?.width ?? 0;
        const y      = (height / 2) + 6;

        let underline: VNode | null = null;

        if (isPK && labelW > 0) {
            underline = (
                <line
                    x1={labelX}          y1={y}
                    x2={labelX + labelW} y2={y}
                    stroke="#283593"
                    stroke-width="1.5"
                />
            );
        } else if (isUN && labelW > 0) {
            underline = (
                <line
                    x1={labelX}          y1={y}
                    x2={labelX + labelW} y2={y}
                    stroke="#283593"
                    stroke-width="1.2"
                    stroke-dasharray="4,3"
                />
            );
        }

        return (
            <g>
                <rect x={0} y={0} width={width} height={height}
                    fill="transparent" stroke="none" />
                {context.renderChildren(node)}
                {underline}
            </g>
        );
    }
}