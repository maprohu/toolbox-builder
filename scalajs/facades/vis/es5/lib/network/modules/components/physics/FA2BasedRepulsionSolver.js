"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _BarnesHutSolver2 = require("./BarnesHutSolver");

var _BarnesHutSolver3 = _interopRequireDefault(_BarnesHutSolver2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ForceAtlas2BasedRepulsionSolver = function (_BarnesHutSolver) {
  _inherits(ForceAtlas2BasedRepulsionSolver, _BarnesHutSolver);

  function ForceAtlas2BasedRepulsionSolver(body, physicsBody, options) {
    _classCallCheck(this, ForceAtlas2BasedRepulsionSolver);

    return _possibleConstructorReturn(this, (ForceAtlas2BasedRepulsionSolver.__proto__ || Object.getPrototypeOf(ForceAtlas2BasedRepulsionSolver)).call(this, body, physicsBody, options));
  }

  /**
   * Calculate the forces based on the distance.
   *
   * @param distance
   * @param dx
   * @param dy
   * @param node
   * @param parentBranch
   * @private
   */


  _createClass(ForceAtlas2BasedRepulsionSolver, [{
    key: "_calculateForces",
    value: function _calculateForces(distance, dx, dy, node, parentBranch) {
      if (distance === 0) {
        distance = 0.1 * Math.random();
        dx = distance;
      }

      if (this.overlapAvoidanceFactor < 1) {
        distance = Math.max(0.1 + this.overlapAvoidanceFactor * node.shape.radius, distance - node.shape.radius);
      }

      var degree = node.edges.length + 1;
      // the dividing by the distance cubed instead of squared allows us to get the fx and fy components without sines and cosines
      // it is shorthand for gravityforce with distance squared and fx = dx/distance * gravityForce
      var gravityForce = this.options.gravitationalConstant * parentBranch.mass * node.options.mass * degree / Math.pow(distance, 2);
      var fx = dx * gravityForce;
      var fy = dy * gravityForce;

      this.physicsBody.forces[node.id].x += fx;
      this.physicsBody.forces[node.id].y += fy;
    }
  }]);

  return ForceAtlas2BasedRepulsionSolver;
}(_BarnesHutSolver3.default);

exports.default = ForceAtlas2BasedRepulsionSolver;