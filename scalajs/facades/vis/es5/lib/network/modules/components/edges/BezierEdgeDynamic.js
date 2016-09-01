"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _BezierEdgeBase2 = require("./util/BezierEdgeBase");

var _BezierEdgeBase3 = _interopRequireDefault(_BezierEdgeBase2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var BezierEdgeDynamic = function (_BezierEdgeBase) {
  _inherits(BezierEdgeDynamic, _BezierEdgeBase);

  function BezierEdgeDynamic(options, body, labelModule) {
    _classCallCheck(this, BezierEdgeDynamic);

    // --> this calls the setOptions below
    var _this = _possibleConstructorReturn(this, (BezierEdgeDynamic.__proto__ || Object.getPrototypeOf(BezierEdgeDynamic)).call(this, options, body, labelModule));
    //this.via = undefined; // Here for completeness but not allowed to defined before super() is invoked.


    _this._boundFunction = function () {
      _this.positionBezierNode();
    };
    _this.body.emitter.on("_repositionBezierNodes", _this._boundFunction);
    return _this;
  }

  _createClass(BezierEdgeDynamic, [{
    key: "setOptions",
    value: function setOptions(options) {
      // check if the physics has changed.
      var physicsChange = false;
      if (this.options.physics !== options.physics) {
        physicsChange = true;
      }

      // set the options and the to and from nodes
      this.options = options;
      this.id = this.options.id;
      this.from = this.body.nodes[this.options.from];
      this.to = this.body.nodes[this.options.to];

      // setup the support node and connect
      this.setupSupportNode();
      this.connect();

      // when we change the physics state of the edge, we reposition the support node.
      if (physicsChange === true) {
        this.via.setOptions({ physics: this.options.physics });
        this.positionBezierNode();
      }
    }
  }, {
    key: "connect",
    value: function connect() {
      this.from = this.body.nodes[this.options.from];
      this.to = this.body.nodes[this.options.to];
      if (this.from === undefined || this.to === undefined || this.options.physics === false) {
        this.via.setOptions({ physics: false });
      } else {
        // fix weird behaviour where a self referencing node has physics enabled
        if (this.from.id === this.to.id) {
          this.via.setOptions({ physics: false });
        } else {
          this.via.setOptions({ physics: true });
        }
      }
    }

    /**
     * remove the support nodes
     * @returns {boolean}
     */

  }, {
    key: "cleanup",
    value: function cleanup() {
      this.body.emitter.off("_repositionBezierNodes", this._boundFunction);
      if (this.via !== undefined) {
        delete this.body.nodes[this.via.id];
        this.via = undefined;
        return true;
      }
      return false;
    }

    /**
     * Bezier curves require an anchor point to calculate the smooth flow. These points are nodes. These nodes are invisible but
     * are used for the force calculation.
     *
     * The changed data is not called, if needed, it is returned by the main edge constructor.
     * @private
     */

  }, {
    key: "setupSupportNode",
    value: function setupSupportNode() {
      if (this.via === undefined) {
        var nodeId = "edgeId:" + this.id;
        var node = this.body.functions.createNode({
          id: nodeId,
          shape: 'circle',
          physics: true,
          hidden: true
        });
        this.body.nodes[nodeId] = node;
        this.via = node;
        this.via.parentEdgeId = this.id;
        this.positionBezierNode();
      }
    }
  }, {
    key: "positionBezierNode",
    value: function positionBezierNode() {
      if (this.via !== undefined && this.from !== undefined && this.to !== undefined) {
        this.via.x = 0.5 * (this.from.x + this.to.x);
        this.via.y = 0.5 * (this.from.y + this.to.y);
      } else if (this.via !== undefined) {
        this.via.x = 0;
        this.via.y = 0;
      }
    }

    /**
     * Draw a line between two nodes
     * @param {CanvasRenderingContext2D} ctx
     * @private
     */

  }, {
    key: "_line",
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
    key: "getViaNode",
    value: function getViaNode() {
      return this.via;
    }

    /**
     * Combined function of pointOnLine and pointOnBezier. This gives the coordinates of a point on the line at a certain percentage of the way
     * @param percentage
     * @param viaNode
     * @returns {{x: number, y: number}}
     * @private
     */

  }, {
    key: "getPoint",
    value: function getPoint(percentage) {
      var viaNode = arguments.length <= 1 || arguments[1] === undefined ? this.via : arguments[1];

      var t = percentage;
      var x = Math.pow(1 - t, 2) * this.fromPoint.x + 2 * t * (1 - t) * viaNode.x + Math.pow(t, 2) * this.toPoint.x;
      var y = Math.pow(1 - t, 2) * this.fromPoint.y + 2 * t * (1 - t) * viaNode.y + Math.pow(t, 2) * this.toPoint.y;

      return { x: x, y: y };
    }
  }, {
    key: "_findBorderPosition",
    value: function _findBorderPosition(nearNode, ctx) {
      return this._findBorderPositionBezier(nearNode, ctx, this.via);
    }
  }, {
    key: "_getDistanceToEdge",
    value: function _getDistanceToEdge(x1, y1, x2, y2, x3, y3) {
      // x3,y3 is the point
      return this._getDistanceToBezierEdge(x1, y1, x2, y2, x3, y3, this.via);
    }
  }]);

  return BezierEdgeDynamic;
}(_BezierEdgeBase3.default);

exports.default = BezierEdgeDynamic;