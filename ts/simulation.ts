export abstract class PhysicsNode {
    abstract x: number;
    abstract y: number;

    abstract outEdges: Set<PhysicsEdge>;
    abstract inEdges: Set<PhysicsEdge>;

    abstract move(x: number, y: number): void;
    abstract delete(): void;

    vx: number;
    vy: number;
    ax: number;
    ay: number;
    radius: number;
    mass: number;
    
    dragging: boolean;
    dragOffsetX: number;
    dragOffsetY: number;

    constructor(radius: number) {
        this.radius = radius;
        this.mass = 0.1;
        this.vx = 0;
        this.vy = 0;
        this.ax = 0;
        this.ay = 0;
        this.dragging = false;
        this.dragOffsetX = 0;
        this.dragOffsetY = 0;
    }

    update(dt: number, bounds: DOMRect) {
        if(this.dragging) {
            return;
        }
        const bounceDampen = 0.4;

        if(this.x + this.vx*dt > bounds.width - this.radius) {
            this.x = bounds.width - this.radius;
            this.vx = -this.vx*(1 - bounceDampen);
        } else if(this.x + this.vx*dt < this.radius) {
            this.x = this.radius;
            this.vx = -this.vx*(1 - bounceDampen);
        } else {
            this.x += this.vx*dt;
        }

        if(this.y + this.vy*dt > bounds.height - this.radius) {
            this.y = bounds.height - this.radius;
            this.vy = -this.vy*(1 - bounceDampen);
        } else if(this.y + this.vy*dt < this.radius) {
            this.y = this.radius;
            this.vy = -this.vy*(1 - bounceDampen);
        } else {
            this.y += this.vy*dt;
        }

        this.move(this.x, this.y);
    }

    beginDrag(mouseX: number, mouseY: number) {
        if(!this.dragging) {
            this.dragging = true;

            this.dragOffsetX = mouseX - this.x;
            this.dragOffsetY = mouseY - this.y;
        }
    }

    drag(mouseX: number, mouseY: number) {
        if(this.dragging) {
            this.move(mouseX - this.dragOffsetX, mouseY - this.dragOffsetY);
        }
    }

    endDrag() {
        this.dragging = false;

        this.vx = 0;
        this.vy = 0;
        this.ax = 0;
        this.ay = 0;
    }
}

export abstract class PhysicsEdge {
    abstract from: PhysicsNode;
    abstract to: PhysicsNode;
}

export class PhysicsSimulation {
    nodes: PhysicsNode[];
    target: SVGElement;

    constructor(nodes: PhysicsNode[], target: SVGElement) {
        this.target = target;

        this.nodes = nodes;
    }

    tickPhysics(dt: number, bounds: DOMRect) {
        const nodeRepelFConstant = 20000;
        const repelExp = 2;

        const nodeAttractFConstant = 2000;
        const edgeDistance = 200;
        const minAttractDistance = 5;
        const attractExp = 1;
        const closeDampen = 0.1;

        const dampen  = 0.01;

        this.nodes.forEach(node => {
            let fx = 0;
            let fy = 0;
            this.nodes.forEach(other => {
                if(other !== node) {
                    const dx = node.x - other.x;
                    const dy = node.y - other.y;
                    const d = Math.sqrt(dx*dx + dy*dy);
                    const ndx = dx/d;
                    const ndy = dy/d;
    
                    // each node is repelled from all others
                    const repelF = other.mass*nodeRepelFConstant/Math.abs((Math.pow(d, repelExp)));
                    fx += repelF*ndx;
                    fy += repelF*ndy;    
    
                    const sharedEdgeExists = [...node.outEdges].find(
                        edge => edge.to == other
                    ) !== undefined
                    || [...node.inEdges].find(
                        edge => edge.from == other
                    ) !== undefined;
    
                    if(sharedEdgeExists) {
                        //...and attracted to those it shares an edge with

                        if(Math.abs(d - edgeDistance) > minAttractDistance) {
                            const attractF = other.mass*nodeAttractFConstant/Math.abs(Math.pow(d, attractExp))
                                * (d > edgeDistance ? -1 : 1);
    
                            fx += attractF*ndx;
                            fy += attractF*ndy;
                        } else {
                            // if we're close to the correct edge length, dampen more to reduce vibration
                            node.vx *= (1 - closeDampen);
                            node.vy *= (1 - closeDampen);
                        }
                    }
                }
            });

            node.vx += (node.ax + fx/node.mass)/2*dt;
            node.vy += (node.ay + fy/node.mass)/2*dt;
            node.ax = fx/node.mass;
            node.ay = fy/node.mass;
            node.vx *= 1 - dampen;
            node.vy *= 1 - dampen;
            node.update(dt, bounds);
        });
    }
}