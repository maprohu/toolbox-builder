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

var ShapeBase = function (_NodeBase) {
  _inherits(ShapeBase, _NodeBase);

  function ShapeBase(options, body, labelModule) {
    _classCallCheck(this, ShapeBase);

    return _possibleConstructorReturn(this, (ShapeBase.__proto__ || Object.getPrototypeOf(ShapeBase)).call(this, options, body, labelModule));
  }

  _createClass(ShapeBase, [{
    key: '_resizeShape',
    value: function _resizeShape() {
      if (this.width === undefined) {
        var size = 2 * this.options.size;
        this.width = size;
        this.height = size;
        this.radius = 0.5 * this.width;
      }
    }
  }, {
    key: '_drawShape',
    value: function _drawShape(ctx, shape, sizeMultiplier, x, y, selected, hover) {
      this._resizeShape();

      this.left = x - this.width / 2;
      this.top = y - this.height / 2;

      var neutralborderWidth = this.options.borderWidth;
      var selectionLineWidth = this.options.borderWidthSelected || 2 * this.options.borderWidth;
      var borderWidth = (selected ? selectionLineWidth : neutralborderWidth) / this.body.view.scale;
      ctx.lineWidth = Math.min(this.width, borderWidth);

      ctx.strokeStyle = selected ? this.options.color.highlight.border : hover ? this.options.color.hover.border : this.options.color.border;
      ctx.fillStyle = selected ? this.options.color.highlight.background : hover ? this.options.color.hover.background : this.options.color.background;
      ctx[shape](x, y, this.options.size);

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

      if (this.options.label !== undefined) {
        var yLabel = y + 0.5 * this.height + 3; // the + 3 is to offset it a bit below the node.
        this.labelModule.draw(ctx, x, yLabel, selected, 'hanging');
      }

      this.updateBoundingBox(x, y);
    }
  }, {
    key: 'updateBoundingBox',
    value: function updateBoundingBox(x, y) {
      this.boundingBox.top = y - this.options.size;
      this.boundingBox.left = x - this.options.size;
      this.boundingBox.right = x + this.options.size;
      this.boundingBox.bottom = y + this.options.size;

      if (this.options.label !== undefined && this.labelModule.size.width > 0) {
        this.boundingBox.left = Math.min(this.boundingBox.left, this.labelModule.size.left);
        this.boundingBox.right = Math.max(this.boundingBox.right, this.labelModule.size.left + this.labelModule.size.width);
        this.boundingBox.bottom = Math.max(this.boundingBox.bottom, this.boundingBox.bottom + this.labelModule.size.height + 3);
      }
    }
  }]);

  return ShapeBase;
}(_NodeBase3.default);

exports.default = ShapeBase;