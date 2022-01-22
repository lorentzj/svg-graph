import {getRandomGraph} from "./graph.js"
import {SVGRenderedGraph} from "./svg_render.js";

document.body.onload = () => {
    const graphRoot = document.getElementById("graph");
    const edgeLength = document.getElementById("edge_length");
    const edgeLengthInput = document.getElementById("edge_length_input");
    if(graphRoot !== null) {
        const simParams = {
            edgeLength: 200
        };

        const graph = new SVGRenderedGraph(getRandomGraph(), graphRoot as HTMLElement & SVGSVGElement, simParams);
        setInterval(graph.simulation.tickPhysics.bind(graph.simulation), 1/20, 1/20, graphRoot.getBoundingClientRect());

        if(edgeLength !== null && edgeLengthInput !== null) {
            (edgeLengthInput as HTMLInputElement).value = "200";
            edgeLength.textContent = "200px";

            edgeLengthInput.addEventListener("input", _e => {
                edgeLength.textContent = (edgeLengthInput as HTMLInputElement).value + "px";
                graph.simulation.setEdgeLength(parseInt((edgeLengthInput as HTMLInputElement).value));
            });
        }
    }
}