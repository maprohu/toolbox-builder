"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var HierarchicalSpringSolver = function () {
  function HierarchicalSpringSolver(body, physicsBody, options) {
    _classCallCheck(this, HierarchicalSpringSolver);

    this.body = body;
    this.physicsBody = physicsBody;
    this.setOptions(options);
  }

  _createClass(HierarchicalSpringSolver, [{
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
      var edgeLength, edge;
      var dx, dy, fx, fy, springForce, distance;
      var edges = this.body.edges;
      var factor = 0.5;

      var edgeIndices = this.physicsBody.physicsEdgeIndices;
      var nodeIndices = this.physicsBody.physicsNodeIndices;
      var forces = this.physicsBody.forces;

      // initialize the spring force counters
      for (var i = 0; i < nodeIndices.length; i++) {
        var nodeId = nodeIndices[i];
        forces[nodeId].springFx = 0;
        forces[nodeId].springFy = 0;
      }

      // forces caused by the edges, modelled as springs
      for (var _i = 0; _i < edgeIndices.length; _i++) {
        edge = edges[edgeIndices[_i]];
        if (edge.connected === true) {
          edgeLength = edge.options.length === undefined ? this.options.springLength : edge.options.length;

          dx = edge.from.x - edge.to.x;
          dy = edge.from.y - edge.to.y;
          distance = Math.sqrt(dx * dx + dy * dy);
          distance = distance === 0 ? 0.01 : distance;

          // the 1/distance is so the fx and fy can be calculated without sine or cosine.
          springForce = this.options.springConstant * (edgeLength - distance) / distance;

          fx = dx * springForce;
          fy = dy * springForce;

          if (edge.to.level != edge.from.level) {
            if (forces[edge.toId] !== undefined) {
              forces[edge.toId].springFx -= fx;
              forces[edge.toId].springFy -= fy;
            }
            if (forces[edge.fromId] !== undefined) {
              forces[edge.fromId].springFx += fx;
              forces[edge.fromId].springFy += fy;
            }
          } else {
            if (forces[edge.toId] !== undefined) {
              forces[edge.toId].x -= factor * fx;
              forces[edge.toId].y -= factor * fy;
            }
            if (forces[edge.fromId] !== undefined) {
              forces[edge.fromId].x += factor * fx;
              forces[edge.fromId].y += factor * fy;
            }
          }
        }
      }

      // normalize spring forces
      var springForce = 1;
      var springFx, springFy;
      for (var _i2 = 0; _i2 < nodeIndices.length; _i2++) {
        var _nodeId = nodeIndices[_i2];
        springFx = Math.min(springForce, Math.max(-springForce, forces[_nodeId].springFx));
        springFy = Math.min(springForce, Math.max(-springForce, forces[_nodeId].springFy));

        forces[_nodeId].x += springFx;
        forces[_nodeId].y += springFy;
      }

      // retain energy balance
      var totalFx = 0;
      var totalFy = 0;
      for (var _i3 = 0; _i3 < nodeIndices.length; _i3++) {
        var _nodeId2 = nodeIndices[_i3];
        totalFx += forces[_nodeId2].x;
        totalFy += forces[_nodeId2].y;
      }
      var correctionFx = totalFx / nodeIndices.length;
      var correctionFy = totalFy / nodeIndices.length;

      for (var _i4 = 0; _i4 < nodeIndices.length; _i4++) {
        var _nodeId3 = nodeIndices[_i4];
        forces[_nodeId3].x -= correctionFx;
        forces[_nodeId3].y -= correctionFy;
      }
    }
  }]);

  return HierarchicalSpringSolver;
}();

exports.default = HierarchicalSpringSolver;