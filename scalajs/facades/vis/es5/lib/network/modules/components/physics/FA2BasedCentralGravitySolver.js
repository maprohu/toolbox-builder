"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _CentralGravitySolver2 = require("./CentralGravitySolver");

var _CentralGravitySolver3 = _interopRequireDefault(_CentralGravitySolver2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ForceAtlas2BasedCentralGravitySolver = function (_CentralGravitySolver) {
  _inherits(ForceAtlas2BasedCentralGravitySolver, _CentralGravitySolver);

  function ForceAtlas2BasedCentralGravitySolver(body, physicsBody, options) {
    _classCallCheck(this, ForceAtlas2BasedCentralGravitySolver);

    return _possibleConstructorReturn(this, (ForceAtlas2BasedCentralGravitySolver.__proto__ || Object.getPrototypeOf(ForceAtlas2BasedCentralGravitySolver)).call(this, body, physicsBody, options));
  }

  /**
   * Calculate the forces based on the distance.
   * @private
   */


  _createClass(ForceAtlas2BasedCentralGravitySolver, [{
    key: "_calculateForces",
    value: function _calculateForces(distance, dx, dy, forces, node) {
      if (distance > 0) {
        var degree = node.edges.length + 1;
        var gravityForce = this.options.centralGravity * degree * node.options.mass;
        forces[node.id].x = dx * gravityForce;
        forces[node.id].y = dy * gravityForce;
      }
    }
  }]);

  return ForceAtlas2BasedCentralGravitySolver;
}(_CentralGravitySolver3.default);

exports.default = ForceAtlas2BasedCentralGravitySolver;