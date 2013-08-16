// javascript-astar
// http://github.com/bgrins/javascript-astar
// Freely distributable under the MIT License.
// Implements the astar search algorithm in javascript using a binary heap.

var require = require || function require() {/*NOOP*/};
var BinaryHeap = require('./graph').BinaryHeap;

var astar = {
    heap: function() {
        return new BinaryHeap(function(node) {
            return node.f;
        });
    },
    search: function(start, end, diagonal, heuristic) {
        heuristic = heuristic || astar.manhattan;
        diagonal = !!diagonal;

        var openHeap = astar.heap();

        openHeap.push(start);

        while(openHeap.size() > 0) {

            // Grab the lowest f(x) to process next.  Heap keeps this sorted for us.
            var currentNode = openHeap.pop();

            // End case -- result has been found, return the traced path.
            if(currentNode === end) {
                var curr = currentNode;
                var ret = [];
                while(curr.parent) {
                    ret.push(curr);
                    curr = curr.parent;
                }
                return ret.reverse();
            }

            // Normal case -- move currentNode from open to closed, process each of its neighbors.
            currentNode.closed = true;

            // Find all neighbors for the current node. Optionally find diagonal neighbors as well (false by default).
            var neighbors = currentNode.getNeighbors();

            for(var i=0, il = neighbors.length; i < il; i++) {
                var neighbor = neighbors[i];

                if(neighbor.closed || neighbor.isWall()) {
                    // Not a valid node to process, skip to next neighbor.
                    continue;
                }

                // The g score is the shortest distance from start to current node.
                // We need to check if the path we have arrived at this neighbor is the shortest one we have seen yet.
                var gScore = currentNode.g + neighbor.cost;
                var beenVisited = neighbor.visited;

                if(!beenVisited || gScore < neighbor.g) {

                    // Found an optimal (so far) path to this node.  Take score for node to see how good it is.
                    neighbor.visited = true;
                    neighbor.parent = currentNode;
                    neighbor.h = neighbor.h || heuristic(neighbor.dist);
                    neighbor.g = gScore;
                    neighbor.f = neighbor.g + neighbor.h;

                    if (!beenVisited) {
                        // Pushing to heap will put it in proper place based on the 'f' value.
                        openHeap.push(neighbor);
                    }
                    else {
                        // Already seen the node, but since it has been rescored we need to reorder it in the heap
                        openHeap.rescoreElement(neighbor);
                    }
                }
            }
        }

        // No result was found - empty array signifies failure to find path.
        return [];
    },
    manhattan: function(dist) {
        // See list of heuristics: http://theory.stanford.edu/~amitp/GameProgramming/Heuristics.html

        return dist;
    }
};

// Export the algorithm to be used as a node module
var module = module || {};
module.exports = astar;
