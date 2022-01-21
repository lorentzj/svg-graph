import {getRandomGraph} from "./graph.js"
import {SVGRenderedGraph} from "./svg_render.js";

document.body.onload = () => {
    const graphRoot = document.getElementById("graph");
    if(graphRoot !== null) {
        const graph = new SVGRenderedGraph(getRandomGraph(), graphRoot as HTMLElement & SVGSVGElement);
        setInterval(graph.simulation.tickPhysics.bind(graph.simulation), 1/20, 1/20, graphRoot.getBoundingClientRect());
    }
}