export function getRandomGraph() {
    const nodeRadii = Array(10).fill(50);
    const nodes = nodeRadii.map((radius, index) => {
        return { radius: radius, label: `Node ${String.fromCharCode(index + 65)}`, "color": "#ff8888" };
    });
    return { nodes: nodes, edges: [{ from: nodes[0], to: nodes[1] }] };
}
