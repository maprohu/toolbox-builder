"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var NodeBase = function () {
  function NodeBase(options, body, labelModule) {
    _classCallCheck(this, NodeBase);

    this.body = body;
    this.labelModule = labelModule;
    this.setOptions(options);
    this.top = undefined;
    this.left = undefined;
    this.height = undefined;
    this.width = undefined;
    this.radius = undefined;
    this.boundingBox = { top: 0, left: 0, right: 0, bottom: 0 };
  }

  _createClass(NodeBase, [{
    key: "setOptions",
    value: function setOptions(options) {
      this.options = options;
    }
  }, {
    key: "_distanceToBorder",
    value: function _distanceToBorder(ctx, angle) {
      var borderWidth = this.options.borderWidth;
      this.resize(ctx);
      return Math.min(Math.abs(this.width / 2 / Math.cos(angle)), Math.abs(this.height / 2 / Math.sin(angle))) + borderWidth;
    }
  }, {
    key: "enableShadow",
    value: function enableShadow(ctx) {
      if (this.options.shadow.enabled === true) {
        ctx.shadowColor = this.options.shadow.color;
        ctx.shadowBlur = this.options.shadow.size;
        ctx.shadowOffsetX = this.options.shadow.x;
        ctx.shadowOffsetY = this.options.shadow.y;
      }
    }
  }, {
    key: "disableShadow",
    value: function disableShadow(ctx) {
      if (this.options.shadow.enabled === true) {
        ctx.shadowColor = 'rgba(0,0,0,0)';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
      }
    }
  }, {
    key: "enableBorderDashes",
    value: function enableBorderDashes(ctx) {
      if (this.options.shapeProperties.borderDashes !== false) {
        if (ctx.setLineDash !== undefined) {
          var dashes = this.options.shapeProperties.borderDashes;
          if (dashes === true) {
            dashes = [5, 15];
          }
          ctx.setLineDash(dashes);
        } else {
          console.warn("setLineDash is not supported in this browser. The dashed borders cannot be used.");
          this.options.shapeProperties.borderDashes = false;
        }
      }
    }
  }, {
    key: "disableBorderDashes",
    value: function disableBorderDashes(ctx) {
      if (this.options.shapeProperties.borderDashes !== false) {
        if (ctx.setLineDash !== undefined) {
          ctx.setLineDash([0]);
        } else {
          console.warn("setLineDash is not supported in this browser. The dashed borders cannot be used.");
          this.options.shapeProperties.borderDashes = false;
        }
      }
    }
  }]);

  return NodeBase;
}();

exports.default = NodeBase;