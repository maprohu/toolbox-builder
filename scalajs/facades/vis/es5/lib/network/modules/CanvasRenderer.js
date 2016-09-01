'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

if (typeof window !== 'undefined') {
  window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
}

var util = require('../../util');

var CanvasRenderer = function () {
  function CanvasRenderer(body, canvas) {
    _classCallCheck(this, CanvasRenderer);

    this.body = body;
    this.canvas = canvas;

    this.redrawRequested = false;
    this.renderTimer = undefined;
    this.requiresTimeout = true;
    this.renderingActive = false;
    this.renderRequests = 0;
    this.pixelRatio = undefined;
    this.allowRedraw = true;

    this.dragging = false;
    this.options = {};
    this.defaultOptions = {
      hideEdgesOnDrag: false,
      hideNodesOnDrag: false
    };
    util.extend(this.options, this.defaultOptions);

    this._determineBrowserMethod();
    this.bindEventListeners();
  }

  _createClass(CanvasRenderer, [{
    key: 'bindEventListeners',
    value: function bindEventListeners() {
      var _this = this;

      this.body.emitter.on("dragStart", function () {
        _this.dragging = true;
      });
      this.body.emitter.on("dragEnd", function () {
        return _this.dragging = false;
      });
      this.body.emitter.on("_resizeNodes", function () {
        return _this._resizeNodes();
      });
      this.body.emitter.on("_redraw", function () {
        if (_this.renderingActive === false) {
          _this._redraw();
        }
      });
      this.body.emitter.on("_blockRedraw", function () {
        _this.allowRedraw = false;
      });
      this.body.emitter.on("_allowRedraw", function () {
        _this.allowRedraw = true;_this.redrawRequested = false;
      });
      this.body.emitter.on("_requestRedraw", this._requestRedraw.bind(this));
      this.body.emitter.on("_startRendering", function () {
        _this.renderRequests += 1;
        _this.renderingActive = true;
        _this._startRendering();
      });
      this.body.emitter.on("_stopRendering", function () {
        _this.renderRequests -= 1;
        _this.renderingActive = _this.renderRequests > 0;
        _this.renderTimer = undefined;
      });
      this.body.emitter.on('destroy', function () {
        _this.renderRequests = 0;
        _this.allowRedraw = false;
        _this.renderingActive = false;
        if (_this.requiresTimeout === true) {
          clearTimeout(_this.renderTimer);
        } else {
          cancelAnimationFrame(_this.renderTimer);
        }
        _this.body.emitter.off();
      });
    }
  }, {
    key: 'setOptions',
    value: function setOptions(options) {
      if (options !== undefined) {
        var fields = ['hideEdgesOnDrag', 'hideNodesOnDrag'];
        util.selectiveDeepExtend(fields, this.options, options);
      }
    }
  }, {
    key: '_startRendering',
    value: function _startRendering() {
      if (this.renderingActive === true) {
        if (this.renderTimer === undefined) {
          if (this.requiresTimeout === true) {
            this.renderTimer = window.setTimeout(this._renderStep.bind(this), this.simulationInterval); // wait this.renderTimeStep milliseconds and perform the animation step function
          } else {
            this.renderTimer = window.requestAnimationFrame(this._renderStep.bind(this)); // wait this.renderTimeStep milliseconds and perform the animation step function
          }
        }
      }
    }
  }, {
    key: '_renderStep',
    value: function _renderStep() {
      if (this.renderingActive === true) {
        // reset the renderTimer so a new scheduled animation step can be set
        this.renderTimer = undefined;

        if (this.requiresTimeout === true) {
          // this schedules a new simulation step
          this._startRendering();
        }

        this._redraw();

        if (this.requiresTimeout === false) {
          // this schedules a new simulation step
          this._startRendering();
        }
      }
    }

    /**
     * Redraw the network with the current data
     * chart will be resized too.
     */

  }, {
    key: 'redraw',
    value: function redraw() {
      this.body.emitter.emit('setSize');
      this._redraw();
    }

    /**
     * Redraw the network with the current data
     * @param hidden | used to get the first estimate of the node sizes. only the nodes are drawn after which they are quickly drawn over.
     * @private
     */

  }, {
    key: '_requestRedraw',
    value: function _requestRedraw() {
      var _this2 = this;

      if (this.redrawRequested !== true && this.renderingActive === false && this.allowRedraw === true) {
        this.redrawRequested = true;
        if (this.requiresTimeout === true) {
          window.setTimeout(function () {
            _this2._redraw(false);
          }, 0);
        } else {
          window.requestAnimationFrame(function () {
            _this2._redraw(false);
          });
        }
      }
    }
  }, {
    key: '_redraw',
    value: function _redraw() {
      var hidden = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

      if (this.allowRedraw === true) {
        this.body.emitter.emit("initRedraw");

        this.redrawRequested = false;
        var ctx = this.canvas.frame.canvas.getContext('2d');

        // when the container div was hidden, this fixes it back up!
        if (this.canvas.frame.canvas.width === 0 || this.canvas.frame.canvas.height === 0) {
          this.canvas.setSize();
        }

        this.pixelRatio = (window.devicePixelRatio || 1) / (ctx.webkitBackingStorePixelRatio || ctx.mozBackingStorePixelRatio || ctx.msBackingStorePixelRatio || ctx.oBackingStorePixelRatio || ctx.backingStorePixelRatio || 1);

        ctx.setTransform(this.pixelRatio, 0, 0, this.pixelRatio, 0, 0);

        // clear the canvas
        var w = this.canvas.frame.canvas.clientWidth;
        var h = this.canvas.frame.canvas.clientHeight;
        ctx.clearRect(0, 0, w, h);

        // if the div is hidden, we stop the redraw here for performance.
        if (this.canvas.frame.clientWidth === 0) {
          return;
        }

        // set scaling and translation
        ctx.save();
        ctx.translate(this.body.view.translation.x, this.body.view.translation.y);
        ctx.scale(this.body.view.scale, this.body.view.scale);

        ctx.beginPath();
        this.body.emitter.emit("beforeDrawing", ctx);
        ctx.closePath();

        if (hidden === false) {
          if (this.dragging === false || this.dragging === true && this.options.hideEdgesOnDrag === false) {
            this._drawEdges(ctx);
          }
        }

        if (this.dragging === false || this.dragging === true && this.options.hideNodesOnDrag === false) {
          this._drawNodes(ctx, hidden);
        }

        ctx.beginPath();
        this.body.emitter.emit("afterDrawing", ctx);
        ctx.closePath();

        // restore original scaling and translation
        ctx.restore();
        if (hidden === true) {
          ctx.clearRect(0, 0, w, h);
        }
      }
    }

    /**
     * Redraw all nodes
     * The 2d context of a HTML canvas can be retrieved by canvas.getContext('2d');
     * @param {CanvasRenderingContext2D}   ctx
     * @param {Boolean} [alwaysShow]
     * @private
     */

  }, {
    key: '_resizeNodes',
    value: function _resizeNodes() {
      var ctx = this.canvas.frame.canvas.getContext('2d');
      if (this.pixelRatio === undefined) {
        this.pixelRatio = (window.devicePixelRatio || 1) / (ctx.webkitBackingStorePixelRatio || ctx.mozBackingStorePixelRatio || ctx.msBackingStorePixelRatio || ctx.oBackingStorePixelRatio || ctx.backingStorePixelRatio || 1);
      }
      ctx.setTransform(this.pixelRatio, 0, 0, this.pixelRatio, 0, 0);
      ctx.save();
      ctx.translate(this.body.view.translation.x, this.body.view.translation.y);
      ctx.scale(this.body.view.scale, this.body.view.scale);

      var nodes = this.body.nodes;
      var node = void 0;

      // resize all nodes
      for (var nodeId in nodes) {
        if (nodes.hasOwnProperty(nodeId)) {
          node = nodes[nodeId];
          node.resize(ctx);
          node.updateBoundingBox(ctx, node.selected);
        }
      }

      // restore original scaling and translation
      ctx.restore();
    }

    /**
     * Redraw all nodes
     * The 2d context of a HTML canvas can be retrieved by canvas.getContext('2d');
     * @param {CanvasRenderingContext2D}   ctx
     * @param {Boolean} [alwaysShow]
     * @private
     */

  }, {
    key: '_drawNodes',
    value: function _drawNodes(ctx) {
      var alwaysShow = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

      var nodes = this.body.nodes;
      var nodeIndices = this.body.nodeIndices;
      var node = void 0;
      var selected = [];
      var margin = 20;
      var topLeft = this.canvas.DOMtoCanvas({ x: -margin, y: -margin });
      var bottomRight = this.canvas.DOMtoCanvas({
        x: this.canvas.frame.canvas.clientWidth + margin,
        y: this.canvas.frame.canvas.clientHeight + margin
      });
      var viewableArea = { top: topLeft.y, left: topLeft.x, bottom: bottomRight.y, right: bottomRight.x };

      // draw unselected nodes;
      for (var i = 0; i < nodeIndices.length; i++) {
        node = nodes[nodeIndices[i]];
        // set selected nodes aside
        if (node.isSelected()) {
          selected.push(nodeIndices[i]);
        } else {
          if (alwaysShow === true) {
            node.draw(ctx);
          } else if (node.isBoundingBoxOverlappingWith(viewableArea) === true) {
            node.draw(ctx);
          } else {
            node.updateBoundingBox(ctx, node.selected);
          }
        }
      }

      // draw the selected nodes on top
      for (var _i = 0; _i < selected.length; _i++) {
        node = nodes[selected[_i]];
        node.draw(ctx);
      }
    }

    /**
     * Redraw all edges
     * The 2d context of a HTML canvas can be retrieved by canvas.getContext('2d');
     * @param {CanvasRenderingContext2D}   ctx
     * @private
     */

  }, {
    key: '_drawEdges',
    value: function _drawEdges(ctx) {
      var edges = this.body.edges;
      var edgeIndices = this.body.edgeIndices;
      var edge = void 0;

      for (var i = 0; i < edgeIndices.length; i++) {
        edge = edges[edgeIndices[i]];
        if (edge.connected === true) {
          edge.draw(ctx);
        }
      }
    }

    /**
     * Determine if the browser requires a setTimeout or a requestAnimationFrame. This was required because
     * some implementations (safari and IE9) did not support requestAnimationFrame
     * @private
     */

  }, {
    key: '_determineBrowserMethod',
    value: function _determineBrowserMethod() {
      if (typeof window !== 'undefined') {
        var browserType = navigator.userAgent.toLowerCase();
        this.requiresTimeout = false;
        if (browserType.indexOf('msie 9.0') != -1) {
          // IE 9
          this.requiresTimeout = true;
        } else if (browserType.indexOf('safari') != -1) {
          // safari
          if (browserType.indexOf('chrome') <= -1) {
            this.requiresTimeout = true;
          }
        }
      } else {
        this.requiresTimeout = true;
      }
    }
  }]);

  return CanvasRenderer;
}();

exports.default = CanvasRenderer;