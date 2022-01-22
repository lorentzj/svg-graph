export class PhysicsNode {
    constructor(radius) {
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
    update(dt, bounds) {
        if (this.dragging) {
            return;
        }
        const bounceDampen = 0.4;
        if (this.x + this.vx * dt > bounds.width - this.radius) {
            this.x = bounds.width - this.radius;
            this.vx = -this.vx * (1 - bounceDampen);
        }
        else if (this.x + this.vx * dt < this.radius) {
            this.x = this.radius;
            this.vx = -this.vx * (1 - bounceDampen);
        }
        else {
            this.x += this.vx * dt;
        }
        if (this.y + this.vy * dt > bounds.height - this.radius) {
            this.y = bounds.height - this.radius;
            this.vy = -this.vy * (1 - bounceDampen);
        }
        else if (this.y + this.vy * dt < this.radius) {
            this.y = this.radius;
            this.vy = -this.vy * (1 - bounceDampen);
        }
        else {
            this.y += this.vy * dt;
        }
        this.move(this.x, this.y);
    }
    beginDrag(mouseX, mouseY) {
        if (!this.dragging) {
            this.dragging = true;
            this.dragOffsetX = mouseX - this.x;
            this.dragOffsetY = mouseY - this.y;
        }
    }
    drag(mouseX, mouseY) {
        if (this.dragging) {
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
export class PhysicsEdge {
}
export class PhysicsSimulation {
    constructor(nodes, params, target) {
        this.target = target;
        this.nodes = nodes;
        this.params = params;
    }
    tickPhysics(dt, bounds) {
        const nodeRepelFConstant = 200000;
        const nodeAttractFConstant = 0.05;
        const edgeLength = this.params.edgeLength;
        const minAttractDistance = 5;
        const dampen = 0.02;
        this.nodes.forEach(node => {
            let fx = 0;
            let fy = 0;
            this.nodes.forEach(other => {
                if (other !== node) {
                    const dx = node.x - other.x;
                    const dy = node.y - other.y;
                    const d = Math.sqrt(dx * dx + dy * dy);
                    const ndx = dx / d;
                    const ndy = dy / d;
                    // each node is repelled from all others
                    const repelF = other.mass * nodeRepelFConstant / Math.abs((Math.pow(d, 2)));
                    fx += repelF * ndx;
                    fy += repelF * ndy;
                    const sharedEdgeExists = [...node.outEdges].find(edge => edge.to == other) !== undefined
                        || [...node.inEdges].find(edge => edge.from == other) !== undefined;
                    if (sharedEdgeExists) {
                        //...and attracted to those it shares an edge with
                        if (Math.abs(d - edgeLength) > minAttractDistance) {
                            const attractF = other.mass * nodeAttractFConstant * Math.abs(d - edgeLength)
                                * (d > edgeLength ? -1 : 1);
                            fx += attractF * ndx;
                            fy += attractF * ndy;
                        }
                    }
                }
            });
            node.vx += (node.ax + fx / node.mass) / 2 * dt;
            node.vy += (node.ay + fy / node.mass) / 2 * dt;
            node.ax = fx / node.mass;
            node.ay = fy / node.mass;
            node.vx *= 1 - dampen;
            node.vy *= 1 - dampen;
            node.update(dt, bounds);
        });
    }
    setEdgeLength(newEdgeLength) {
        this.params.edgeLength = newEdgeLength;
    }
}
