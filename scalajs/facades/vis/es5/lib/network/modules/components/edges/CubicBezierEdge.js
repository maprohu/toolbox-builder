'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _CubicBezierEdgeBase2 = require('./util/CubicBezierEdgeBase');

var _CubicBezierEdgeBase3 = _interopRequireDefault(_CubicBezierEdgeBase2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var CubicBezierEdge = function (_CubicBezierEdgeBase) {
  _inherits(CubicBezierEdge, _CubicBezierEdgeBase);

  function CubicBezierEdge(options, body, labelModule) {
    _classCallCheck(this, CubicBezierEdge);

    return _possibleConstructorReturn(this, (CubicBezierEdge.__proto__ || Object.getPrototypeOf(CubicBezierEdge)).call(this, options, body, labelModule));
  }

  /**
   * Draw a line between two nodes
   * @param {CanvasRenderingContext2D} ctx
   * @private
   */


  _createClass(CubicBezierEdge, [{
    key: '_line',
    value: function _line(ctx, viaNodes) {
      // get the coordinates of the support points.
      var via1 = viaNodes[0];
      var via2 = viaNodes[1];

      // start drawing the line.
      ctx.beginPath();
      ctx.moveTo(this.fromPoint.x, this.fromPoint.y);

      // fallback to normal straight edges
      if (viaNodes === undefined || via1.x === undefined) {
        ctx.lineTo(this.toPoint.x, this.toPoint.y);
      } else {
        ctx.bezierCurveTo(via1.x, via1.y, via2.x, via2.y, this.toPoint.x, this.toPoint.y);
      }
      // draw shadow if enabled
      this.enableShadow(ctx);
      ctx.stroke();
      this.disableShadow(ctx);
    }
  }, {
    key: '_getViaCoordinates',
    value: function _getViaCoordinates() {
      var dx = this.from.x - this.to.x;
      var dy = this.from.y - this.to.y;

      var x1 = void 0,
          y1 = void 0,
          x2 = void 0,
          y2 = void 0;
      var roundness = this.options.smooth.roundness;

      // horizontal if x > y or if direction is forced or if direction is horizontal
      if ((Math.abs(dx) > Math.abs(dy) || this.options.smooth.forceDirection === true || this.options.smooth.forceDirection === 'horizontal') && this.options.smooth.forceDirection !== 'vertical') {
        y1 = this.from.y;
        y2 = this.to.y;
        x1 = this.from.x - roundness * dx;
        x2 = this.to.x + roundness * dx;
      } else {
        y1 = this.from.y - roundness * dy;
        y2 = this.to.y + roundness * dy;
        x1 = this.from.x;
        x2 = this.to.x;
      }

      return [{ x: x1, y: y1 }, { x: x2, y: y2 }];
    }
  }, {
    key: 'getViaNode',
    value: function getViaNode() {
      return this._getViaCoordinates();
    }
  }, {
    key: '_findBorderPosition',
    value: function _findBorderPosition(nearNode, ctx) {
      return this._findBorderPositionBezier(nearNode, ctx);
    }
  }, {
    key: '_getDistanceToEdge',
    value: function _getDistanceToEdge(x1, y1, x2, y2, x3, y3) {
      var _ref = arguments.length <= 6 || arguments[6] === undefined ? this._getViaCoordinates() : arguments[6];

      var _ref2 = _slicedToArray(_ref, 2);

      var via1 = _ref2[0];
      var via2 = _ref2[1];
      // x3,y3 is the point
      return this._getDistanceToBezierEdge(x1, y1, x2, y2, x3, y3, via1, via2);
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
      var _ref3 = arguments.length <= 1 || arguments[1] === undefined ? this._getViaCoordinates() : arguments[1];

      var _ref4 = _slicedToArray(_ref3, 2);

      var via1 = _ref4[0];
      var via2 = _ref4[1];

      var t = percentage;
      var vec = [];
      vec[0] = Math.pow(1 - t, 3);
      vec[1] = 3 * t * Math.pow(1 - t, 2);
      vec[2] = 3 * Math.pow(t, 2) * (1 - t);
      vec[3] = Math.pow(t, 3);
      var x = vec[0] * this.fromPoint.x + vec[1] * via1.x + vec[2] * via2.x + vec[3] * this.toPoint.x;
      var y = vec[0] * this.fromPoint.y + vec[1] * via1.y + vec[2] * via2.y + vec[3] * this.toPoint.y;

      return { x: x, y: y };
    }
  }]);

  return CubicBezierEdge;
}(_CubicBezierEdgeBase3.default);

exports.default = CubicBezierEdge;