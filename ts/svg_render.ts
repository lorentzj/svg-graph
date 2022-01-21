import {Node, Graph} from "./graph.js";
import {PhysicsNode, PhysicsEdge, PhysicsSimulation} from "./simulation.js";

class RenderedNode extends PhysicsNode {
    x: number;
    y: number;

    baseData: Node;

    outEdges: Set<RenderedEdge>;
    inEdges: Set<RenderedEdge>;

    element: SVGGElement;

    constructor(x: number, y: number, baseData: Node, parent: SVGElement) {
        super(baseData.radius);

        this.x = x;
        this.y = y;

        this.baseData = baseData;

        this.outEdges = new Set<RenderedEdge>();
        this.inEdges = new Set<RenderedEdge>();

        this.element = document.createElementNS("http://www.w3.org/2000/svg", "g");

        const circleElement = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circleElement.setAttribute("cx", x.toString());
        circleElement.setAttribute("cy", y.toString());
        circleElement.setAttribute("r", (baseData.radius).toString());
        circleElement.setAttribute("fill", baseData.color);

        const labelElement = document.createElementNS("http://www.w3.org/2000/svg", "text");
        labelElement.setAttribute("x", x.toString());
        labelElement.setAttribute("y", y.toString());
        labelElement.setAttribute("text-anchor", "middle");
        labelElement.setAttribute("dominant-baseline", "middle");

        labelElement.textContent = baseData.label;

        this.element.appendChild(circleElement);
        this.element.appendChild(labelElement);
        parent.appendChild(this.element);

        this.element.addEventListener("mousedown", e => {
            const CTM = this.element.ownerSVGElement?.getScreenCTM();

            if(CTM !== undefined && CTM !== null) {
                this.beginDrag(
                    (e.clientX - CTM.e) / CTM.a,
                    (e.clientY - CTM.f) / CTM.d
                );
            }
        });
    }

    move(newX: number, newY: number) {
        this.x = newX;
        this.y = newY;
        (this.element.children[0] as SVGCircleElement).setAttribute("cx", newX.toString());
        (this.element.children[0] as SVGCircleElement).setAttribute("cy", newY.toString());
        (this.element.children[1] as SVGTextElement).setAttribute("x", newX.toString());
        (this.element.children[1] as SVGTextElement).setAttribute("y", newY.toString());
        this.outEdges.forEach(edge => edge.calculateEndpoints());
        this.inEdges.forEach(edge => edge.calculateEndpoints());
    }

    delete() {
        this.inEdges.forEach(edge => edge.delete());
        this.outEdges.forEach(edge => edge.delete());
        this.element.parentElement?.removeChild(this.element);
    }
}

class RenderedEdge extends PhysicsEdge {
    from: PhysicsNode;
    to: PhysicsNode;
    element: SVGElement;

    constructor(from: PhysicsNode, to: PhysicsNode, parent: SVGElement) {
        super();
        this.from = from;
        this.to = to;

        this.element = document.createElementNS("http://www.w3.org/2000/svg", "line");
        this.element.setAttribute("stroke", "black");
        this.element.setAttribute("marker-end", "url(#arrowHead)");
        this.calculateEndpoints();
        parent.append(this.element);
    }

    calculateEndpoints() {
        const dx = this.to.x - this.from.x;
        const dy = this.to.y - this.from.y;

        const d = Math.sqrt(dx*dx + dy*dy);

        const ndx = d > 0 ? dx/d : 0;
        const ndy = d > 0 ? dy/d : 0;

        const startX = this.from.x + ndx*this.from.radius;
        const startY = this.from.y + ndy*this.from.radius;
        const endX   = this.to.x   - ndx*this.to.radius;
        const endY   = this.to.y   - ndy*this.to.radius;

        this.element.setAttribute("x1", startX.toString());
        this.element.setAttribute("y1", startY.toString());
        this.element.setAttribute("x2", endX.toString());
        this.element.setAttribute("y2", endY.toString());
    }

    delete() {
        this.element.parentElement?.removeChild(this.element);
    }
}

function defineArrowHeadMarker(size: number): SVGMarkerElement {
    const markerElement = document.createElementNS("http://www.w3.org/2000/svg", "marker");
    markerElement.id = "arrowHead";
    markerElement.setAttribute("markerWidth", (size*2).toString());
    markerElement.setAttribute("markerHeight", (size*2).toString());
    markerElement.setAttribute("refX", (size*2).toString());
    markerElement.setAttribute("refY", (size/2).toString());
    markerElement.setAttribute("orient", "auto");

    const arrowHeadElement = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    arrowHeadElement.setAttribute("points", `0 0, 0 ${size}, ${size*2} ${size/2}`);

    markerElement.appendChild(arrowHeadElement);
    return markerElement;
}

export class SVGRenderedGraph {
    simulation: PhysicsSimulation;
    target: SVGSVGElement;

    constructor(data: Graph, target: SVGSVGElement) {
        this.target = target;
        target.textContent = "";

        const defsElement = document.createElementNS("http://www.w3.org/2000/svg", "defs");
        defsElement.appendChild(defineArrowHeadMarker(10));
        target.appendChild(defsElement);
        
        const renderedNodes = data.nodes.map(node => { 
            return new RenderedNode(
                Math.random() * (target.getBoundingClientRect().width - node.radius*2) + node.radius,
                Math.random() * (target.getBoundingClientRect().height - node.radius*2) + node.radius,
                node,
                target
            );
        });

        data.edges.forEach(edge => {
            const from = renderedNodes.find(node => node.baseData == edge.from);
            const to = renderedNodes.find(node => node.baseData === edge.to);
            if(from && to) {
                const edge = new RenderedEdge(from, to, target);
                from.outEdges.add(edge);
                to.inEdges.add(edge);
            } else {
                console.error(`Missing nodes for edge (${edge.from})-->(${edge.to})`);
            }
        });

        this.simulation = new PhysicsSimulation(
            renderedNodes,
            target
        );

        this.target.addEventListener("mousemove", e => {
            const CTM = this.target.getScreenCTM();
            if(CTM !== undefined && CTM !== null) {
                this.simulation.nodes.filter(node => node.dragging).forEach(node => node.drag(
                    (e.clientX - CTM.e) / CTM.a,
                    (e.clientY - CTM.f) / CTM.d
                ));
            }
        });

        this.target.addEventListener("mouseup", _e => this.simulation.nodes.forEach(node => node.endDrag()));
    }
}