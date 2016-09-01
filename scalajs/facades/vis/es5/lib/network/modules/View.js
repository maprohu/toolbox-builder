'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _NetworkUtil = require('../NetworkUtil');

var _NetworkUtil2 = _interopRequireDefault(_NetworkUtil);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var util = require('../../util');

var View = function () {
  function View(body, canvas) {
    var _this = this;

    _classCallCheck(this, View);

    this.body = body;
    this.canvas = canvas;

    this.animationSpeed = 1 / this.renderRefreshRate;
    this.animationEasingFunction = "easeInOutQuint";
    this.easingTime = 0;
    this.sourceScale = 0;
    this.targetScale = 0;
    this.sourceTranslation = 0;
    this.targetTranslation = 0;
    this.lockedOnNodeId = undefined;
    this.lockedOnNodeOffset = undefined;
    this.touchTime = 0;

    this.viewFunction = undefined;

    this.body.emitter.on("fit", this.fit.bind(this));
    this.body.emitter.on("animationFinished", function () {
      _this.body.emitter.emit("_stopRendering");
    });
    this.body.emitter.on("unlockNode", this.releaseNode.bind(this));
  }

  _createClass(View, [{
    key: 'setOptions',
    value: function setOptions() {
      var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      this.options = options;
    }

    /**
     * This function zooms out to fit all data on screen based on amount of nodes
     * @param {Object} Options
     * @param {Boolean} [initialZoom]  | zoom based on fitted formula or range, true = fitted, default = false;
     */

  }, {
    key: 'fit',
    value: function fit() {
      var options = arguments.length <= 0 || arguments[0] === undefined ? { nodes: [] } : arguments[0];
      var initialZoom = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

      var range = void 0;
      var zoomLevel = void 0;
      if (options.nodes === undefined || options.nodes.length === 0) {
        options.nodes = this.body.nodeIndices;
      }

      if (initialZoom === true) {
        // check if more than half of the nodes have a predefined position. If so, we use the range, not the approximation.
        var positionDefined = 0;
        for (var nodeId in this.body.nodes) {
          if (this.body.nodes.hasOwnProperty(nodeId)) {
            var node = this.body.nodes[nodeId];
            if (node.predefinedPosition === true) {
              positionDefined += 1;
            }
          }
        }
        if (positionDefined > 0.5 * this.body.nodeIndices.length) {
          this.fit(options, false);
          return;
        }

        range = _NetworkUtil2.default.getRange(this.body.nodes, options.nodes);

        var numberOfNodes = this.body.nodeIndices.length;
        zoomLevel = 12.662 / (numberOfNodes + 7.4147) + 0.0964822; // this is obtained from fitting a dataset from 5 points with scale levels that looked good.

        // correct for larger canvasses.
        var factor = Math.min(this.canvas.frame.canvas.clientWidth / 600, this.canvas.frame.canvas.clientHeight / 600);
        zoomLevel *= factor;
      } else {
        this.body.emitter.emit("_resizeNodes");
        range = _NetworkUtil2.default.getRange(this.body.nodes, options.nodes);

        var xDistance = Math.abs(range.maxX - range.minX) * 1.1;
        var yDistance = Math.abs(range.maxY - range.minY) * 1.1;

        var xZoomLevel = this.canvas.frame.canvas.clientWidth / xDistance;
        var yZoomLevel = this.canvas.frame.canvas.clientHeight / yDistance;

        zoomLevel = xZoomLevel <= yZoomLevel ? xZoomLevel : yZoomLevel;
      }

      if (zoomLevel > 1.0) {
        zoomLevel = 1.0;
      } else if (zoomLevel === 0) {
        zoomLevel = 1.0;
      }

      var center = _NetworkUtil2.default.findCenter(range);
      var animationOptions = { position: center, scale: zoomLevel, animation: options.animation };
      this.moveTo(animationOptions);
    }

    // animation

    /**
     * Center a node in view.
     *
     * @param {Number} nodeId
     * @param {Number} [options]
     */

  }, {
    key: 'focus',
    value: function focus(nodeId) {
      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      if (this.body.nodes[nodeId] !== undefined) {
        var nodePosition = { x: this.body.nodes[nodeId].x, y: this.body.nodes[nodeId].y };
        options.position = nodePosition;
        options.lockedOnNode = nodeId;

        this.moveTo(options);
      } else {
        console.log("Node: " + nodeId + " cannot be found.");
      }
    }

    /**
     *
     * @param {Object} options  |  options.offset   = {x:Number, y:Number}   // offset from the center in DOM pixels
     *                          |  options.scale    = Number                 // scale to move to
     *                          |  options.position = {x:Number, y:Number}   // position to move to
     *                          |  options.animation = {duration:Number, easingFunction:String} || Boolean   // position to move to
     */

  }, {
    key: 'moveTo',
    value: function moveTo(options) {
      if (options === undefined) {
        options = {};
        return;
      }
      if (options.offset === undefined) {
        options.offset = { x: 0, y: 0 };
      }
      if (options.offset.x === undefined) {
        options.offset.x = 0;
      }
      if (options.offset.y === undefined) {
        options.offset.y = 0;
      }
      if (options.scale === undefined) {
        options.scale = this.body.view.scale;
      }
      if (options.position === undefined) {
        options.position = this.getViewPosition();
      }
      if (options.animation === undefined) {
        options.animation = { duration: 0 };
      }
      if (options.animation === false) {
        options.animation = { duration: 0 };
      }
      if (options.animation === true) {
        options.animation = {};
      }
      if (options.animation.duration === undefined) {
        options.animation.duration = 1000;
      } // default duration
      if (options.animation.easingFunction === undefined) {
        options.animation.easingFunction = "easeInOutQuad";
      } // default easing function

      this.animateView(options);
    }

    /**
     *
     * @param {Object} options  |  options.offset   = {x:Number, y:Number}   // offset from the center in DOM pixels
     *                          |  options.time     = Number                 // animation time in milliseconds
     *                          |  options.scale    = Number                 // scale to animate to
     *                          |  options.position = {x:Number, y:Number}   // position to animate to
     *                          |  options.easingFunction = String           // linear, easeInQuad, easeOutQuad, easeInOutQuad,
     *                                                                       // easeInCubic, easeOutCubic, easeInOutCubic,
     *                                                                       // easeInQuart, easeOutQuart, easeInOutQuart,
     *                                                                       // easeInQuint, easeOutQuint, easeInOutQuint
     */

  }, {
    key: 'animateView',
    value: function animateView(options) {
      if (options === undefined) {
        return;
      }
      this.animationEasingFunction = options.animation.easingFunction;
      // release if something focussed on the node
      this.releaseNode();
      if (options.locked === true) {
        this.lockedOnNodeId = options.lockedOnNode;
        this.lockedOnNodeOffset = options.offset;
      }

      // forcefully complete the old animation if it was still running
      if (this.easingTime != 0) {
        this._transitionRedraw(true); // by setting easingtime to 1, we finish the animation.
      }

      this.sourceScale = this.body.view.scale;
      this.sourceTranslation = this.body.view.translation;
      this.targetScale = options.scale;

      // set the scale so the viewCenter is based on the correct zoom level. This is overridden in the transitionRedraw
      // but at least then we'll have the target transition
      this.body.view.scale = this.targetScale;
      var viewCenter = this.canvas.DOMtoCanvas({ x: 0.5 * this.canvas.frame.canvas.clientWidth, y: 0.5 * this.canvas.frame.canvas.clientHeight });

      var distanceFromCenter = { // offset from view, distance view has to change by these x and y to center the node
        x: viewCenter.x - options.position.x,
        y: viewCenter.y - options.position.y
      };
      this.targetTranslation = {
        x: this.sourceTranslation.x + distanceFromCenter.x * this.targetScale + options.offset.x,
        y: this.sourceTranslation.y + distanceFromCenter.y * this.targetScale + options.offset.y
      };

      // if the time is set to 0, don't do an animation
      if (options.animation.duration === 0) {
        if (this.lockedOnNodeId != undefined) {
          this.viewFunction = this._lockedRedraw.bind(this);
          this.body.emitter.on("initRedraw", this.viewFunction);
        } else {
          this.body.view.scale = this.targetScale;
          this.body.view.translation = this.targetTranslation;
          this.body.emitter.emit("_requestRedraw");
        }
      } else {
        this.animationSpeed = 1 / (60 * options.animation.duration * 0.001) || 1 / 60; // 60 for 60 seconds, 0.001 for milli's
        this.animationEasingFunction = options.animation.easingFunction;

        this.viewFunction = this._transitionRedraw.bind(this);
        this.body.emitter.on("initRedraw", this.viewFunction);
        this.body.emitter.emit("_startRendering");
      }
    }

    /**
     * used to animate smoothly by hijacking the redraw function.
     * @private
     */

  }, {
    key: '_lockedRedraw',
    value: function _lockedRedraw() {
      var nodePosition = { x: this.body.nodes[this.lockedOnNodeId].x, y: this.body.nodes[this.lockedOnNodeId].y };
      var viewCenter = this.canvas.DOMtoCanvas({ x: 0.5 * this.canvas.frame.canvas.clientWidth, y: 0.5 * this.canvas.frame.canvas.clientHeight });
      var distanceFromCenter = { // offset from view, distance view has to change by these x and y to center the node
        x: viewCenter.x - nodePosition.x,
        y: viewCenter.y - nodePosition.y
      };
      var sourceTranslation = this.body.view.translation;
      var targetTranslation = {
        x: sourceTranslation.x + distanceFromCenter.x * this.body.view.scale + this.lockedOnNodeOffset.x,
        y: sourceTranslation.y + distanceFromCenter.y * this.body.view.scale + this.lockedOnNodeOffset.y
      };

      this.body.view.translation = targetTranslation;
    }
  }, {
    key: 'releaseNode',
    value: function releaseNode() {
      if (this.lockedOnNodeId !== undefined && this.viewFunction !== undefined) {
        this.body.emitter.off("initRedraw", this.viewFunction);
        this.lockedOnNodeId = undefined;
        this.lockedOnNodeOffset = undefined;
      }
    }

    /**
     *
     * @param easingTime
     * @private
     */

  }, {
    key: '_transitionRedraw',
    value: function _transitionRedraw() {
      var finished = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

      this.easingTime += this.animationSpeed;
      this.easingTime = finished === true ? 1.0 : this.easingTime;

      var progress = util.easingFunctions[this.animationEasingFunction](this.easingTime);

      this.body.view.scale = this.sourceScale + (this.targetScale - this.sourceScale) * progress;
      this.body.view.translation = {
        x: this.sourceTranslation.x + (this.targetTranslation.x - this.sourceTranslation.x) * progress,
        y: this.sourceTranslation.y + (this.targetTranslation.y - this.sourceTranslation.y) * progress
      };

      // cleanup
      if (this.easingTime >= 1.0) {
        this.body.emitter.off("initRedraw", this.viewFunction);
        this.easingTime = 0;
        if (this.lockedOnNodeId != undefined) {
          this.viewFunction = this._lockedRedraw.bind(this);
          this.body.emitter.on("initRedraw", this.viewFunction);
        }
        this.body.emitter.emit("animationFinished");
      }
    }
  }, {
    key: 'getScale',
    value: function getScale() {
      return this.body.view.scale;
    }
  }, {
    key: 'getViewPosition',
    value: function getViewPosition() {
      return this.canvas.DOMtoCanvas({ x: 0.5 * this.canvas.frame.canvas.clientWidth, y: 0.5 * this.canvas.frame.canvas.clientHeight });
    }
  }]);

  return View;
}();

exports.default = View;