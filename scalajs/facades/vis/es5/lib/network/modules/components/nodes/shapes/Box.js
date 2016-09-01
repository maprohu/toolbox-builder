'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _NodeBase2 = require('../util/NodeBase');

var _NodeBase3 = _interopRequireDefault(_NodeBase2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Box = function (_NodeBase) {
  _inherits(Box, _NodeBase);

  function Box(options, body, labelModule) {
    _classCallCheck(this, Box);

    return _possibleConstructorReturn(this, (Box.__proto__ || Object.getPrototypeOf(Box)).call(this, options, body, labelModule));
  }

  _createClass(Box, [{
    key: 'resize',
    value: function resize(ctx, selected) {
      if (this.width === undefined) {
        var margin = 5;
        var textSize = this.labelModule.getTextSize(ctx, selected);
        this.width = textSize.width + 2 * margin;
        this.height = textSize.height + 2 * margin;
        this.radius = 0.5 * this.width;
      }
    }
  }, {
    key: 'draw',
    value: function draw(ctx, x, y, selected, hover) {
      this.resize(ctx, selected);
      this.left = x - this.width / 2;
      this.top = y - this.height / 2;

      var borderWidth = this.options.borderWidth;
      var selectionLineWidth = this.options.borderWidthSelected || 2 * this.options.borderWidth;

      ctx.strokeStyle = selected ? this.options.color.highlight.border : hover ? this.options.color.hover.border : this.options.color.border;
      ctx.lineWidth = selected ? selectionLineWidth : borderWidth;
      ctx.lineWidth /= this.body.view.scale;
      ctx.lineWidth = Math.min(this.width, ctx.lineWidth);

      ctx.fillStyle = selected ? this.options.color.highlight.background : hover ? this.options.color.hover.background : this.options.color.background;

      var borderRadius = this.options.shapeProperties.borderRadius; // only effective for box
      ctx.roundRect(this.left, this.top, this.width, this.height, borderRadius);

      // draw shadow if enabled
      this.enableShadow(ctx);
      // draw the background
      ctx.fill();
      // disable shadows for other elements.
      this.disableShadow(ctx);

      //draw dashed border if enabled, save and restore is required for firefox not to crash on unix.
      ctx.save();
      // if borders are zero width, they will be drawn with width 1 by default. This prevents that
      if (borderWidth > 0) {
        this.enableBorderDashes(ctx);
        //draw the border
        ctx.stroke();
        //disable dashed border for other elements
        this.disableBorderDashes(ctx);
      }
      ctx.restore();

      this.updateBoundingBox(x, y, ctx, selected);
      this.labelModule.draw(ctx, x, y, selected);
    }
  }, {
    key: 'updateBoundingBox',
    value: function updateBoundingBox(x, y, ctx, selected) {
      this.resize(ctx, selected);
      this.left = x - this.width * 0.5;
      this.top = y - this.height * 0.5;

      var borderRadius = this.options.shapeProperties.borderRadius; // only effective for box
      this.boundingBox.left = this.left - borderRadius;
      this.boundingBox.top = this.top - borderRadius;
      this.boundingBox.bottom = this.top + this.height + borderRadius;
      this.boundingBox.right = this.left + this.width + borderRadius;
    }
  }, {
    key: 'distanceToBorder',
    value: function distanceToBorder(ctx, angle) {
      this.resize(ctx);
      var borderWidth = this.options.borderWidth;

      return Math.min(Math.abs(this.width / 2 / Math.cos(angle)), Math.abs(this.height / 2 / Math.sin(angle))) + borderWidth;
    }
  }]);

  return Box;
}(_NodeBase3.default);

exports.default = Box;