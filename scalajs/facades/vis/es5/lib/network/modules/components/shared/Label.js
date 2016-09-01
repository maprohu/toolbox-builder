'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var util = require('../../../../util');

var Label = function () {
  function Label(body, options) {
    var edgelabel = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

    _classCallCheck(this, Label);

    this.body = body;

    this.pointToSelf = false;
    this.baseSize = undefined;
    this.fontOptions = {};
    this.setOptions(options);
    this.size = { top: 0, left: 0, width: 0, height: 0, yLine: 0 }; // could be cached
    this.isEdgeLabel = edgelabel;
  }

  _createClass(Label, [{
    key: 'setOptions',
    value: function setOptions(options) {
      var allowDeletion = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

      this.nodeOptions = options;

      // We want to keep the font options seperated from the node options.
      // The node options have to mirror the globals when they are not overruled.
      this.fontOptions = util.deepExtend({}, options.font, true);

      if (options.label !== undefined) {
        this.labelDirty = true;
      }

      if (options.font !== undefined) {
        Label.parseOptions(this.fontOptions, options, allowDeletion);
        if (typeof options.font === 'string') {
          this.baseSize = this.fontOptions.size;
        } else if (_typeof(options.font) === 'object') {
          if (options.font.size !== undefined) {
            this.baseSize = options.font.size;
          }
        }
      }
    }
  }, {
    key: 'draw',


    /**
     * Main function. This is called from anything that wants to draw a label.
     * @param ctx
     * @param x
     * @param y
     * @param selected
     * @param baseline
     */
    value: function draw(ctx, x, y, selected) {
      var baseline = arguments.length <= 4 || arguments[4] === undefined ? 'middle' : arguments[4];

      // if no label, return
      if (this.nodeOptions.label === undefined) return;

      // check if we have to render the label
      var viewFontSize = this.fontOptions.size * this.body.view.scale;
      if (this.nodeOptions.label && viewFontSize < this.nodeOptions.scaling.label.drawThreshold - 1) return;

      // update the size cache if required
      this.calculateLabelSize(ctx, selected, x, y, baseline);

      // create the fontfill background
      this._drawBackground(ctx);
      // draw text
      this._drawText(ctx, selected, x, y, baseline);
    }

    /**
     * Draws the label background
     * @param {CanvasRenderingContext2D} ctx
     * @private
     */

  }, {
    key: '_drawBackground',
    value: function _drawBackground(ctx) {
      if (this.fontOptions.background !== undefined && this.fontOptions.background !== "none") {
        ctx.fillStyle = this.fontOptions.background;

        var lineMargin = 2;

        if (this.isEdgeLabel) {
          switch (this.fontOptions.align) {
            case 'middle':
              ctx.fillRect(-this.size.width * 0.5, -this.size.height * 0.5, this.size.width, this.size.height);
              break;
            case 'top':
              ctx.fillRect(-this.size.width * 0.5, -(this.size.height + lineMargin), this.size.width, this.size.height);
              break;
            case 'bottom':
              ctx.fillRect(-this.size.width * 0.5, lineMargin, this.size.width, this.size.height);
              break;
            default:
              ctx.fillRect(this.size.left, this.size.top - 0.5 * lineMargin, this.size.width, this.size.height);
              break;
          }
        } else {
          ctx.fillRect(this.size.left, this.size.top - 0.5 * lineMargin, this.size.width, this.size.height);
        }
      }
    }

    /**
     *
     * @param ctx
     * @param x
     * @param baseline
     * @private
     */

  }, {
    key: '_drawText',
    value: function _drawText(ctx, selected, x, y) {
      var baseline = arguments.length <= 4 || arguments[4] === undefined ? 'middle' : arguments[4];

      var fontSize = this.fontOptions.size;
      var viewFontSize = fontSize * this.body.view.scale;
      // this ensures that there will not be HUGE letters on screen by setting an upper limit on the visible text size (regardless of zoomLevel)
      if (viewFontSize >= this.nodeOptions.scaling.label.maxVisible) {
        fontSize = Number(this.nodeOptions.scaling.label.maxVisible) / this.body.view.scale;
      }

      var yLine = this.size.yLine;

      var _getColor2 = this._getColor(viewFontSize);

      var _getColor3 = _slicedToArray(_getColor2, 2);

      var fontColor = _getColor3[0];
      var strokeColor = _getColor3[1];

      // configure context for drawing the text
      var _setAlignment2 = this._setAlignment(ctx, x, yLine, baseline);

      var _setAlignment3 = _slicedToArray(_setAlignment2, 2);

      x = _setAlignment3[0];
      yLine = _setAlignment3[1];
      ctx.font = (selected && this.nodeOptions.labelHighlightBold ? 'bold ' : '') + fontSize + "px " + this.fontOptions.face;
      ctx.fillStyle = fontColor;
      // When the textAlign property is 'left', make label left-justified
      if (!this.isEdgeLabel && this.fontOptions.align === 'left') {
        ctx.textAlign = this.fontOptions.align;
        x = x - 0.5 * this.size.width; // Shift label 1/2-distance to the left
      } else {
        ctx.textAlign = 'center';
      }

      // set the strokeWidth
      if (this.fontOptions.strokeWidth > 0) {
        ctx.lineWidth = this.fontOptions.strokeWidth;
        ctx.strokeStyle = strokeColor;
        ctx.lineJoin = 'round';
      }

      // draw the text
      for (var i = 0; i < this.lineCount; i++) {
        if (this.fontOptions.strokeWidth > 0) {
          ctx.strokeText(this.lines[i], x, yLine);
        }
        ctx.fillText(this.lines[i], x, yLine);
        yLine += fontSize;
      }
    }
  }, {
    key: '_setAlignment',
    value: function _setAlignment(ctx, x, yLine, baseline) {
      // check for label alignment (for edges)
      // TODO: make alignment for nodes
      if (this.isEdgeLabel && this.fontOptions.align !== 'horizontal' && this.pointToSelf === false) {
        x = 0;
        yLine = 0;

        var lineMargin = 2;
        if (this.fontOptions.align === 'top') {
          ctx.textBaseline = 'alphabetic';
          yLine -= 2 * lineMargin; // distance from edge, required because we use alphabetic. Alphabetic has less difference between browsers
        } else if (this.fontOptions.align === 'bottom') {
          ctx.textBaseline = 'hanging';
          yLine += 2 * lineMargin; // distance from edge, required because we use hanging. Hanging has less difference between browsers
        } else {
          ctx.textBaseline = 'middle';
        }
      } else {
        ctx.textBaseline = baseline;
      }

      return [x, yLine];
    }

    /**
     * fade in when relative scale is between threshold and threshold - 1.
     * If the relative scale would be smaller than threshold -1 the draw function would have returned before coming here.
     *
     * @param viewFontSize
     * @returns {*[]}
     * @private
     */

  }, {
    key: '_getColor',
    value: function _getColor(viewFontSize) {
      var fontColor = this.fontOptions.color || '#000000';
      var strokeColor = this.fontOptions.strokeColor || '#ffffff';
      if (viewFontSize <= this.nodeOptions.scaling.label.drawThreshold) {
        var opacity = Math.max(0, Math.min(1, 1 - (this.nodeOptions.scaling.label.drawThreshold - viewFontSize)));
        fontColor = util.overrideOpacity(fontColor, opacity);
        strokeColor = util.overrideOpacity(strokeColor, opacity);
      }
      return [fontColor, strokeColor];
    }

    /**
     *
     * @param ctx
     * @param selected
     * @returns {{width: number, height: number}}
     */

  }, {
    key: 'getTextSize',
    value: function getTextSize(ctx) {
      var selected = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

      var size = {
        width: this._processLabel(ctx, selected),
        height: this.fontOptions.size * this.lineCount,
        lineCount: this.lineCount
      };
      return size;
    }

    /**
     *
     * @param ctx
     * @param selected
     * @param x
     * @param y
     * @param baseline
     */

  }, {
    key: 'calculateLabelSize',
    value: function calculateLabelSize(ctx, selected) {
      var x = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];
      var y = arguments.length <= 3 || arguments[3] === undefined ? 0 : arguments[3];
      var baseline = arguments.length <= 4 || arguments[4] === undefined ? 'middle' : arguments[4];

      if (this.labelDirty === true) {
        this.size.width = this._processLabel(ctx, selected);
      }
      this.size.height = this.fontOptions.size * this.lineCount;
      this.size.left = x - this.size.width * 0.5;
      this.size.top = y - this.size.height * 0.5;
      this.size.yLine = y + (1 - this.lineCount) * 0.5 * this.fontOptions.size;
      if (baseline === "hanging") {
        this.size.top += 0.5 * this.fontOptions.size;
        this.size.top += 4; // distance from node, required because we use hanging. Hanging has less difference between browsers
        this.size.yLine += 4; // distance from node
      }

      this.labelDirty = false;
    }

    /**
     * This calculates the width as well as explodes the label string and calculates the amount of lines.
     * @param ctx
     * @param selected
     * @returns {number}
     * @private
     */

  }, {
    key: '_processLabel',
    value: function _processLabel(ctx, selected) {
      var width = 0;
      var lines = [''];
      var lineCount = 0;
      if (this.nodeOptions.label !== undefined) {
        lines = String(this.nodeOptions.label).split('\n');
        lineCount = lines.length;
        ctx.font = (selected && this.nodeOptions.labelHighlightBold ? 'bold ' : '') + this.fontOptions.size + "px " + this.fontOptions.face;
        width = ctx.measureText(lines[0]).width;
        for (var i = 1; i < lineCount; i++) {
          var lineWidth = ctx.measureText(lines[i]).width;
          width = lineWidth > width ? lineWidth : width;
        }
      }
      this.lines = lines;
      this.lineCount = lineCount;

      return width;
    }
  }], [{
    key: 'parseOptions',
    value: function parseOptions(parentOptions, newOptions) {
      var allowDeletion = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

      if (typeof newOptions.font === 'string') {
        var newOptionsArray = newOptions.font.split(" ");
        parentOptions.size = newOptionsArray[0].replace("px", '');
        parentOptions.face = newOptionsArray[1];
        parentOptions.color = newOptionsArray[2];
      } else if (_typeof(newOptions.font) === 'object') {
        util.fillIfDefined(parentOptions, newOptions.font, allowDeletion);
      }
      parentOptions.size = Number(parentOptions.size);
    }
  }]);

  return Label;
}();

exports.default = Label;