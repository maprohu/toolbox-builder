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

var CircleImageBase = function (_NodeBase) {
  _inherits(CircleImageBase, _NodeBase);

  function CircleImageBase(options, body, labelModule) {
    _classCallCheck(this, CircleImageBase);

    var _this = _possibleConstructorReturn(this, (CircleImageBase.__proto__ || Object.getPrototypeOf(CircleImageBase)).call(this, options, body, labelModule));

    _this.labelOffset = 0;
    _this.imageLoaded = false;
    return _this;
  }

  _createClass(CircleImageBase, [{
    key: 'setOptions',
    value: function setOptions(options, imageObj) {
      this.options = options;
      if (imageObj) {
        this.imageObj = imageObj;
      }
    }

    /**
     * This function resizes the image by the options size when the image has not yet loaded. If the image has loaded, we
     * force the update of the size again.
     *
     * @private
     */

  }, {
    key: '_resizeImage',
    value: function _resizeImage() {
      var force = false;
      if (!this.imageObj.width || !this.imageObj.height) {
        // undefined or 0
        this.imageLoaded = false;
      } else if (this.imageLoaded === false) {
        this.imageLoaded = true;
        force = true;
      }

      if (!this.width || !this.height || force === true) {
        // undefined or 0
        var width, height, ratio;
        if (this.imageObj.width && this.imageObj.height) {
          // not undefined or 0
          width = 0;
          height = 0;
        }
        if (this.options.shapeProperties.useImageSize === false) {
          if (this.imageObj.width > this.imageObj.height) {
            ratio = this.imageObj.width / this.imageObj.height;
            width = this.options.size * 2 * ratio || this.imageObj.width;
            height = this.options.size * 2 || this.imageObj.height;
          } else {
            if (this.imageObj.width && this.imageObj.height) {
              // not undefined or 0
              ratio = this.imageObj.height / this.imageObj.width;
            } else {
              ratio = 1;
            }
            width = this.options.size * 2;
            height = this.options.size * 2 * ratio;
          }
        } else {
          // when not using the size property, we use the image size
          width = this.imageObj.width;
          height = this.imageObj.height;
        }
        this.width = width;
        this.height = height;
        this.radius = 0.5 * this.width;
      }
    }
  }, {
    key: '_drawRawCircle',
    value: function _drawRawCircle(ctx, x, y, selected, hover, size) {
      var neutralborderWidth = this.options.borderWidth;
      var selectionLineWidth = this.options.borderWidthSelected || 2 * this.options.borderWidth;
      var borderWidth = (selected ? selectionLineWidth : neutralborderWidth) / this.body.view.scale;
      ctx.lineWidth = Math.min(this.width, borderWidth);

      ctx.strokeStyle = selected ? this.options.color.highlight.border : hover ? this.options.color.hover.border : this.options.color.border;
      ctx.fillStyle = selected ? this.options.color.highlight.background : hover ? this.options.color.hover.background : this.options.color.background;
      ctx.circle(x, y, size);

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
    }
  }, {
    key: '_drawImageAtPosition',
    value: function _drawImageAtPosition(ctx) {
      if (this.imageObj.width != 0) {
        // draw the image
        ctx.globalAlpha = 1.0;

        // draw shadow if enabled
        this.enableShadow(ctx);

        var factor = this.imageObj.width / this.width / this.body.view.scale;
        if (factor > 2 && this.options.shapeProperties.interpolation === true) {
          var w = this.imageObj.width;
          var h = this.imageObj.height;
          var can2 = document.createElement('canvas');
          can2.width = w;
          can2.height = w;
          var ctx2 = can2.getContext('2d');

          factor *= 0.5;
          w *= 0.5;
          h *= 0.5;
          ctx2.drawImage(this.imageObj, 0, 0, w, h);

          var distance = 0;
          var iterations = 1;
          while (factor > 2 && iterations < 4) {
            ctx2.drawImage(can2, distance, 0, w, h, distance + w, 0, w / 2, h / 2);
            distance += w;
            factor *= 0.5;
            w *= 0.5;
            h *= 0.5;
            iterations += 1;
          }
          ctx.drawImage(can2, distance, 0, w, h, this.left, this.top, this.width, this.height);
        } else {
          // draw image
          ctx.drawImage(this.imageObj, this.left, this.top, this.width, this.height);
        }

        // disable shadows for other elements.
        this.disableShadow(ctx);
      }
    }
  }, {
    key: '_drawImageLabel',
    value: function _drawImageLabel(ctx, x, y, selected) {
      var yLabel;
      var offset = 0;

      if (this.height !== undefined) {
        offset = this.height * 0.5;
        var labelDimensions = this.labelModule.getTextSize(ctx);
        if (labelDimensions.lineCount >= 1) {
          offset += labelDimensions.height / 2;
        }
      }

      yLabel = y + offset;

      if (this.options.label) {
        this.labelOffset = offset;
      }
      this.labelModule.draw(ctx, x, yLabel, selected, 'hanging');
    }
  }]);

  return CircleImageBase;
}(_NodeBase3.default);

exports.default = CircleImageBase;