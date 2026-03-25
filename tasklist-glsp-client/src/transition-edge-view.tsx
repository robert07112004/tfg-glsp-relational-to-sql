import { GEdge, PolylineEdgeView, RenderingContext, svg } from '@eclipse-glsp/client';
import { injectable } from 'inversify';
import { VNode } from 'snabbdom';

interface Point { x: number; y: number; }

function getAngle(a: Point, b: Point): number {
    return Math.atan2(b.y - a.y, b.x - a.x);
}

function offset(p: Point, angle: number, dist: number): Point {
    return { x: p.x + Math.cos(angle) * dist, y: p.y + Math.sin(angle) * dist };
}

function perp(p: Point, angle: number, dist: number): [Point, Point] {
    return [
        { x: p.x + Math.cos(angle + Math.PI / 2) * dist, y: p.y + Math.sin(angle + Math.PI / 2) * dist },
        { x: p.x + Math.cos(angle - Math.PI / 2) * dist, y: p.y + Math.sin(angle - Math.PI / 2) * dist }
    ];
}

function renderArrowHead(tip: Point, angle: number): VNode {
    const ARROW_LENGTH = 12; 
    const ARROW_WIDTH = 5;   

    const backAngle = angle + Math.PI; 
    const backPoint = offset(tip, backAngle, ARROW_LENGTH);
    const [p1, p2] = perp(backPoint, angle, ARROW_WIDTH);

    return (
        <polygon 
            points={`${tip.x},${tip.y} ${p1.x},${p1.y} ${p2.x},${p2.y}`} 
            class-transition-arrow={true} 
            fill="#000000"
        />
    );
}

@injectable()
export class TransitionEdgeView extends PolylineEdgeView {
    
    protected override renderAdditionals(edge: GEdge, segments: Point[], context: RenderingContext): VNode[] {
        if (segments.length < 2) return [];

        const tgtTip  = segments[segments.length - 1];
        const tgtPrev = segments[segments.length - 2];
        const tgtAngle = getAngle(tgtPrev, tgtTip);

        return [
            renderArrowHead(tgtTip, tgtAngle)
        ];
    }
}