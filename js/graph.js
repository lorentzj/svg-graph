export function getRandomGraph() {
    const nodeCount = Math.floor(Math.random() * (10 - 5) + 5);
    const nodeRadii = Array(nodeCount).fill(50);
    const nodes = nodeRadii.map((radius, index) => {
        return { radius: radius, label: `Node ${String.fromCharCode(index + 65)}`, "color": "#ff8888" };
    });
    const maxEdgeCount = Math.floor(Math.random() * (20 - 7) + 7);
    const edges = [];
    for (let i = 0; i < maxEdgeCount; ++i) {
        const startNode = nodes[Math.floor(Math.random() * nodes.length)];
        const endNode = nodes[Math.floor(Math.random() * nodes.length)];
        if (startNode !== endNode && !edges.some(e => e.from == startNode && e.to == endNode)) {
            edges.push({ from: startNode, to: endNode });
        }
    }
    return { nodes: nodes, edges: edges };
}
