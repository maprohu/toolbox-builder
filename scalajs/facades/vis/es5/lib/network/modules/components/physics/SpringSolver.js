"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SpringSolver = function () {
  function SpringSolver(body, physicsBody, options) {
    _classCallCheck(this, SpringSolver);

    this.body = body;
    this.physicsBody = physicsBody;
    this.setOptions(options);
  }

  _createClass(SpringSolver, [{
    key: "setOptions",
    value: function setOptions(options) {
      this.options = options;
    }

    /**
     * This function calculates the springforces on the nodes, accounting for the support nodes.
     *
     * @private
     */

  }, {
    key: "solve",
    value: function solve() {
      var edgeLength = void 0,
          edge = void 0;
      var edgeIndices = this.physicsBody.physicsEdgeIndices;
      var edges = this.body.edges;
      var node1 = void 0,
          node2 = void 0,
          node3 = void 0;

      // forces caused by the edges, modelled as springs
      for (var i = 0; i < edgeIndices.length; i++) {
        edge = edges[edgeIndices[i]];
        if (edge.connected === true && edge.toId !== edge.fromId) {
          // only calculate forces if nodes are in the same sector
          if (this.body.nodes[edge.toId] !== undefined && this.body.nodes[edge.fromId] !== undefined) {
            if (edge.edgeType.via !== undefined) {
              edgeLength = edge.options.length === undefined ? this.options.springLength : edge.options.length;
              node1 = edge.to;
              node2 = edge.edgeType.via;
              node3 = edge.from;

              this._calculateSpringForce(node1, node2, 0.5 * edgeLength);
              this._calculateSpringForce(node2, node3, 0.5 * edgeLength);
            } else {
              // the * 1.5 is here so the edge looks as large as a smooth edge. It does not initially because the smooth edges use
              // the support nodes which exert a repulsive force on the to and from nodes, making the edge appear larger.
              edgeLength = edge.options.length === undefined ? this.options.springLength * 1.5 : edge.options.length;
              this._calculateSpringForce(edge.from, edge.to, edgeLength);
            }
          }
        }
      }
    }

    /**
     * This is the code actually performing the calculation for the function above.
     *
     * @param node1
     * @param node2
     * @param edgeLength
     * @private
     */

  }, {
    key: "_calculateSpringForce",
    value: function _calculateSpringForce(node1, node2, edgeLength) {
      var dx = node1.x - node2.x;
      var dy = node1.y - node2.y;
      var distance = Math.max(Math.sqrt(dx * dx + dy * dy), 0.01);

      // the 1/distance is so the fx and fy can be calculated without sine or cosine.
      var springForce = this.options.springConstant * (edgeLength - distance) / distance;

      var fx = dx * springForce;
      var fy = dy * springForce;

      // handle the case where one node is not part of the physcis
      if (this.physicsBody.forces[node1.id] !== undefined) {
        this.physicsBody.forces[node1.id].x += fx;
        this.physicsBody.forces[node1.id].y += fy;
      }

      if (this.physicsBody.forces[node2.id] !== undefined) {
        this.physicsBody.forces[node2.id].x -= fx;
        this.physicsBody.forces[node2.id].y -= fy;
      }
    }
  }]);

  return SpringSolver;
}();

exports.default = SpringSolver;