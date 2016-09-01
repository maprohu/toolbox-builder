'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _EdgeBase2 = require('./util/EdgeBase');

var _EdgeBase3 = _interopRequireDefault(_EdgeBase2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var StraightEdge = function (_EdgeBase) {
  _inherits(StraightEdge, _EdgeBase);

  function StraightEdge(options, body, labelModule) {
    _classCallCheck(this, StraightEdge);

    return _possibleConstructorReturn(this, (StraightEdge.__proto__ || Object.getPrototypeOf(StraightEdge)).call(this, options, body, labelModule));
  }

  /**
   * Draw a line between two nodes
   * @param {CanvasRenderingContext2D} ctx
   * @private
   */


  _createClass(StraightEdge, [{
    key: '_line',
    value: function _line(ctx) {
      // draw a straight line
      ctx.beginPath();
      ctx.moveTo(this.fromPoint.x, this.fromPoint.y);
      ctx.lineTo(this.toPoint.x, this.toPoint.y);
      // draw shadow if enabled
      this.enableShadow(ctx);
      ctx.stroke();
      this.disableShadow(ctx);
    }
  }, {
    key: 'getViaNode',
    value: function getViaNode() {
      return undefined;
    }

    /**
     * Combined function of pointOnLine and pointOnBezier. This gives the coordinates of a point on the line at a certain percentage of the way
     * @param percentage
     * @param via
     * @returns {{x: number, y: number}}
     * @private
     */

  }, {
    key: 'getPoint',
    value: function getPoint(percentage) {
      return {
        x: (1 - percentage) * this.fromPoint.x + percentage * this.toPoint.x,
        y: (1 - percentage) * this.fromPoint.y + percentage * this.toPoint.y
      };
    }
  }, {
    key: '_findBorderPosition',
    value: function _findBorderPosition(nearNode, ctx) {
      var node1 = this.to;
      var node2 = this.from;
      if (nearNode.id === this.from.id) {
        node1 = this.from;
        node2 = this.to;
      }

      var angle = Math.atan2(node1.y - node2.y, node1.x - node2.x);
      var dx = node1.x - node2.x;
      var dy = node1.y - node2.y;
      var edgeSegmentLength = Math.sqrt(dx * dx + dy * dy);
      var toBorderDist = nearNode.distanceToBorder(ctx, angle);
      var toBorderPoint = (edgeSegmentLength - toBorderDist) / edgeSegmentLength;

      var borderPos = {};
      borderPos.x = (1 - toBorderPoint) * node2.x + toBorderPoint * node1.x;
      borderPos.y = (1 - toBorderPoint) * node2.y + toBorderPoint * node1.y;

      return borderPos;
    }
  }, {
    key: '_getDistanceToEdge',
    value: function _getDistanceToEdge(x1, y1, x2, y2, x3, y3) {
      // x3,y3 is the point
      return this._getDistanceToLine(x1, y1, x2, y2, x3, y3);
    }
  }]);

  return StraightEdge;
}(_EdgeBase3.default);

exports.default = StraightEdge;