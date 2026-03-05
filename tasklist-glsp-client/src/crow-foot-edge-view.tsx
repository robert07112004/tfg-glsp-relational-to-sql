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

const BAR_HALF = 7;
const CROW_LEN = 12;
const CIRCLE_R = 5;
const GAP      = 4;

function renderBar(tip: Point, angle: number): VNode {
    const [p1, p2] = perp(tip, angle, BAR_HALF);
    return <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} class-crow-mark={true} />;
}

function renderCircle(tip: Point, angle: number): VNode {
    const center = offset(tip, angle, CIRCLE_R + GAP);
    return <circle cx={center.x} cy={center.y} r={CIRCLE_R} class-crow-mark={true} class-crow-optional={true} />;
}

function renderCrowFoot(tip: Point, angle: number): VNode {
    const base     = offset(tip, angle, CROW_LEN);
    const [p1, p2] = perp(base, angle, BAR_HALF);
    return (
        <g>
            <line x1={tip.x} y1={tip.y} x2={p1.x} y2={p1.y} class-crow-mark={true} />
            <line x1={tip.x} y1={tip.y} x2={p2.x} y2={p2.y} class-crow-mark={true} />
            <line x1={tip.x} y1={tip.y} x2={base.x} y2={base.y} class-crow-mark={true} />
        </g>
    );
}

type EndMarker = 'one' | 'many' | 'zero-or-one' | 'one-or-many' | 'zero-or-many';

function renderEndMarker(marker: EndMarker, tip: Point, angle: number): VNode {
    const out = angle + Math.PI;
    switch (marker) {
        case 'one':
            return renderBar(offset(tip, out, GAP), out);
        case 'many':
            return renderCrowFoot(tip, out);
        case 'zero-or-one':
            return (
                <g>
                    {renderBar(offset(tip, out, GAP), out)}
                    {renderCircle(offset(tip, out, GAP * 2 + CIRCLE_R * 2), out)}
                </g>
            );
        case 'one-or-many':
            return (
                <g>
                    {renderCrowFoot(tip, out)}
                    {renderBar(offset(tip, out, CROW_LEN + GAP), out)}
                </g>
            );
        case 'zero-or-many':
            return (
                <g>
                    {renderCrowFoot(tip, out)}
                    {renderCircle(offset(tip, out, CROW_LEN + GAP + CIRCLE_R), out)}
                </g>
            );
    }
}

@injectable()
export abstract class CrowsFootEdgeView extends PolylineEdgeView {
    protected abstract sourceMarker: EndMarker;
    protected abstract targetMarker: EndMarker;

    protected override renderAdditionals(edge: GEdge, segments: Point[], context: RenderingContext): VNode[] {
        if (segments.length < 2) return [];

        const srcTip   = segments[0];
        const srcNext  = segments[1];
        const srcAngle = getAngle(srcTip, srcNext);

        const tgtTip   = segments[segments.length - 1];
        const tgtPrev  = segments[segments.length - 2];
        const tgtAngle = getAngle(tgtTip, tgtPrev);

        return [
            renderEndMarker(this.sourceMarker, srcTip, srcAngle),
            renderEndMarker(this.targetMarker, tgtTip, tgtAngle)
        ];
    }
}

@injectable()
export class OneToOneEdgeView extends CrowsFootEdgeView {
    protected sourceMarker: EndMarker = 'one';
    protected targetMarker: EndMarker = 'one';
}

@injectable()
export class OneToManyEdgeView extends CrowsFootEdgeView {
    protected sourceMarker: EndMarker = 'one';
    protected targetMarker: EndMarker = 'many';
}

@injectable()
export class ZeroOrOneToManyEdgeView extends CrowsFootEdgeView {
    protected sourceMarker: EndMarker = 'zero-or-one';
    protected targetMarker: EndMarker = 'many';
}

@injectable()
export class OneToOneOrManyEdgeView extends CrowsFootEdgeView {
    protected sourceMarker: EndMarker = 'one';
    protected targetMarker: EndMarker = 'one-or-many';
}

@injectable()
export class ZeroOrOneToOneEdgeView extends CrowsFootEdgeView {
    protected sourceMarker: EndMarker = 'zero-or-one';
    protected targetMarker: EndMarker = 'one';
}