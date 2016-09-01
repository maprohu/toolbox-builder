'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _EdgeBase2 = require('./EdgeBase');

var _EdgeBase3 = _interopRequireDefault(_EdgeBase2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var BezierEdgeBase = function (_EdgeBase) {
  _inherits(BezierEdgeBase, _EdgeBase);

  function BezierEdgeBase(options, body, labelModule) {
    _classCallCheck(this, BezierEdgeBase);

    return _possibleConstructorReturn(this, (BezierEdgeBase.__proto__ || Object.getPrototypeOf(BezierEdgeBase)).call(this, options, body, labelModule));
  }

  /**
   * This function uses binary search to look for the point where the bezier curve crosses the border of the node.
   *
   * @param nearNode
   * @param ctx
   * @param viaNode
   * @param nearNode
   * @param ctx
   * @param viaNode
   * @param nearNode
   * @param ctx
   * @param viaNode
   */


  _createClass(BezierEdgeBase, [{
    key: '_findBorderPositionBezier',
    value: function _findBorderPositionBezier(nearNode, ctx) {
      var viaNode = arguments.length <= 2 || arguments[2] === undefined ? this._getViaCoordinates() : arguments[2];

      var maxIterations = 10;
      var iteration = 0;
      var low = 0;
      var high = 1;
      var pos, angle, distanceToBorder, distanceToPoint, difference;
      var threshold = 0.2;
      var node = this.to;
      var from = false;
      if (nearNode.id === this.from.id) {
        node = this.from;
        from = true;
      }

      while (low <= high && iteration < maxIterations) {
        var middle = (low + high) * 0.5;

        pos = this.getPoint(middle, viaNode);
        angle = Math.atan2(node.y - pos.y, node.x - pos.x);
        distanceToBorder = node.distanceToBorder(ctx, angle);
        distanceToPoint = Math.sqrt(Math.pow(pos.x - node.x, 2) + Math.pow(pos.y - node.y, 2));
        difference = distanceToBorder - distanceToPoint;
        if (Math.abs(difference) < threshold) {
          break; // found
        } else if (difference < 0) {
          // distance to nodes is larger than distance to border --> t needs to be bigger if we're looking at the to node.
          if (from === false) {
            low = middle;
          } else {
            high = middle;
          }
        } else {
          if (from === false) {
            high = middle;
          } else {
            low = middle;
          }
        }

        iteration++;
      }
      pos.t = middle;

      return pos;
    }

    /**
     * Calculate the distance between a point (x3,y3) and a line segment from
     * (x1,y1) to (x2,y2).
     * http://stackoverflow.com/questions/849211/shortest-distancae-between-a-point-and-a-line-segment
     * @param {number} x1 from x
     * @param {number} y1 from y
     * @param {number} x2 to x
     * @param {number} y2 to y
     * @param {number} x3 point to check x
     * @param {number} y3 point to check y
     * @private
     */

  }, {
    key: '_getDistanceToBezierEdge',
    value: function _getDistanceToBezierEdge(x1, y1, x2, y2, x3, y3, via) {
      // x3,y3 is the point
      var minDistance = 1e9;
      var distance = void 0;
      var i = void 0,
          t = void 0,
          x = void 0,
          y = void 0;
      var lastX = x1;
      var lastY = y1;
      for (i = 1; i < 10; i++) {
        t = 0.1 * i;
        x = Math.pow(1 - t, 2) * x1 + 2 * t * (1 - t) * via.x + Math.pow(t, 2) * x2;
        y = Math.pow(1 - t, 2) * y1 + 2 * t * (1 - t) * via.y + Math.pow(t, 2) * y2;
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

  return BezierEdgeBase;
}(_EdgeBase3.default);

exports.default = BezierEdgeBase;