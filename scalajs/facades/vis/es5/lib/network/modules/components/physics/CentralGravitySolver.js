"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var CentralGravitySolver = function () {
  function CentralGravitySolver(body, physicsBody, options) {
    _classCallCheck(this, CentralGravitySolver);

    this.body = body;
    this.physicsBody = physicsBody;
    this.setOptions(options);
  }

  _createClass(CentralGravitySolver, [{
    key: "setOptions",
    value: function setOptions(options) {
      this.options = options;
    }
  }, {
    key: "solve",
    value: function solve() {
      var dx = void 0,
          dy = void 0,
          distance = void 0,
          node = void 0;
      var nodes = this.body.nodes;
      var nodeIndices = this.physicsBody.physicsNodeIndices;
      var forces = this.physicsBody.forces;

      for (var i = 0; i < nodeIndices.length; i++) {
        var nodeId = nodeIndices[i];
        node = nodes[nodeId];
        dx = -node.x;
        dy = -node.y;
        distance = Math.sqrt(dx * dx + dy * dy);

        this._calculateForces(distance, dx, dy, forces, node);
      }
    }

    /**
     * Calculate the forces based on the distance.
     * @private
     */

  }, {
    key: "_calculateForces",
    value: function _calculateForces(distance, dx, dy, forces, node) {
      var gravityForce = distance === 0 ? 0 : this.options.centralGravity / distance;
      forces[node.id].x = dx * gravityForce;
      forces[node.id].y = dy * gravityForce;
    }
  }]);

  return CentralGravitySolver;
}();

exports.default = CentralGravitySolver;