'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _BezierEdgeBase2 = require('./BezierEdgeBase');

var _BezierEdgeBase3 = _interopRequireDefault(_BezierEdgeBase2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var CubicBezierEdgeBase = function (_BezierEdgeBase) {
  _inherits(CubicBezierEdgeBase, _BezierEdgeBase);

  function CubicBezierEdgeBase(options, body, labelModule) {
    _classCallCheck(this, CubicBezierEdgeBase);

    return _possibleConstructorReturn(this, (CubicBezierEdgeBase.__proto__ || Object.getPrototypeOf(CubicBezierEdgeBase)).call(this, options, body, labelModule));
  }

  /**
   * Calculate the distance between a point (x3,y3) and a line segment from
   * (x1,y1) to (x2,y2).
   * http://stackoverflow.com/questions/849211/shortest-distancae-between-a-point-and-a-line-segment
   * https://en.wikipedia.org/wiki/B%C3%A9zier_curve
   * @param {number} x1 from x
   * @param {number} y1 from y
   * @param {number} x2 to x
   * @param {number} y2 to y
   * @param {number} x3 point to check x
   * @param {number} y3 point to check y
   * @private
   */


  _createClass(CubicBezierEdgeBase, [{
    key: '_getDistanceToBezierEdge',
    value: function _getDistanceToBezierEdge(x1, y1, x2, y2, x3, y3, via1, via2) {
      // x3,y3 is the point
      var minDistance = 1e9;
      var distance = void 0;
      var i = void 0,
          t = void 0,
          x = void 0,
          y = void 0;
      var lastX = x1;
      var lastY = y1;
      var vec = [0, 0, 0, 0];
      for (i = 1; i < 10; i++) {
        t = 0.1 * i;
        vec[0] = Math.pow(1 - t, 3);
        vec[1] = 3 * t * Math.pow(1 - t, 2);
        vec[2] = 3 * Math.pow(t, 2) * (1 - t);
        vec[3] = Math.pow(t, 3);
        x = vec[0] * x1 + vec[1] * via1.x + vec[2] * via2.x + vec[3] * x2;
        y = vec[0] * y1 + vec[1] * via1.y + vec[2] * via2.y + vec[3] * y2;
        if (i > 0) {
          distance = this._getDistanceToLine(lastX, lastY, x, y, x3, y3);
          minDistance = distance < minDistance ? distance : minDistance;
        }
        lastX = x;
        lastY = y;
      }

      return minDistance;
    }
  }]);

  return CubicBezierEdgeBase;
}(_BezierEdgeBase3.default);

exports.default = CubicBezierEdgeBase;