# svg-graph
A physics-based directed graph visualization with [SVG](https://developer.mozilla.org/en-US/docs/Web/SVG).

There is a repulsive force between all nodes, inversely proportional to the square of their distance, and an restorative force along edges, proportional to the difference between their distance and the resting edge length.

The model is approximately the same as [Newtonian gravity](https://en.wikipedia.org/wiki/Newton%27s_law_of_universal_gravitation) between nodes and edges acting as springs according to [Hooke's law](https://en.wikipedia.org/wiki/Hooke%27s_law).

Live Demo: https://lorentzj.github.io/svg-graph/