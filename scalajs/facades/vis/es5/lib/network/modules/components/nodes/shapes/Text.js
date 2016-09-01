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

var Text = function (_NodeBase) {
  _inherits(Text, _NodeBase);

  function Text(options, body, labelModule) {
    _classCallCheck(this, Text);

    return _possibleConstructorReturn(this, (Text.__proto__ || Object.getPrototypeOf(Text)).call(this, options, body, labelModule));
  }

  _createClass(Text, [{
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
      this.resize(ctx, selected || hover);
      this.left = x - this.width / 2;
      this.top = y - this.height / 2;

      // draw shadow if enabled
      this.enableShadow(ctx);
      this.labelModule.draw(ctx, x, y, selected || hover);

      // disable shadows for other elements.
      this.disableShadow(ctx);

      this.updateBoundingBox(x, y, ctx, selected);
    }
  }, {
    key: 'updateBoundingBox',
    value: function updateBoundingBox(x, y, ctx, selected) {
      this.resize(ctx, selected);

      this.left = x - this.width / 2;
      this.top = y - this.height / 2;

      this.boundingBox.top = this.top;
      this.boundingBox.left = this.left;
      this.boundingBox.right = this.left + this.width;
      this.boundingBox.bottom = this.top + this.height;
    }
  }, {
    key: 'distanceToBorder',
    value: function distanceToBorder(ctx, angle) {
      return this._distanceToBorder(ctx, angle);
    }
  }]);

  return Text;
}(_NodeBase3.default);

exports.default = Text;