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

var Icon = function (_NodeBase) {
  _inherits(Icon, _NodeBase);

  function Icon(options, body, labelModule) {
    _classCallCheck(this, Icon);

    return _possibleConstructorReturn(this, (Icon.__proto__ || Object.getPrototypeOf(Icon)).call(this, options, body, labelModule));
  }

  _createClass(Icon, [{
    key: 'resize',
    value: function resize(ctx) {
      if (this.width === undefined) {
        var margin = 5;
        var iconSize = {
          width: Number(this.options.icon.size),
          height: Number(this.options.icon.size)
        };
        this.width = iconSize.width + 2 * margin;
        this.height = iconSize.height + 2 * margin;
        this.radius = 0.5 * this.width;
      }
    }
  }, {
    key: 'draw',
    value: function draw(ctx, x, y, selected, hover) {
      this.resize(ctx);
      this.options.icon.size = this.options.icon.size || 50;

      this.left = x - this.width * 0.5;
      this.top = y - this.height * 0.5;
      this._icon(ctx, x, y, selected);

      if (this.options.label !== undefined) {
        var iconTextSpacing = 5;
        this.labelModule.draw(ctx, x, y + this.height * 0.5 + iconTextSpacing, selected);
      }

      this.updateBoundingBox(x, y);
    }
  }, {
    key: 'updateBoundingBox',
    value: function updateBoundingBox(x, y) {
      this.boundingBox.top = y - this.options.icon.size * 0.5;
      this.boundingBox.left = x - this.options.icon.size * 0.5;
      this.boundingBox.right = x + this.options.icon.size * 0.5;
      this.boundingBox.bottom = y + this.options.icon.size * 0.5;

      if (this.options.label !== undefined && this.labelModule.size.width > 0) {
        var iconTextSpacing = 5;
        this.boundingBox.left = Math.min(this.boundingBox.left, this.labelModule.size.left);
        this.boundingBox.right = Math.max(this.boundingBox.right, this.labelModule.size.left + this.labelModule.size.width);
        this.boundingBox.bottom = Math.max(this.boundingBox.bottom, this.boundingBox.bottom + this.labelModule.size.height + iconTextSpacing);
      }
    }
  }, {
    key: '_icon',
    value: function _icon(ctx, x, y, selected) {
      var iconSize = Number(this.options.icon.size);

      if (this.options.icon.code !== undefined) {
        ctx.font = (selected ? "bold " : "") + iconSize + "px " + this.options.icon.face;

        // draw icon
        ctx.fillStyle = this.options.icon.color || "black";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // draw shadow if enabled
        this.enableShadow(ctx);
        ctx.fillText(this.options.icon.code, x, y);

        // disable shadows for other elements.
        this.disableShadow(ctx);
      } else {
        console.error('When using the icon shape, you need to define the code in the icon options object. This can be done per node or globally.');
      }
    }
  }, {
    key: 'distanceToBorder',
    value: function distanceToBorder(ctx, angle) {
      return this._distanceToBorder(ctx, angle);
    }
  }]);

  return Icon;
}(_NodeBase3.default);

exports.default = Icon;