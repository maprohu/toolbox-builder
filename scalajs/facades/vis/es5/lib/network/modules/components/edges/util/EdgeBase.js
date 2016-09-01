'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var util = require("../../../../../util");

var EdgeBase = function () {
  function EdgeBase(options, body, labelModule) {
    _classCallCheck(this, EdgeBase);

    this.body = body;
    this.labelModule = labelModule;
    this.options = {};
    this.setOptions(options);
    this.colorDirty = true;
    this.color = {};
    this.selectionWidth = 2;
    this.hoverWidth = 1.5;
    this.fromPoint = this.from;
    this.toPoint = this.to;
  }

  _createClass(EdgeBase, [{
    key: 'connect',
    value: function connect() {
      this.from = this.body.nodes[this.options.from];
      this.to = this.body.nodes[this.options.to];
    }
  }, {
    key: 'cleanup',
    value: function cleanup() {
      return false;
    }
  }, {
    key: 'setOptions',
    value: function setOptions(options) {
      this.options = options;
      this.from = this.body.nodes[this.options.from];
      this.to = this.body.nodes[this.options.to];
      this.id = this.options.id;
    }

    /**
     * Redraw a edge as a line
     * Draw this edge in the given canvas
     * The 2d context of a HTML canvas can be retrieved by canvas.getContext("2d");
     * @param {CanvasRenderingContext2D}   ctx
     * @private
     */

  }, {
    key: 'drawLine',
    value: function drawLine(ctx, selected, hover, viaNode) {
      // set style
      ctx.strokeStyle = this.getColor(ctx, selected, hover);
      ctx.lineWidth = this.getLineWidth(selected, hover);

      if (this.options.dashes !== false) {
        this._drawDashedLine(ctx, viaNode);
      } else {
        this._drawLine(ctx, viaNode);
      }
    }
  }, {
    key: '_drawLine',
    value: function _drawLine(ctx, viaNode, fromPoint, toPoint) {
      if (this.from != this.to) {
        // draw line
        this._line(ctx, viaNode, fromPoint, toPoint);
      } else {
        var _getCircleData2 = this._getCircleData(ctx);

        var _getCircleData3 = _slicedToArray(_getCircleData2, 3);

        var x = _getCircleData3[0];
        var y = _getCircleData3[1];
        var radius = _getCircleData3[2];

        this._circle(ctx, x, y, radius);
      }
    }
  }, {
    key: '_drawDashedLine',
    value: function _drawDashedLine(ctx, viaNode, fromPoint, toPoint) {
      ctx.lineCap = 'round';
      var pattern = [5, 5];
      if (Array.isArray(this.options.dashes) === true) {
        pattern = this.options.dashes;
      }

      // only firefox and chrome support this method, else we use the legacy one.
      if (ctx.setLineDash !== undefined) {
        ctx.save();

        // set dash settings for chrome or firefox
        ctx.setLineDash(pattern);
        ctx.lineDashOffset = 0;

        // draw the line
        if (this.from != this.to) {
          // draw line
          this._line(ctx, viaNode);
        } else {
          var _getCircleData4 = this._getCircleData(ctx);

          var _getCircleData5 = _slicedToArray(_getCircleData4, 3);

          var x = _getCircleData5[0];
          var y = _getCircleData5[1];
          var radius = _getCircleData5[2];

          this._circle(ctx, x, y, radius);
        }

        // restore the dash settings.
        ctx.setLineDash([0]);
        ctx.lineDashOffset = 0;
        ctx.restore();
      } else {
        // unsupporting smooth lines
        if (this.from != this.to) {
          // draw line
          ctx.dashedLine(this.from.x, this.from.y, this.to.x, this.to.y, pattern);
        } else {
          var _getCircleData6 = this._getCircleData(ctx);

          var _getCircleData7 = _slicedToArray(_getCircleData6, 3);

          var _x = _getCircleData7[0];
          var _y = _getCircleData7[1];
          var _radius = _getCircleData7[2];

          this._circle(ctx, _x, _y, _radius);
        }
        // draw shadow if enabled
        this.enableShadow(ctx);

        ctx.stroke();

        // disable shadows for other elements.
        this.disableShadow(ctx);
      }
    }
  }, {
    key: 'findBorderPosition',
    value: function findBorderPosition(nearNode, ctx, options) {
      if (this.from != this.to) {
        return this._findBorderPosition(nearNode, ctx, options);
      } else {
        return this._findBorderPositionCircle(nearNode, ctx, options);
      }
    }
  }, {
    key: 'findBorderPositions',
    value: function findBorderPositions(ctx) {
      var from = {};
      var to = {};
      if (this.from != this.to) {
        from = this._findBorderPosition(this.from, ctx);
        to = this._findBorderPosition(this.to, ctx);
      } else {
        var _getCircleData8 = this._getCircleData(ctx);

        var _getCircleData9 = _slicedToArray(_getCircleData8, 3);

        var x = _getCircleData9[0];
        var y = _getCircleData9[1];
        var radius = _getCircleData9[2];


        from = this._findBorderPositionCircle(this.from, ctx, { x: x, y: y, low: 0.25, high: 0.6, direction: -1 });
        to = this._findBorderPositionCircle(this.from, ctx, { x: x, y: y, low: 0.6, high: 0.8, direction: 1 });
      }
      return { from: from, to: to };
    }
  }, {
    key: '_getCircleData',
    value: function _getCircleData(ctx) {
      var x = void 0,
          y = void 0;
      var node = this.from;
      var radius = this.options.selfReferenceSize;

      if (ctx !== undefined) {
        if (node.shape.width === undefined) {
          node.shape.resize(ctx);
        }
      }

      // get circle coordinates
      if (node.shape.width > node.shape.height) {
        x = node.x + node.shape.width * 0.5;
        y = node.y - radius;
      } else {
        x = node.x + radius;
        y = node.y - node.shape.height * 0.5;
      }
      return [x, y, radius];
    }

    /**
     * Get a point on a circle
     * @param {Number} x
     * @param {Number} y
     * @param {Number} radius
     * @param {Number} percentage. Value between 0 (line start) and 1 (line end)
     * @return {Object} point
     * @private
     */

  }, {
    key: '_pointOnCircle',
    value: function _pointOnCircle(x, y, radius, percentage) {
      var angle = percentage * 2 * Math.PI;
      return {
        x: x + radius * Math.cos(angle),
        y: y - radius * Math.sin(angle)
      };
    }

    /**
     * This function uses binary search to look for the point where the circle crosses the border of the node.
     * @param node
     * @param ctx
     * @param options
     * @returns {*}
     * @private
     */

  }, {
    key: '_findBorderPositionCircle',
    value: function _findBorderPositionCircle(node, ctx, options) {
      var x = options.x;
      var y = options.y;
      var low = options.low;
      var high = options.high;
      var direction = options.direction;

      var maxIterations = 10;
      var iteration = 0;
      var radius = this.options.selfReferenceSize;
      var pos = void 0,
          angle = void 0,
          distanceToBorder = void 0,
          distanceToPoint = void 0,
          difference = void 0;
      var threshold = 0.05;
      var middle = (low + high) * 0.5;

      while (low <= high && iteration < maxIterations) {
        middle = (low + high) * 0.5;

        pos = this._pointOnCircle(x, y, radius, middle);
        angle = Math.atan2(node.y - pos.y, node.x - pos.x);
        distanceToBorder = node.distanceToBorder(ctx, angle);
        distanceToPoint = Math.sqrt(Math.pow(pos.x - node.x, 2) + Math.pow(pos.y - node.y, 2));
        difference = distanceToBorder - distanceToPoint;
        if (Math.abs(difference) < threshold) {
          break; // found
        } else if (difference > 0) {
          // distance to nodes is larger than distance to border --> t needs to be bigger if we're looking at the to node.
          if (direction > 0) {
            low = middle;
          } else {
            high = middle;
          }
        } else {
          if (direction > 0) {
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
     * Get the line width of the edge. Depends on width and whether one of the
     * connected nodes is selected.
     * @return {Number} width
     * @private
     */

  }, {
    key: 'getLineWidth',
    value: function getLineWidth(selected, hover) {
      if (selected === true) {
        return Math.max(this.selectionWidth, 0.3 / this.body.view.scale);
      } else {
        if (hover === true) {
          return Math.max(this.hoverWidth, 0.3 / this.body.view.scale);
        } else {
          return Math.max(this.options.width, 0.3 / this.body.view.scale);
        }
      }
    }
  }, {
    key: 'getColor',
    value: function getColor(ctx, selected, hover) {
      var colorOptions = this.options.color;
      if (colorOptions.inherit !== false) {
        // when this is a loop edge, just use the 'from' method
        if (colorOptions.inherit === 'both' && this.from.id !== this.to.id) {
          var grd = ctx.createLinearGradient(this.from.x, this.from.y, this.to.x, this.to.y);
          var fromColor = void 0,
              toColor = void 0;
          fromColor = this.from.options.color.highlight.border;
          toColor = this.to.options.color.highlight.border;

          if (this.from.selected === false && this.to.selected === false) {
            fromColor = util.overrideOpacity(this.from.options.color.border, this.options.color.opacity);
            toColor = util.overrideOpacity(this.to.options.color.border, this.options.color.opacity);
          } else if (this.from.selected === true && this.to.selected === false) {
            toColor = this.to.options.color.border;
          } else if (this.from.selected === false && this.to.selected === true) {
            fromColor = this.from.options.color.border;
          }
          grd.addColorStop(0, fromColor);
          grd.addColorStop(1, toColor);

          // -------------------- this returns -------------------- //
          return grd;
        }

        if (this.colorDirty === true) {
          if (colorOptions.inherit === "to") {
            this.color.highlight = this.to.options.color.highlight.border;
            this.color.hover = this.to.options.color.hover.border;
            this.color.color = util.overrideOpacity(this.to.options.color.border, colorOptions.opacity);
          } else {
            // (this.options.color.inherit.source === "from") {
            this.color.highlight = this.from.options.color.highlight.border;
            this.color.hover = this.from.options.color.hover.border;
            this.color.color = util.overrideOpacity(this.from.options.color.border, colorOptions.opacity);
          }
        }
      } else if (this.colorDirty === true) {
        this.color.highlight = colorOptions.highlight;
        this.color.hover = colorOptions.hover;
        this.color.color = util.overrideOpacity(colorOptions.color, colorOptions.opacity);
      }

      // if color inherit is on and gradients are used, the function has already returned by now.
      this.colorDirty = false;

      if (selected === true) {
        return this.color.highlight;
      } else if (hover === true) {
        return this.color.hover;
      } else {
        return this.color.color;
      }
    }

    /**
     * Draw a line from a node to itself, a circle
     * @param {CanvasRenderingContext2D} ctx
     * @param {Number} x
     * @param {Number} y
     * @param {Number} radius
     * @private
     */

  }, {
    key: '_circle',
    value: function _circle(ctx, x, y, radius) {
      // draw shadow if enabled
      this.enableShadow(ctx);

      // draw a circle
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
      ctx.stroke();

      // disable shadows for other elements.
      this.disableShadow(ctx);
    }

    /**
     * Calculate the distance between a point (x3,y3) and a line segment from
     * (x1,y1) to (x2,y2).
     * http://stackoverflow.com/questions/849211/shortest-distancae-between-a-point-and-a-line-segment
     * @param {number} x1
     * @param {number} y1
     * @param {number} x2
     * @param {number} y2
     * @param {number} x3
     * @param {number} y3
     * @private
     */

  }, {
    key: 'getDistanceToEdge',
    value: function getDistanceToEdge(x1, y1, x2, y2, x3, y3, via) {
      // x3,y3 is the point
      var returnValue = 0;
      if (this.from != this.to) {
        returnValue = this._getDistanceToEdge(x1, y1, x2, y2, x3, y3, via);
      } else {
        var _getCircleData10 = this._getCircleData();

        var _getCircleData11 = _slicedToArray(_getCircleData10, 3);

        var x = _getCircleData11[0];
        var y = _getCircleData11[1];
        var radius = _getCircleData11[2];

        var dx = x - x3;
        var dy = y - y3;
        returnValue = Math.abs(Math.sqrt(dx * dx + dy * dy) - radius);
      }

      if (this.labelModule.size.left < x3 && this.labelModule.size.left + this.labelModule.size.width > x3 && this.labelModule.size.top < y3 && this.labelModule.size.top + this.labelModule.size.height > y3) {
        return 0;
      } else {
        return returnValue;
      }
    }
  }, {
    key: '_getDistanceToLine',
    value: function _getDistanceToLine(x1, y1, x2, y2, x3, y3) {
      var px = x2 - x1;
      var py = y2 - y1;
      var something = px * px + py * py;
      var u = ((x3 - x1) * px + (y3 - y1) * py) / something;

      if (u > 1) {
        u = 1;
      } else if (u < 0) {
        u = 0;
      }

      var x = x1 + u * px;
      var y = y1 + u * py;
      var dx = x - x3;
      var dy = y - y3;

      //# Note: If the actual distance does not matter,
      //# if you only want to compare what this function
      //# returns to other results of this function, you
      //# can just return the squared distance instead
      //# (i.e. remove the sqrt) to gain a little performance

      return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     *
     * @param ctx
     * @param position
     * @param viaNode
     */

  }, {
    key: 'getArrowData',
    value: function getArrowData(ctx, position, viaNode, selected, hover) {
      // set lets
      var angle = void 0;
      var arrowPoint = void 0;
      var node1 = void 0;
      var node2 = void 0;
      var guideOffset = void 0;
      var scaleFactor = void 0;
      var lineWidth = this.getLineWidth(selected, hover);

      if (position === 'from') {
        node1 = this.from;
        node2 = this.to;
        guideOffset = 0.1;
        scaleFactor = this.options.arrows.from.scaleFactor;
      } else if (position === 'to') {
        node1 = this.to;
        node2 = this.from;
        guideOffset = -0.1;
        scaleFactor = this.options.arrows.to.scaleFactor;
      } else {
        node1 = this.to;
        node2 = this.from;
        scaleFactor = this.options.arrows.middle.scaleFactor;
      }

      // if not connected to itself
      if (node1 != node2) {
        if (position !== 'middle') {
          // draw arrow head
          if (this.options.smooth.enabled === true) {
            arrowPoint = this.findBorderPosition(node1, ctx, { via: viaNode });
            var guidePos = this.getPoint(Math.max(0.0, Math.min(1.0, arrowPoint.t + guideOffset)), viaNode);
            angle = Math.atan2(arrowPoint.y - guidePos.y, arrowPoint.x - guidePos.x);
          } else {
            angle = Math.atan2(node1.y - node2.y, node1.x - node2.x);
            arrowPoint = this.findBorderPosition(node1, ctx);
          }
        } else {
          angle = Math.atan2(node1.y - node2.y, node1.x - node2.x);
          arrowPoint = this.getPoint(0.5, viaNode); // this is 0.6 to account for the size of the arrow.
        }
      } else {
        // draw circle
        var _getCircleData12 = this._getCircleData(ctx);

        var _getCircleData13 = _slicedToArray(_getCircleData12, 3);

        var x = _getCircleData13[0];
        var y = _getCircleData13[1];
        var radius = _getCircleData13[2];


        if (position === 'from') {
          arrowPoint = this.findBorderPosition(this.from, ctx, { x: x, y: y, low: 0.25, high: 0.6, direction: -1 });
          angle = arrowPoint.t * -2 * Math.PI + 1.5 * Math.PI + 0.1 * Math.PI;
        } else if (position === 'to') {
          arrowPoint = this.findBorderPosition(this.from, ctx, { x: x, y: y, low: 0.6, high: 1.0, direction: 1 });
          angle = arrowPoint.t * -2 * Math.PI + 1.5 * Math.PI - 1.1 * Math.PI;
        } else {
          arrowPoint = this._pointOnCircle(x, y, radius, 0.175);
          angle = 3.9269908169872414; // === 0.175 * -2 * Math.PI + 1.5 * Math.PI + 0.1 * Math.PI;
        }
      }

      var length = 15 * scaleFactor + 3 * lineWidth; // 3* lineWidth is the width of the edge.

      var xi = arrowPoint.x - length * 0.9 * Math.cos(angle);
      var yi = arrowPoint.y - length * 0.9 * Math.sin(angle);
      var arrowCore = { x: xi, y: yi };

      return { point: arrowPoint, core: arrowCore, angle: angle, length: length };
    }

    /**
     *
     * @param ctx
     * @param selected
     * @param hover
     * @param arrowData
     */

  }, {
    key: 'drawArrowHead',
    value: function drawArrowHead(ctx, selected, hover, arrowData) {
      // set style
      ctx.strokeStyle = this.getColor(ctx, selected, hover);
      ctx.fillStyle = ctx.strokeStyle;
      ctx.lineWidth = this.getLineWidth(selected, hover);

      // draw arrow at the end of the line
      ctx.arrow(arrowData.point.x, arrowData.point.y, arrowData.angle, arrowData.length);

      // draw shadow if enabled
      this.enableShadow(ctx);
      ctx.fill();
      // disable shadows for other elements.
      this.disableShadow(ctx);
    }
  }, {
    key: 'enableShadow',
    value: function enableShadow(ctx) {
      if (this.options.shadow.enabled === true) {
        ctx.shadowColor = this.options.shadow.color;
        ctx.shadowBlur = this.options.shadow.size;
        ctx.shadowOffsetX = this.options.shadow.x;
        ctx.shadowOffsetY = this.options.shadow.y;
      }
    }
  }, {
    key: 'disableShadow',
    value: function disableShadow(ctx) {
      if (this.options.shadow.enabled === true) {
        ctx.shadowColor = 'rgba(0,0,0,0)';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
      }
    }
  }]);

  return EdgeBase;
}();

exports.default = EdgeBase;