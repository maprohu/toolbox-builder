'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var util = require('../../../util');
var Hammer = require('../../../module/hammer');
var hammerUtil = require('../../../hammerUtil');
var keycharm = require('keycharm');

var NavigationHandler = function () {
  function NavigationHandler(body, canvas) {
    var _this = this;

    _classCallCheck(this, NavigationHandler);

    this.body = body;
    this.canvas = canvas;

    this.iconsCreated = false;
    this.navigationHammers = [];
    this.boundFunctions = {};
    this.touchTime = 0;
    this.activated = false;

    this.body.emitter.on("activate", function () {
      _this.activated = true;_this.configureKeyboardBindings();
    });
    this.body.emitter.on("deactivate", function () {
      _this.activated = false;_this.configureKeyboardBindings();
    });
    this.body.emitter.on("destroy", function () {
      if (_this.keycharm !== undefined) {
        _this.keycharm.destroy();
      }
    });

    this.options = {};
  }

  _createClass(NavigationHandler, [{
    key: 'setOptions',
    value: function setOptions(options) {
      if (options !== undefined) {
        this.options = options;
        this.create();
      }
    }
  }, {
    key: 'create',
    value: function create() {
      if (this.options.navigationButtons === true) {
        if (this.iconsCreated === false) {
          this.loadNavigationElements();
        }
      } else if (this.iconsCreated === true) {
        this.cleanNavigation();
      }

      this.configureKeyboardBindings();
    }
  }, {
    key: 'cleanNavigation',
    value: function cleanNavigation() {
      // clean hammer bindings
      if (this.navigationHammers.length != 0) {
        for (var i = 0; i < this.navigationHammers.length; i++) {
          this.navigationHammers[i].destroy();
        }
        this.navigationHammers = [];
      }

      // clean up previous navigation items
      if (this.navigationDOM && this.navigationDOM['wrapper'] && this.navigationDOM['wrapper'].parentNode) {
        this.navigationDOM['wrapper'].parentNode.removeChild(this.navigationDOM['wrapper']);
      }

      this.iconsCreated = false;
    }

    /**
     * Creation of the navigation controls nodes. They are drawn over the rest of the nodes and are not affected by scale and translation
     * they have a triggerFunction which is called on click. If the position of the navigation controls is dependent
     * on this.frame.canvas.clientWidth or this.frame.canvas.clientHeight, we flag horizontalAlignLeft and verticalAlignTop false.
     * This means that the location will be corrected by the _relocateNavigation function on a size change of the canvas.
     *
     * @private
     */

  }, {
    key: 'loadNavigationElements',
    value: function loadNavigationElements() {
      var _this2 = this;

      this.cleanNavigation();

      this.navigationDOM = {};
      var navigationDivs = ['up', 'down', 'left', 'right', 'zoomIn', 'zoomOut', 'zoomExtends'];
      var navigationDivActions = ['_moveUp', '_moveDown', '_moveLeft', '_moveRight', '_zoomIn', '_zoomOut', '_fit'];

      this.navigationDOM['wrapper'] = document.createElement('div');
      this.navigationDOM['wrapper'].className = 'vis-navigation';
      this.canvas.frame.appendChild(this.navigationDOM['wrapper']);

      for (var i = 0; i < navigationDivs.length; i++) {
        this.navigationDOM[navigationDivs[i]] = document.createElement('div');
        this.navigationDOM[navigationDivs[i]].className = 'vis-button vis-' + navigationDivs[i];
        this.navigationDOM['wrapper'].appendChild(this.navigationDOM[navigationDivs[i]]);

        var hammer = new Hammer(this.navigationDOM[navigationDivs[i]]);
        if (navigationDivActions[i] === "_fit") {
          hammerUtil.onTouch(hammer, this._fit.bind(this));
        } else {
          hammerUtil.onTouch(hammer, this.bindToRedraw.bind(this, navigationDivActions[i]));
        }

        this.navigationHammers.push(hammer);
      }

      // use a hammer for the release so we do not require the one used in the rest of the network
      // the one the rest uses can be overloaded by the manipulation system.
      var hammerFrame = new Hammer(this.canvas.frame);
      hammerUtil.onRelease(hammerFrame, function () {
        _this2._stopMovement();
      });
      this.navigationHammers.push(hammerFrame);

      this.iconsCreated = true;
    }
  }, {
    key: 'bindToRedraw',
    value: function bindToRedraw(action) {
      if (this.boundFunctions[action] === undefined) {
        this.boundFunctions[action] = this[action].bind(this);
        this.body.emitter.on("initRedraw", this.boundFunctions[action]);
        this.body.emitter.emit("_startRendering");
      }
    }
  }, {
    key: 'unbindFromRedraw',
    value: function unbindFromRedraw(action) {
      if (this.boundFunctions[action] !== undefined) {
        this.body.emitter.off("initRedraw", this.boundFunctions[action]);
        this.body.emitter.emit("_stopRendering");
        delete this.boundFunctions[action];
      }
    }

    /**
     * this stops all movement induced by the navigation buttons
     *
     * @private
     */

  }, {
    key: '_fit',
    value: function _fit() {
      if (new Date().valueOf() - this.touchTime > 700) {
        // TODO: fix ugly hack to avoid hammer's double fireing of event (because we use release?)
        this.body.emitter.emit("fit", { duration: 700 });
        this.touchTime = new Date().valueOf();
      }
    }

    /**
     * this stops all movement induced by the navigation buttons
     *
     * @private
     */

  }, {
    key: '_stopMovement',
    value: function _stopMovement() {
      for (var boundAction in this.boundFunctions) {
        if (this.boundFunctions.hasOwnProperty(boundAction)) {
          this.body.emitter.off("initRedraw", this.boundFunctions[boundAction]);
          this.body.emitter.emit("_stopRendering");
        }
      }
      this.boundFunctions = {};
    }
  }, {
    key: '_moveUp',
    value: function _moveUp() {
      this.body.view.translation.y += this.options.keyboard.speed.y;
    }
  }, {
    key: '_moveDown',
    value: function _moveDown() {
      this.body.view.translation.y -= this.options.keyboard.speed.y;
    }
  }, {
    key: '_moveLeft',
    value: function _moveLeft() {
      this.body.view.translation.x += this.options.keyboard.speed.x;
    }
  }, {
    key: '_moveRight',
    value: function _moveRight() {
      this.body.view.translation.x -= this.options.keyboard.speed.x;
    }
  }, {
    key: '_zoomIn',
    value: function _zoomIn() {
      this.body.view.scale *= 1 + this.options.keyboard.speed.zoom;
      this.body.emitter.emit('zoom', { direction: '+', scale: this.body.view.scale });
    }
  }, {
    key: '_zoomOut',
    value: function _zoomOut() {
      this.body.view.scale /= 1 + this.options.keyboard.speed.zoom;
      this.body.emitter.emit('zoom', { direction: '-', scale: this.body.view.scale });
    }

    /**
     * bind all keys using keycharm.
     */

  }, {
    key: 'configureKeyboardBindings',
    value: function configureKeyboardBindings() {
      var _this3 = this;

      if (this.keycharm !== undefined) {
        this.keycharm.destroy();
      }

      if (this.options.keyboard.enabled === true) {
        if (this.options.keyboard.bindToWindow === true) {
          this.keycharm = keycharm({ container: window, preventDefault: true });
        } else {
          this.keycharm = keycharm({ container: this.canvas.frame, preventDefault: true });
        }

        this.keycharm.reset();

        if (this.activated === true) {
          this.keycharm.bind("up", function () {
            _this3.bindToRedraw("_moveUp");
          }, "keydown");
          this.keycharm.bind("down", function () {
            _this3.bindToRedraw("_moveDown");
          }, "keydown");
          this.keycharm.bind("left", function () {
            _this3.bindToRedraw("_moveLeft");
          }, "keydown");
          this.keycharm.bind("right", function () {
            _this3.bindToRedraw("_moveRight");
          }, "keydown");
          this.keycharm.bind("=", function () {
            _this3.bindToRedraw("_zoomIn");
          }, "keydown");
          this.keycharm.bind("num+", function () {
            _this3.bindToRedraw("_zoomIn");
          }, "keydown");
          this.keycharm.bind("num-", function () {
            _this3.bindToRedraw("_zoomOut");
          }, "keydown");
          this.keycharm.bind("-", function () {
            _this3.bindToRedraw("_zoomOut");
          }, "keydown");
          this.keycharm.bind("[", function () {
            _this3.bindToRedraw("_zoomOut");
          }, "keydown");
          this.keycharm.bind("]", function () {
            _this3.bindToRedraw("_zoomIn");
          }, "keydown");
          this.keycharm.bind("pageup", function () {
            _this3.bindToRedraw("_zoomIn");
          }, "keydown");
          this.keycharm.bind("pagedown", function () {
            _this3.bindToRedraw("_zoomOut");
          }, "keydown");

          this.keycharm.bind("up", function () {
            _this3.unbindFromRedraw("_moveUp");
          }, "keyup");
          this.keycharm.bind("down", function () {
            _this3.unbindFromRedraw("_moveDown");
          }, "keyup");
          this.keycharm.bind("left", function () {
            _this3.unbindFromRedraw("_moveLeft");
          }, "keyup");
          this.keycharm.bind("right", function () {
            _this3.unbindFromRedraw("_moveRight");
          }, "keyup");
          this.keycharm.bind("=", function () {
            _this3.unbindFromRedraw("_zoomIn");
          }, "keyup");
          this.keycharm.bind("num+", function () {
            _this3.unbindFromRedraw("_zoomIn");
          }, "keyup");
          this.keycharm.bind("num-", function () {
            _this3.unbindFromRedraw("_zoomOut");
          }, "keyup");
          this.keycharm.bind("-", function () {
            _this3.unbindFromRedraw("_zoomOut");
          }, "keyup");
          this.keycharm.bind("[", function () {
            _this3.unbindFromRedraw("_zoomOut");
          }, "keyup");
          this.keycharm.bind("]", function () {
            _this3.unbindFromRedraw("_zoomIn");
          }, "keyup");
          this.keycharm.bind("pageup", function () {
            _this3.unbindFromRedraw("_zoomIn");
          }, "keyup");
          this.keycharm.bind("pagedown", function () {
            _this3.unbindFromRedraw("_zoomOut");
          }, "keyup");
        }
      }
    }
  }]);

  return NavigationHandler;
}();

exports.default = NavigationHandler;