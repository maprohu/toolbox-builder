'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _CircleImageBase2 = require('../util/CircleImageBase');

var _CircleImageBase3 = _interopRequireDefault(_CircleImageBase2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Image = function (_CircleImageBase) {
  _inherits(Image, _CircleImageBase);

  function Image(options, body, labelModule, imageObj) {
    _classCallCheck(this, Image);

    var _this = _possibleConstructorReturn(this, (Image.__proto__ || Object.getPrototypeOf(Image)).call(this, options, body, labelModule));

    _this.imageObj = imageObj;
    return _this;
  }

  _createClass(Image, [{
    key: 'resize',
    value: function resize() {
      this._resizeImage();
    }
  }, {
    key: 'draw',
    value: function draw(ctx, x, y, selected, hover) {
      this.resize();
      this.left = x - this.width / 2;
      this.top = y - this.height / 2;

      if (this.options.shapeProperties.useBorderWithImage === true) {
        var neutralborderWidth = this.options.borderWidth;
        var selectionLineWidth = this.options.borderWidthSelected || 2 * this.options.borderWidth;
        var borderWidth = (selected ? selectionLineWidth : neutralborderWidth) / this.body.view.scale;
        ctx.lineWidth = Math.min(this.width, borderWidth);

        ctx.beginPath();

        // setup the line properties.
        ctx.strokeStyle = selected ? this.options.color.highlight.border : hover ? this.options.color.hover.border : this.options.color.border;

        // set a fillstyle
        ctx.fillStyle = selected ? this.options.color.highlight.background : hover ? this.options.color.hover.background : this.options.color.background;

        // draw a rectangle to form the border around. This rectangle is filled so the opacity of a picture (in future vis releases?) can be used to tint the image
        ctx.rect(this.left - 0.5 * ctx.lineWidth, this.top - 0.5 * ctx.lineWidth, this.width + ctx.lineWidth, this.height + ctx.lineWidth);
        ctx.fill();

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

        ctx.closePath();
      }

      this._drawImageAtPosition(ctx);

      this._drawImageLabel(ctx, x, y, selected || hover);

      this.updateBoundingBox(x, y);
    }
  }, {
    key: 'updateBoundingBox',
    value: function updateBoundingBox(x, y) {
      this.resize();
      this.left = x - this.width / 2;
      this.top = y - this.height / 2;

      this.boundingBox.top = this.top;
      this.boundingBox.left = this.left;
      this.boundingBox.right = this.left + this.width;
      this.boundingBox.bottom = this.top + this.height;

      if (this.options.label !== undefined && this.labelModule.size.width > 0) {
        this.boundingBox.left = Math.min(this.boundingBox.left, this.labelModule.size.left);
        this.boundingBox.right = Math.max(this.boundingBox.right, this.labelModule.size.left + this.labelModule.size.width);
        this.boundingBox.bottom = Math.max(this.boundingBox.bottom, this.boundingBox.bottom + this.labelOffset);
      }
    }
  }, {
    key: 'distanceToBorder',
    value: function distanceToBorder(ctx, angle) {
      return this._distanceToBorder(ctx, angle);
    }
  }]);

  return Image;
}(_CircleImageBase3.default);

exports.default = Image;