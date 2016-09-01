'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Hammer = require('../../module/hammer');
var hammerUtil = require('../../hammerUtil');

var util = require('../../util');

/**
 * Create the main frame for the Network.
 * This function is executed once when a Network object is created. The frame
 * contains a canvas, and this canvas contains all objects like the axis and
 * nodes.
 * @private
 */

var Canvas = function () {
  function Canvas(body) {
    _classCallCheck(this, Canvas);

    this.body = body;
    this.pixelRatio = 1;
    this.resizeTimer = undefined;
    this.resizeFunction = this._onResize.bind(this);
    this.cameraState = {};
    this.initialized = false;

    this.options = {};
    this.defaultOptions = {
      autoResize: true,
      height: '100%',
      width: '100%'
    };
    util.extend(this.options, this.defaultOptions);

    this.bindEventListeners();
  }

  _createClass(Canvas, [{
    key: 'bindEventListeners',
    value: function bindEventListeners() {
      var _this = this;

      // bind the events
      this.body.emitter.once("resize", function (obj) {
        if (obj.width !== 0) {
          _this.body.view.translation.x = obj.width * 0.5;
        }
        if (obj.height !== 0) {
          _this.body.view.translation.y = obj.height * 0.5;
        }
      });
      this.body.emitter.on("setSize", this.setSize.bind(this));
      this.body.emitter.on("destroy", function () {
        _this.hammerFrame.destroy();
        _this.hammer.destroy();
        _this._cleanUp();
      });
    }
  }, {
    key: 'setOptions',
    value: function setOptions(options) {
      var _this2 = this;

      if (options !== undefined) {
        var fields = ['width', 'height', 'autoResize'];
        util.selectiveDeepExtend(fields, this.options, options);
      }

      if (this.options.autoResize === true) {
        // automatically adapt to a changing size of the browser.
        this._cleanUp();
        this.resizeTimer = setInterval(function () {
          var changed = _this2.setSize();
          if (changed === true) {
            _this2.body.emitter.emit("_requestRedraw");
          }
        }, 1000);
        this.resizeFunction = this._onResize.bind(this);
        util.addEventListener(window, 'resize', this.resizeFunction);
      }
    }
  }, {
    key: '_cleanUp',
    value: function _cleanUp() {
      // automatically adapt to a changing size of the browser.
      if (this.resizeTimer !== undefined) {
        clearInterval(this.resizeTimer);
      }
      util.removeEventListener(window, 'resize', this.resizeFunction);
      this.resizeFunction = undefined;
    }
  }, {
    key: '_onResize',
    value: function _onResize() {
      this.setSize();
      this.body.emitter.emit("_redraw");
    }

    /**
     * Get and store the cameraState
     * @private
     */

  }, {
    key: '_getCameraState',
    value: function _getCameraState() {
      var pixelRatio = arguments.length <= 0 || arguments[0] === undefined ? this.pixelRatio : arguments[0];

      if (this.initialized === true) {
        this.cameraState.previousWidth = this.frame.canvas.width / pixelRatio;
        this.cameraState.previousHeight = this.frame.canvas.height / pixelRatio;
        this.cameraState.scale = this.body.view.scale;
        this.cameraState.position = this.DOMtoCanvas({
          x: 0.5 * this.frame.canvas.width / pixelRatio,
          y: 0.5 * this.frame.canvas.height / pixelRatio
        });
      }
    }

    /**
     * Set the cameraState
     * @private
     */

  }, {
    key: '_setCameraState',
    value: function _setCameraState() {
      if (this.cameraState.scale !== undefined && this.frame.canvas.clientWidth !== 0 && this.frame.canvas.clientHeight !== 0 && this.pixelRatio !== 0 && this.cameraState.previousWidth > 0) {

        var widthRatio = this.frame.canvas.width / this.pixelRatio / this.cameraState.previousWidth;
        var heightRatio = this.frame.canvas.height / this.pixelRatio / this.cameraState.previousHeight;
        var newScale = this.cameraState.scale;

        if (widthRatio != 1 && heightRatio != 1) {
          newScale = this.cameraState.scale * 0.5 * (widthRatio + heightRatio);
        } else if (widthRatio != 1) {
          newScale = this.cameraState.scale * widthRatio;
        } else if (heightRatio != 1) {
          newScale = this.cameraState.scale * heightRatio;
        }

        this.body.view.scale = newScale;
        // this comes from the view module.
        var currentViewCenter = this.DOMtoCanvas({
          x: 0.5 * this.frame.canvas.clientWidth,
          y: 0.5 * this.frame.canvas.clientHeight
        });

        var distanceFromCenter = { // offset from view, distance view has to change by these x and y to center the node
          x: currentViewCenter.x - this.cameraState.position.x,
          y: currentViewCenter.y - this.cameraState.position.y
        };
        this.body.view.translation.x += distanceFromCenter.x * this.body.view.scale;
        this.body.view.translation.y += distanceFromCenter.y * this.body.view.scale;
      }
    }
  }, {
    key: '_prepareValue',
    value: function _prepareValue(value) {
      if (typeof value === 'number') {
        return value + 'px';
      } else if (typeof value === 'string') {
        if (value.indexOf('%') !== -1 || value.indexOf('px') !== -1) {
          return value;
        } else if (value.indexOf('%') === -1) {
          return value + 'px';
        }
      }
      throw new Error('Could not use the value supplied for width or height:' + value);
    }

    /**
     * Create the HTML
     */

  }, {
    key: '_create',
    value: function _create() {
      // remove all elements from the container element.
      while (this.body.container.hasChildNodes()) {
        this.body.container.removeChild(this.body.container.firstChild);
      }

      this.frame = document.createElement('div');
      this.frame.className = 'vis-network';
      this.frame.style.position = 'relative';
      this.frame.style.overflow = 'hidden';
      this.frame.tabIndex = 900; // tab index is required for keycharm to bind keystrokes to the div instead of the window

      //////////////////////////////////////////////////////////////////

      this.frame.canvas = document.createElement("canvas");
      this.frame.canvas.style.position = 'relative';
      this.frame.appendChild(this.frame.canvas);

      if (!this.frame.canvas.getContext) {
        var noCanvas = document.createElement('DIV');
        noCanvas.style.color = 'red';
        noCanvas.style.fontWeight = 'bold';
        noCanvas.style.padding = '10px';
        noCanvas.innerHTML = 'Error: your browser does not support HTML canvas';
        this.frame.canvas.appendChild(noCanvas);
      } else {
        var ctx = this.frame.canvas.getContext("2d");
        this.pixelRatio = (window.devicePixelRatio || 1) / (ctx.webkitBackingStorePixelRatio || ctx.mozBackingStorePixelRatio || ctx.msBackingStorePixelRatio || ctx.oBackingStorePixelRatio || ctx.backingStorePixelRatio || 1);

        this.frame.canvas.getContext("2d").setTransform(this.pixelRatio, 0, 0, this.pixelRatio, 0, 0);
      }

      // add the frame to the container element
      this.body.container.appendChild(this.frame);

      this.body.view.scale = 1;
      this.body.view.translation = { x: 0.5 * this.frame.canvas.clientWidth, y: 0.5 * this.frame.canvas.clientHeight };

      this._bindHammer();
    }

    /**
     * This function binds hammer, it can be repeated over and over due to the uniqueness check.
     * @private
     */

  }, {
    key: '_bindHammer',
    value: function _bindHammer() {
      var _this3 = this;

      if (this.hammer !== undefined) {
        this.hammer.destroy();
      }
      this.drag = {};
      this.pinch = {};

      // init hammer
      this.hammer = new Hammer(this.frame.canvas);
      this.hammer.get('pinch').set({ enable: true });
      // enable to get better response, todo: test on mobile.
      this.hammer.get('pan').set({ threshold: 5, direction: Hammer.DIRECTION_ALL });

      hammerUtil.onTouch(this.hammer, function (event) {
        _this3.body.eventListeners.onTouch(event);
      });
      this.hammer.on('tap', function (event) {
        _this3.body.eventListeners.onTap(event);
      });
      this.hammer.on('doubletap', function (event) {
        _this3.body.eventListeners.onDoubleTap(event);
      });
      this.hammer.on('press', function (event) {
        _this3.body.eventListeners.onHold(event);
      });
      this.hammer.on('panstart', function (event) {
        _this3.body.eventListeners.onDragStart(event);
      });
      this.hammer.on('panmove', function (event) {
        _this3.body.eventListeners.onDrag(event);
      });
      this.hammer.on('panend', function (event) {
        _this3.body.eventListeners.onDragEnd(event);
      });
      this.hammer.on('pinch', function (event) {
        _this3.body.eventListeners.onPinch(event);
      });

      // TODO: neatly cleanup these handlers when re-creating the Canvas, IF these are done with hammer, event.stopPropagation will not work?
      this.frame.canvas.addEventListener('mousewheel', function (event) {
        _this3.body.eventListeners.onMouseWheel(event);
      });
      this.frame.canvas.addEventListener('DOMMouseScroll', function (event) {
        _this3.body.eventListeners.onMouseWheel(event);
      });

      this.frame.canvas.addEventListener('mousemove', function (event) {
        _this3.body.eventListeners.onMouseMove(event);
      });
      this.frame.canvas.addEventListener('contextmenu', function (event) {
        _this3.body.eventListeners.onContext(event);
      });

      this.hammerFrame = new Hammer(this.frame);
      hammerUtil.onRelease(this.hammerFrame, function (event) {
        _this3.body.eventListeners.onRelease(event);
      });
    }

    /**
     * Set a new size for the network
     * @param {string} width   Width in pixels or percentage (for example '800px'
     *                         or '50%')
     * @param {string} height  Height in pixels or percentage  (for example '400px'
     *                         or '30%')
     */

  }, {
    key: 'setSize',
    value: function setSize() {
      var width = arguments.length <= 0 || arguments[0] === undefined ? this.options.width : arguments[0];
      var height = arguments.length <= 1 || arguments[1] === undefined ? this.options.height : arguments[1];

      width = this._prepareValue(width);
      height = this._prepareValue(height);

      var emitEvent = false;
      var oldWidth = this.frame.canvas.width;
      var oldHeight = this.frame.canvas.height;

      // update the pixel ratio
      var ctx = this.frame.canvas.getContext("2d");
      var previousRatio = this.pixelRatio; // we cache this because the camera state storage needs the old value
      this.pixelRatio = (window.devicePixelRatio || 1) / (ctx.webkitBackingStorePixelRatio || ctx.mozBackingStorePixelRatio || ctx.msBackingStorePixelRatio || ctx.oBackingStorePixelRatio || ctx.backingStorePixelRatio || 1);

      if (width != this.options.width || height != this.options.height || this.frame.style.width != width || this.frame.style.height != height) {
        this._getCameraState(previousRatio);

        this.frame.style.width = width;
        this.frame.style.height = height;

        this.frame.canvas.style.width = '100%';
        this.frame.canvas.style.height = '100%';

        this.frame.canvas.width = Math.round(this.frame.canvas.clientWidth * this.pixelRatio);
        this.frame.canvas.height = Math.round(this.frame.canvas.clientHeight * this.pixelRatio);

        this.options.width = width;
        this.options.height = height;

        emitEvent = true;
      } else {
        // this would adapt the width of the canvas to the width from 100% if and only if
        // there is a change.

        // store the camera if there is a change in size.
        if (this.frame.canvas.width != Math.round(this.frame.canvas.clientWidth * this.pixelRatio) || this.frame.canvas.height != Math.round(this.frame.canvas.clientHeight * this.pixelRatio)) {
          this._getCameraState(previousRatio);
        }

        if (this.frame.canvas.width != Math.round(this.frame.canvas.clientWidth * this.pixelRatio)) {
          this.frame.canvas.width = Math.round(this.frame.canvas.clientWidth * this.pixelRatio);
          emitEvent = true;
        }
        if (this.frame.canvas.height != Math.round(this.frame.canvas.clientHeight * this.pixelRatio)) {
          this.frame.canvas.height = Math.round(this.frame.canvas.clientHeight * this.pixelRatio);
          emitEvent = true;
        }
      }

      if (emitEvent === true) {
        this.body.emitter.emit('resize', {
          width: Math.round(this.frame.canvas.width / this.pixelRatio),
          height: Math.round(this.frame.canvas.height / this.pixelRatio),
          oldWidth: Math.round(oldWidth / this.pixelRatio),
          oldHeight: Math.round(oldHeight / this.pixelRatio)
        });

        // restore the camera on change.
        this._setCameraState();
      }

      // set initialized so the get and set camera will work from now on.
      this.initialized = true;
      return emitEvent;
    }
  }, {
    key: '_XconvertDOMtoCanvas',


    /**
     * Convert the X coordinate in DOM-space (coordinate point in browser relative to the container div) to
     * the X coordinate in canvas-space (the simulation sandbox, which the camera looks upon)
     * @param {number} x
     * @returns {number}
     * @private
     */
    value: function _XconvertDOMtoCanvas(x) {
      return (x - this.body.view.translation.x) / this.body.view.scale;
    }

    /**
     * Convert the X coordinate in canvas-space (the simulation sandbox, which the camera looks upon) to
     * the X coordinate in DOM-space (coordinate point in browser relative to the container div)
     * @param {number} x
     * @returns {number}
     * @private
     */

  }, {
    key: '_XconvertCanvasToDOM',
    value: function _XconvertCanvasToDOM(x) {
      return x * this.body.view.scale + this.body.view.translation.x;
    }

    /**
     * Convert the Y coordinate in DOM-space (coordinate point in browser relative to the container div) to
     * the Y coordinate in canvas-space (the simulation sandbox, which the camera looks upon)
     * @param {number} y
     * @returns {number}
     * @private
     */

  }, {
    key: '_YconvertDOMtoCanvas',
    value: function _YconvertDOMtoCanvas(y) {
      return (y - this.body.view.translation.y) / this.body.view.scale;
    }

    /**
     * Convert the Y coordinate in canvas-space (the simulation sandbox, which the camera looks upon) to
     * the Y coordinate in DOM-space (coordinate point in browser relative to the container div)
     * @param {number} y
     * @returns {number}
     * @private
     */

  }, {
    key: '_YconvertCanvasToDOM',
    value: function _YconvertCanvasToDOM(y) {
      return y * this.body.view.scale + this.body.view.translation.y;
    }

    /**
     *
     * @param {object} pos   = {x: number, y: number}
     * @returns {{x: number, y: number}}
     * @constructor
     */

  }, {
    key: 'canvasToDOM',
    value: function canvasToDOM(pos) {
      return { x: this._XconvertCanvasToDOM(pos.x), y: this._YconvertCanvasToDOM(pos.y) };
    }

    /**
     *
     * @param {object} pos   = {x: number, y: number}
     * @returns {{x: number, y: number}}
     * @constructor
     */

  }, {
    key: 'DOMtoCanvas',
    value: function DOMtoCanvas(pos) {
      return { x: this._XconvertDOMtoCanvas(pos.x), y: this._YconvertDOMtoCanvas(pos.y) };
    }
  }]);

  return Canvas;
}();

exports.default = Canvas;