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

var CircularImage = function (_CircleImageBase) {
  _inherits(CircularImage, _CircleImageBase);

  function CircularImage(options, body, labelModule, imageObj) {
    _classCallCheck(this, CircularImage);

    var _this = _possibleConstructorReturn(this, (CircularImage.__proto__ || Object.getPrototypeOf(CircularImage)).call(this, options, body, labelModule));

    _this.imageObj = imageObj;
    _this._swapToImageResizeWhenImageLoaded = true;
    return _this;
  }

  _createClass(CircularImage, [{
    key: 'resize',
    value: function resize() {
      if (this.imageObj.src === undefined || this.imageObj.width === undefined || this.imageObj.height === undefined) {
        if (!this.width) {
          var diameter = this.options.size * 2;
          this.width = diameter;
          this.height = diameter;
          this._swapToImageResizeWhenImageLoaded = true;
          this.radius = 0.5 * this.width;
        }
      } else {
        if (this._swapToImageResizeWhenImageLoaded) {
          this.width = undefined;
          this.height = undefined;
          this._swapToImageResizeWhenImageLoaded = false;
        }
        this._resizeImage();
      }
    }
  }, {
    key: 'draw',
    value: function draw(ctx, x, y, selected, hover) {
      this.resize();

      this.left = x - this.width / 2;
      this.top = y - this.height / 2;

      var size = Math.min(0.5 * this.height, 0.5 * this.width);

      // draw the background circle. IMPORTANT: the stroke in this method is used by the clip method below.
      this._drawRawCircle(ctx, x, y, selected, hover, size);

      // now we draw in the circle, we save so we can revert the clip operation after drawing.
      ctx.save();
      // clip is used to use the stroke in drawRawCircle as an area that we can draw in.
      ctx.clip();
      // draw the image
      this._drawImageAtPosition(ctx);
      // restore so we can again draw on the full canvas
      ctx.restore();

      this._drawImageLabel(ctx, x, y, selected);

      this.updateBoundingBox(x, y);
    }
  }, {
    key: 'updateBoundingBox',
    value: function updateBoundingBox(x, y) {
      this.boundingBox.top = y - this.options.size;
      this.boundingBox.left = x - this.options.size;
      this.boundingBox.right = x + this.options.size;
      this.boundingBox.bottom = y + this.options.size;
      this.boundingBox.left = Math.min(this.boundingBox.left, this.labelModule.size.left);
      this.boundingBox.right = Math.max(this.boundingBox.right, this.labelModule.size.left + this.labelModule.size.width);
      this.boundingBox.bottom = Math.max(this.boundingBox.bottom, this.boundingBox.bottom + this.labelOffset);
    }
  }, {
    key: 'distanceToBorder',
    value: function distanceToBorder(ctx, angle) {
      this.resize(ctx);
      return this.width * 0.5;
    }
  }]);

  return CircularImage;
}(_CircleImageBase3.default);

exports.default = CircularImage;