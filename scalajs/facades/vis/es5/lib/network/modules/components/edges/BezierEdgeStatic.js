'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _BezierEdgeBase2 = require('./util/BezierEdgeBase');

var _BezierEdgeBase3 = _interopRequireDefault(_BezierEdgeBase2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var BezierEdgeStatic = function (_BezierEdgeBase) {
  _inherits(BezierEdgeStatic, _BezierEdgeBase);

  function BezierEdgeStatic(options, body, labelModule) {
    _classCallCheck(this, BezierEdgeStatic);

    return _possibleConstructorReturn(this, (BezierEdgeStatic.__proto__ || Object.getPrototypeOf(BezierEdgeStatic)).call(this, options, body, labelModule));
  }

  /**
   * Draw a line between two nodes
   * @param {CanvasRenderingContext2D} ctx
   * @private
   */


  _createClass(BezierEdgeStatic, [{
    key: '_line',
    value: function _line(ctx, viaNode) {
      // draw a straight line
      ctx.beginPath();
      ctx.moveTo(this.fromPoint.x, this.fromPoint.y);

      // fallback to normal straight edges
      if (viaNode.x === undefined) {
        ctx.lineTo(this.toPoint.x, this.toPoint.y);
      } else {
        ctx.quadraticCurveTo(viaNode.x, viaNode.y, this.toPoint.x, this.toPoint.y);
      }
      // draw shadow if enabled
      this.enableShadow(ctx);
      ctx.stroke();
      this.disableShadow(ctx);
    }
  }, {
    key: 'getViaNode',
    value: function getViaNode() {
      return this._getViaCoordinates();
    }

    /**
     * We do not use the to and fromPoints here to make the via nodes the same as edges without arrows.
     * @returns {{x: undefined, y: undefined}}
     * @private
     */

  }, {
    key: '_getViaCoordinates',
    value: function _getViaCoordinates() {
      var xVia = undefined;
      var yVia = undefined;
      var factor = this.options.smooth.roundness;
      var type = this.options.smooth.type;
      var dx = Math.abs(this.from.x - this.to.x);
      var dy = Math.abs(this.from.y - this.to.y);
      if (type === 'discrete' || type === 'diagonalCross') {
        if (Math.abs(this.from.x - this.to.x) <= Math.abs(this.from.y - this.to.y)) {
          if (this.from.y >= this.to.y) {
            if (this.from.x <= this.to.x) {
              xVia = this.from.x + factor * dy;
              yVia = this.from.y - factor * dy;
            } else if (this.from.x > this.to.x) {
              xVia = this.from.x - factor * dy;
              yVia = this.from.y - factor * dy;
            }
          } else if (this.from.y < this.to.y) {
            if (this.from.x <= this.to.x) {
              xVia = this.from.x + factor * dy;
              yVia = this.from.y + factor * dy;
            } else if (this.from.x > this.to.x) {
              xVia = this.from.x - factor * dy;
              yVia = this.from.y + factor * dy;
            }
          }
          if (type === "discrete") {
            xVia = dx < factor * dy ? this.from.x : xVia;
          }
        } else if (Math.abs(this.from.x - this.to.x) > Math.abs(this.from.y - this.to.y)) {
          if (this.from.y >= this.to.y) {
            if (this.from.x <= this.to.x) {
              xVia = this.from.x + factor * dx;
              yVia = this.from.y - factor * dx;
            } else if (this.from.x > this.to.x) {
              xVia = this.from.x - factor * dx;
              yVia = this.from.y - factor * dx;
            }
          } else if (this.from.y < this.to.y) {
            if (this.from.x <= this.to.x) {
              xVia = this.from.x + factor * dx;
              yVia = this.from.y + factor * dx;
            } else if (this.from.x > this.to.x) {
              xVia = this.from.x - factor * dx;
              yVia = this.from.y + factor * dx;
            }
          }
          if (type === "discrete") {
            yVia = dy < factor * dx ? this.from.y : yVia;
          }
        }
      } else if (type === "straightCross") {
        if (Math.abs(this.from.x - this.to.x) <= Math.abs(this.from.y - this.to.y)) {
          // up - down
          xVia = this.from.x;
          if (this.from.y < this.to.y) {
            yVia = this.to.y - (1 - factor) * dy;
          } else {
            yVia = this.to.y + (1 - factor) * dy;
          }
        } else if (Math.abs(this.from.x - this.to.x) > Math.abs(this.from.y - this.to.y)) {
          // left - right
          if (this.from.x < this.to.x) {
            xVia = this.to.x - (1 - factor) * dx;
          } else {
            xVia = this.to.x + (1 - factor) * dx;
          }
          yVia = this.from.y;
        }
      } else if (type === 'horizontal') {
        if (this.from.x < this.to.x) {
          xVia = this.to.x - (1 - factor) * dx;
        } else {
          xVia = this.to.x + (1 - factor) * dx;
        }
        yVia = this.from.y;
      } else if (type === 'vertical') {
        xVia = this.from.x;
        if (this.from.y < this.to.y) {
          yVia = this.to.y - (1 - factor) * dy;
        } else {
          yVia = this.to.y + (1 - factor) * dy;
        }
      } else if (type === 'curvedCW') {
        dx = this.to.x - this.from.x;
        dy = this.from.y - this.to.y;
        var radius = Math.sqrt(dx * dx + dy * dy);
        var pi = Math.PI;

        var originalAngle = Math.atan2(dy, dx);
        var myAngle = (originalAngle + (factor * 0.5 + 0.5) * pi) % (2 * pi);

        xVia = this.from.x + (factor * 0.5 + 0.5) * radius * Math.sin(myAngle);
        yVia = this.from.y + (factor * 0.5 + 0.5) * radius * Math.cos(myAngle);
      } else if (type === 'curvedCCW') {
        dx = this.to.x - this.from.x;
        dy = this.from.y - this.to.y;
        var _radius = Math.sqrt(dx * dx + dy * dy);
        var _pi = Math.PI;

        var _originalAngle = Math.atan2(dy, dx);
        var _myAngle = (_originalAngle + (-factor * 0.5 + 0.5) * _pi) % (2 * _pi);

        xVia = this.from.x + (factor * 0.5 + 0.5) * _radius * Math.sin(_myAngle);
        yVia = this.from.y + (factor * 0.5 + 0.5) * _radius * Math.cos(_myAngle);
      } else {
        // continuous
        if (Math.abs(this.from.x - this.to.x) <= Math.abs(this.from.y - this.to.y)) {
          if (this.from.y >= this.to.y) {
            if (this.from.x <= this.to.x) {
              xVia = this.from.x + factor * dy;
              yVia = this.from.y - factor * dy;
              xVia = this.to.x < xVia ? this.to.x : xVia;
            } else if (this.from.x > this.to.x) {
              xVia = this.from.x - factor * dy;
              yVia = this.from.y - factor * dy;
              xVia = this.to.x > xVia ? this.to.x : xVia;
            }
          } else if (this.from.y < this.to.y) {
            if (this.from.x <= this.to.x) {
              xVia = this.from.x + factor * dy;
              yVia = this.from.y + factor * dy;
              xVia = this.to.x < xVia ? this.to.x : xVia;
            } else if (this.from.x > this.to.x) {
              xVia = this.from.x - factor * dy;
              yVia = this.from.y + factor * dy;
              xVia = this.to.x > xVia ? this.to.x : xVia;
            }
          }
        } else if (Math.abs(this.from.x - this.to.x) > Math.abs(this.from.y - this.to.y)) {
          if (this.from.y >= this.to.y) {
            if (this.from.x <= this.to.x) {
              xVia = this.from.x + factor * dx;
              yVia = this.from.y - factor * dx;
              yVia = this.to.y > yVia ? this.to.y : yVia;
            } else if (this.from.x > this.to.x) {
              xVia = this.from.x - factor * dx;
              yVia = this.from.y - factor * dx;
              yVia = this.to.y > yVia ? this.to.y : yVia;
            }
          } else if (this.from.y < this.to.y) {
            if (this.from.x <= this.to.x) {
              xVia = this.from.x + factor * dx;
              yVia = this.from.y + factor * dx;
              yVia = this.to.y < yVia ? this.to.y : yVia;
            } else if (this.from.x > this.to.x) {
              xVia = this.from.x - factor * dx;
              yVia = this.from.y + factor * dx;
              yVia = this.to.y < yVia ? this.to.y : yVia;
            }
          }
        }
      }
      return { x: xVia, y: yVia };
    }
  }, {
    key: '_findBorderPosition',
    value: function _findBorderPosition(nearNode, ctx) {
      var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

      return this._findBorderPositionBezier(nearNode, ctx, options.via);
    }
  }, {
    key: '_getDistanceToEdge',
    value: function _getDistanceToEdge(x1, y1, x2, y2, x3, y3) {
      var viaNode = arguments.length <= 6 || arguments[6] === undefined ? this._getViaCoordinates() : arguments[6];
      // x3,y3 is the point
      return this._getDistanceToBezierEdge(x1, y1, x2, y2, x3, y3, viaNode);
    }

    /**
     * Combined function of pointOnLine and pointOnBezier. This gives the coordinates of a point on the line at a certain percentage of the way
     * @param percentage
     * @param viaNode
     * @returns {{x: number, y: number}}
     * @private
     */

  }, {
    key: 'getPoint',
    value: function getPoint(percentage) {
      var viaNode = arguments.length <= 1 || arguments[1] === undefined ? this._getViaCoordinates() : arguments[1];

      var t = percentage;
      var x = Math.pow(1 - t, 2) * this.fromPoint.x + 2 * t * (1 - t) * viaNode.x + Math.pow(t, 2) * this.toPoint.x;
      var y = Math.pow(1 - t, 2) * this.fromPoint.y + 2 * t * (1 - t) * viaNode.y + Math.pow(t, 2) * this.toPoint.y;

      return { x: x, y: y };
    }
  }]);

  return BezierEdgeStatic;
}(_BezierEdgeBase3.default);

exports.default = BezierEdgeStatic;