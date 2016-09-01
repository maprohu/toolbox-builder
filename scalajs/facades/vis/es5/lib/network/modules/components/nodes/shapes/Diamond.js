'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _ShapeBase2 = require('../util/ShapeBase');

var _ShapeBase3 = _interopRequireDefault(_ShapeBase2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Diamond = function (_ShapeBase) {
  _inherits(Diamond, _ShapeBase);

  function Diamond(options, body, labelModule) {
    _classCallCheck(this, Diamond);

    return _possibleConstructorReturn(this, (Diamond.__proto__ || Object.getPrototypeOf(Diamond)).call(this, options, body, labelModule));
  }

  _createClass(Diamond, [{
    key: 'resize',
    value: function resize(ctx) {
      this._resizeShape();
    }
  }, {
    key: 'draw',
    value: function draw(ctx, x, y, selected, hover) {
      this._drawShape(ctx, 'diamond', 4, x, y, selected, hover);
    }
  }, {
    key: 'distanceToBorder',
    value: function distanceToBorder(ctx, angle) {
      return this._distanceToBorder(ctx, angle);
    }
  }]);

  return Diamond;
}(_ShapeBase3.default);

exports.default = Diamond;