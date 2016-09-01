'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _ColorPicker = require('./ColorPicker');

var _ColorPicker2 = _interopRequireDefault(_ColorPicker);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var util = require('../util');

/**
 * The way this works is for all properties of this.possible options, you can supply the property name in any form to list the options.
 * Boolean options are recognised as Boolean
 * Number options should be written as array: [default value, min value, max value, stepsize]
 * Colors should be written as array: ['color', '#ffffff']
 * Strings with should be written as array: [option1, option2, option3, ..]
 *
 * The options are matched with their counterparts in each of the modules and the values used in the configuration are
 *
 * @param parentModule        | the location where parentModule.setOptions() can be called
 * @param defaultContainer    | the default container of the module
 * @param configureOptions    | the fully configured and predefined options set found in allOptions.js
 * @param pixelRatio          | canvas pixel ratio
 */
var Configurator = function () {
  function Configurator(parentModule, defaultContainer, configureOptions) {
    var pixelRatio = arguments.length <= 3 || arguments[3] === undefined ? 1 : arguments[3];

    _classCallCheck(this, Configurator);

    this.parent = parentModule;
    this.changedOptions = [];
    this.container = defaultContainer;
    this.allowCreation = false;

    this.options = {};
    this.initialized = false;
    this.popupCounter = 0;
    this.defaultOptions = {
      enabled: false,
      filter: true,
      container: undefined,
      showButton: true
    };
    util.extend(this.options, this.defaultOptions);

    this.configureOptions = configureOptions;
    this.moduleOptions = {};
    this.domElements = [];
    this.popupDiv = {};
    this.popupLimit = 5;
    this.popupHistory = {};
    this.colorPicker = new _ColorPicker2.default(pixelRatio);
    this.wrapper = undefined;
  }

  /**
   * refresh all options.
   * Because all modules parse their options by themselves, we just use their options. We copy them here.
   *
   * @param options
   */


  _createClass(Configurator, [{
    key: 'setOptions',
    value: function setOptions(options) {
      if (options !== undefined) {
        // reset the popup history because the indices may have been changed.
        this.popupHistory = {};
        this._removePopup();

        var enabled = true;
        if (typeof options === 'string') {
          this.options.filter = options;
        } else if (options instanceof Array) {
          this.options.filter = options.join();
        } else if ((typeof options === 'undefined' ? 'undefined' : _typeof(options)) === 'object') {
          if (options.container !== undefined) {
            this.options.container = options.container;
          }
          if (options.filter !== undefined) {
            this.options.filter = options.filter;
          }
          if (options.showButton !== undefined) {
            this.options.showButton = options.showButton;
          }
          if (options.enabled !== undefined) {
            enabled = options.enabled;
          }
        } else if (typeof options === 'boolean') {
          this.options.filter = true;
          enabled = options;
        } else if (typeof options === 'function') {
          this.options.filter = options;
          enabled = true;
        }
        if (this.options.filter === false) {
          enabled = false;
        }

        this.options.enabled = enabled;
      }
      this._clean();
    }
  }, {
    key: 'setModuleOptions',
    value: function setModuleOptions(moduleOptions) {
      this.moduleOptions = moduleOptions;
      if (this.options.enabled === true) {
        this._clean();
        if (this.options.container !== undefined) {
          this.container = this.options.container;
        }
        this._create();
      }
    }

    /**
     * Create all DOM elements
     * @private
     */

  }, {
    key: '_create',
    value: function _create() {
      var _this = this;

      this._clean();
      this.changedOptions = [];

      var filter = this.options.filter;
      var counter = 0;
      var show = false;
      for (var option in this.configureOptions) {
        if (this.configureOptions.hasOwnProperty(option)) {
          this.allowCreation = false;
          show = false;
          if (typeof filter === 'function') {
            show = filter(option, []);
            show = show || this._handleObject(this.configureOptions[option], [option], true);
          } else if (filter === true || filter.indexOf(option) !== -1) {
            show = true;
          }

          if (show !== false) {
            this.allowCreation = true;

            // linebreak between categories
            if (counter > 0) {
              this._makeItem([]);
            }
            // a header for the category
            this._makeHeader(option);

            // get the sub options
            this._handleObject(this.configureOptions[option], [option]);
          }
          counter++;
        }
      }

      if (this.options.showButton === true) {
        (function () {
          var generateButton = document.createElement('div');
          generateButton.className = 'vis-configuration vis-config-button';
          generateButton.innerHTML = 'generate options';
          generateButton.onclick = function () {
            _this._printOptions();
          };
          generateButton.onmouseover = function () {
            generateButton.className = 'vis-configuration vis-config-button hover';
          };
          generateButton.onmouseout = function () {
            generateButton.className = 'vis-configuration vis-config-button';
          };

          _this.optionsContainer = document.createElement('div');
          _this.optionsContainer.className = 'vis-configuration vis-config-option-container';

          _this.domElements.push(_this.optionsContainer);
          _this.domElements.push(generateButton);
        })();
      }

      this._push();
      //~ this.colorPicker.insertTo(this.container);
    }

    /**
     * draw all DOM elements on the screen
     * @private
     */

  }, {
    key: '_push',
    value: function _push() {
      this.wrapper = document.createElement('div');
      this.wrapper.className = 'vis-configuration-wrapper';
      this.container.appendChild(this.wrapper);
      for (var i = 0; i < this.domElements.length; i++) {
        this.wrapper.appendChild(this.domElements[i]);
      }

      this._showPopupIfNeeded();
    }

    /**
     * delete all DOM elements
     * @private
     */

  }, {
    key: '_clean',
    value: function _clean() {
      for (var i = 0; i < this.domElements.length; i++) {
        this.wrapper.removeChild(this.domElements[i]);
      }

      if (this.wrapper !== undefined) {
        this.container.removeChild(this.wrapper);
        this.wrapper = undefined;
      }
      this.domElements = [];

      this._removePopup();
    }

    /**
     * get the value from the actualOptions if it exists
     * @param {array} path    | where to look for the actual option
     * @returns {*}
     * @private
     */

  }, {
    key: '_getValue',
    value: function _getValue(path) {
      var base = this.moduleOptions;
      for (var i = 0; i < path.length; i++) {
        if (base[path[i]] !== undefined) {
          base = base[path[i]];
        } else {
          base = undefined;
          break;
        }
      }
      return base;
    }

    /**
     * all option elements are wrapped in an item
     * @param path
     * @param domElements
     * @private
     */

  }, {
    key: '_makeItem',
    value: function _makeItem(path) {
      var _arguments = arguments,
          _this2 = this;

      if (this.allowCreation === true) {
        var _len, domElements, _key;

        var _ret2 = function () {
          var item = document.createElement('div');
          item.className = 'vis-configuration vis-config-item vis-config-s' + path.length;

          for (_len = _arguments.length, domElements = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            domElements[_key - 1] = _arguments[_key];
          }

          domElements.forEach(function (element) {
            item.appendChild(element);
          });
          _this2.domElements.push(item);
          return {
            v: _this2.domElements.length
          };
        }();

        if ((typeof _ret2 === 'undefined' ? 'undefined' : _typeof(_ret2)) === "object") return _ret2.v;
      }
      return 0;
    }

    /**
     * header for major subjects
     * @param name
     * @private
     */

  }, {
    key: '_makeHeader',
    value: function _makeHeader(name) {
      var div = document.createElement('div');
      div.className = 'vis-configuration vis-config-header';
      div.innerHTML = name;
      this._makeItem([], div);
    }

    /**
     * make a label, if it is an object label, it gets different styling.
     * @param name
     * @param path
     * @param objectLabel
     * @returns {HTMLElement}
     * @private
     */

  }, {
    key: '_makeLabel',
    value: function _makeLabel(name, path) {
      var objectLabel = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

      var div = document.createElement('div');
      div.className = 'vis-configuration vis-config-label vis-config-s' + path.length;
      if (objectLabel === true) {
        div.innerHTML = '<i><b>' + name + ':</b></i>';
      } else {
        div.innerHTML = name + ':';
      }
      return div;
    }

    /**
     * make a dropdown list for multiple possible string optoins
     * @param arr
     * @param value
     * @param path
     * @private
     */

  }, {
    key: '_makeDropdown',
    value: function _makeDropdown(arr, value, path) {
      var select = document.createElement('select');
      select.className = 'vis-configuration vis-config-select';
      var selectedValue = 0;
      if (value !== undefined) {
        if (arr.indexOf(value) !== -1) {
          selectedValue = arr.indexOf(value);
        }
      }

      for (var i = 0; i < arr.length; i++) {
        var option = document.createElement('option');
        option.value = arr[i];
        if (i === selectedValue) {
          option.selected = 'selected';
        }
        option.innerHTML = arr[i];
        select.appendChild(option);
      }

      var me = this;
      select.onchange = function () {
        me._update(this.value, path);
      };

      var label = this._makeLabel(path[path.length - 1], path);
      this._makeItem(path, label, select);
    }

    /**
     * make a range object for numeric options
     * @param arr
     * @param value
     * @param path
     * @private
     */

  }, {
    key: '_makeRange',
    value: function _makeRange(arr, value, path) {
      var defaultValue = arr[0];
      var min = arr[1];
      var max = arr[2];
      var step = arr[3];
      var range = document.createElement('input');
      range.className = 'vis-configuration vis-config-range';
      try {
        range.type = 'range'; // not supported on IE9
        range.min = min;
        range.max = max;
      } catch (err) {}
      range.step = step;

      // set up the popup settings in case they are needed.
      var popupString = '';
      var popupValue = 0;

      if (value !== undefined) {
        var factor = 1.20;
        if (value < 0 && value * factor < min) {
          range.min = Math.ceil(value * factor);
          popupValue = range.min;
          popupString = 'range increased';
        } else if (value / factor < min) {
          range.min = Math.ceil(value / factor);
          popupValue = range.min;
          popupString = 'range increased';
        }
        if (value * factor > max && max !== 1) {
          range.max = Math.ceil(value * factor);
          popupValue = range.max;
          popupString = 'range increased';
        }
        range.value = value;
      } else {
        range.value = defaultValue;
      }

      var input = document.createElement('input');
      input.className = 'vis-configuration vis-config-rangeinput';
      input.value = range.value;

      var me = this;
      range.onchange = function () {
        input.value = this.value;me._update(Number(this.value), path);
      };
      range.oninput = function () {
        input.value = this.value;
      };

      var label = this._makeLabel(path[path.length - 1], path);
      var itemIndex = this._makeItem(path, label, range, input);

      // if a popup is needed AND it has not been shown for this value, show it.
      if (popupString !== '' && this.popupHistory[itemIndex] !== popupValue) {
        this.popupHistory[itemIndex] = popupValue;
        this._setupPopup(popupString, itemIndex);
      }
    }

    /**
     * prepare the popup
     * @param string
     * @param index
     * @private
     */

  }, {
    key: '_setupPopup',
    value: function _setupPopup(string, index) {
      var _this3 = this;

      if (this.initialized === true && this.allowCreation === true && this.popupCounter < this.popupLimit) {
        var div = document.createElement("div");
        div.id = "vis-configuration-popup";
        div.className = "vis-configuration-popup";
        div.innerHTML = string;
        div.onclick = function () {
          _this3._removePopup();
        };
        this.popupCounter += 1;
        this.popupDiv = { html: div, index: index };
      }
    }

    /**
     * remove the popup from the dom
     * @private
     */

  }, {
    key: '_removePopup',
    value: function _removePopup() {
      if (this.popupDiv.html !== undefined) {
        this.popupDiv.html.parentNode.removeChild(this.popupDiv.html);
        clearTimeout(this.popupDiv.hideTimeout);
        clearTimeout(this.popupDiv.deleteTimeout);
        this.popupDiv = {};
      }
    }

    /**
     * Show the popup if it is needed.
     * @private
     */

  }, {
    key: '_showPopupIfNeeded',
    value: function _showPopupIfNeeded() {
      var _this4 = this;

      if (this.popupDiv.html !== undefined) {
        var correspondingElement = this.domElements[this.popupDiv.index];
        var rect = correspondingElement.getBoundingClientRect();
        this.popupDiv.html.style.left = rect.left + "px";
        this.popupDiv.html.style.top = rect.top - 30 + "px"; // 30 is the height;
        document.body.appendChild(this.popupDiv.html);
        this.popupDiv.hideTimeout = setTimeout(function () {
          _this4.popupDiv.html.style.opacity = 0;
        }, 1500);
        this.popupDiv.deleteTimeout = setTimeout(function () {
          _this4._removePopup();
        }, 1800);
      }
    }

    /**
     * make a checkbox for boolean options.
     * @param defaultValue
     * @param value
     * @param path
     * @private
     */

  }, {
    key: '_makeCheckbox',
    value: function _makeCheckbox(defaultValue, value, path) {
      var checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'vis-configuration vis-config-checkbox';
      checkbox.checked = defaultValue;
      if (value !== undefined) {
        checkbox.checked = value;
        if (value !== defaultValue) {
          if ((typeof defaultValue === 'undefined' ? 'undefined' : _typeof(defaultValue)) === 'object') {
            if (value !== defaultValue.enabled) {
              this.changedOptions.push({ path: path, value: value });
            }
          } else {
            this.changedOptions.push({ path: path, value: value });
          }
        }
      }

      var me = this;
      checkbox.onchange = function () {
        me._update(this.checked, path);
      };

      var label = this._makeLabel(path[path.length - 1], path);
      this._makeItem(path, label, checkbox);
    }

    /**
     * make a text input field for string options.
     * @param defaultValue
     * @param value
     * @param path
     * @private
     */

  }, {
    key: '_makeTextInput',
    value: function _makeTextInput(defaultValue, value, path) {
      var checkbox = document.createElement('input');
      checkbox.type = 'text';
      checkbox.className = 'vis-configuration vis-config-text';
      checkbox.value = value;
      if (value !== defaultValue) {
        this.changedOptions.push({ path: path, value: value });
      }

      var me = this;
      checkbox.onchange = function () {
        me._update(this.value, path);
      };

      var label = this._makeLabel(path[path.length - 1], path);
      this._makeItem(path, label, checkbox);
    }

    /**
     * make a color field with a color picker for color fields
     * @param arr
     * @param value
     * @param path
     * @private
     */

  }, {
    key: '_makeColorField',
    value: function _makeColorField(arr, value, path) {
      var _this5 = this;

      var defaultColor = arr[1];
      var div = document.createElement('div');
      value = value === undefined ? defaultColor : value;

      if (value !== 'none') {
        div.className = 'vis-configuration vis-config-colorBlock';
        div.style.backgroundColor = value;
      } else {
        div.className = 'vis-configuration vis-config-colorBlock none';
      }

      value = value === undefined ? defaultColor : value;
      div.onclick = function () {
        _this5._showColorPicker(value, div, path);
      };

      var label = this._makeLabel(path[path.length - 1], path);
      this._makeItem(path, label, div);
    }

    /**
     * used by the color buttons to call the color picker.
     * @param event
     * @param value
     * @param div
     * @param path
     * @private
     */

  }, {
    key: '_showColorPicker',
    value: function _showColorPicker(value, div, path) {
      var _this6 = this;

      // clear the callback from this div
      div.onclick = function () {};

      this.colorPicker.insertTo(div);
      this.colorPicker.show();

      this.colorPicker.setColor(value);
      this.colorPicker.setUpdateCallback(function (color) {
        var colorString = 'rgba(' + color.r + ',' + color.g + ',' + color.b + ',' + color.a + ')';
        div.style.backgroundColor = colorString;
        _this6._update(colorString, path);
      });

      // on close of the colorpicker, restore the callback.
      this.colorPicker.setCloseCallback(function () {
        div.onclick = function () {
          _this6._showColorPicker(value, div, path);
        };
      });
    }

    /**
     * parse an object and draw the correct items
     * @param obj
     * @param path
     * @private
     */

  }, {
    key: '_handleObject',
    value: function _handleObject(obj) {
      var path = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];
      var checkOnly = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

      var show = false;
      var filter = this.options.filter;
      var visibleInSet = false;
      for (var subObj in obj) {
        if (obj.hasOwnProperty(subObj)) {
          show = true;
          var item = obj[subObj];
          var newPath = util.copyAndExtendArray(path, subObj);
          if (typeof filter === 'function') {
            show = filter(subObj, path);

            // if needed we must go deeper into the object.
            if (show === false) {
              if (!(item instanceof Array) && typeof item !== 'string' && typeof item !== 'boolean' && item instanceof Object) {
                this.allowCreation = false;
                show = this._handleObject(item, newPath, true);
                this.allowCreation = checkOnly === false;
              }
            }
          }

          if (show !== false) {
            visibleInSet = true;
            var value = this._getValue(newPath);

            if (item instanceof Array) {
              this._handleArray(item, value, newPath);
            } else if (typeof item === 'string') {
              this._makeTextInput(item, value, newPath);
            } else if (typeof item === 'boolean') {
              this._makeCheckbox(item, value, newPath);
            } else if (item instanceof Object) {
              // collapse the physics options that are not enabled
              var draw = true;
              if (path.indexOf('physics') !== -1) {
                if (this.moduleOptions.physics.solver !== subObj) {
                  draw = false;
                }
              }

              if (draw === true) {
                // initially collapse options with an disabled enabled option.
                if (item.enabled !== undefined) {
                  var enabledPath = util.copyAndExtendArray(newPath, 'enabled');
                  var enabledValue = this._getValue(enabledPath);
                  if (enabledValue === true) {
                    var label = this._makeLabel(subObj, newPath, true);
                    this._makeItem(newPath, label);
                    visibleInSet = this._handleObject(item, newPath) || visibleInSet;
                  } else {
                    this._makeCheckbox(item, enabledValue, newPath);
                  }
                } else {
                  var _label = this._makeLabel(subObj, newPath, true);
                  this._makeItem(newPath, _label);
                  visibleInSet = this._handleObject(item, newPath) || visibleInSet;
                }
              }
            } else {
              console.error('dont know how to handle', item, subObj, newPath);
            }
          }
        }
      }
      return visibleInSet;
    }

    /**
     * handle the array type of option
     * @param optionName
     * @param arr
     * @param value
     * @param path
     * @private
     */

  }, {
    key: '_handleArray',
    value: function _handleArray(arr, value, path) {
      if (typeof arr[0] === 'string' && arr[0] === 'color') {
        this._makeColorField(arr, value, path);
        if (arr[1] !== value) {
          this.changedOptions.push({ path: path, value: value });
        }
      } else if (typeof arr[0] === 'string') {
        this._makeDropdown(arr, value, path);
        if (arr[0] !== value) {
          this.changedOptions.push({ path: path, value: value });
        }
      } else if (typeof arr[0] === 'number') {
        this._makeRange(arr, value, path);
        if (arr[0] !== value) {
          this.changedOptions.push({ path: path, value: Number(value) });
        }
      }
    }

    /**
     * called to update the network with the new settings.
     * @param value
     * @param path
     * @private
     */

  }, {
    key: '_update',
    value: function _update(value, path) {
      var options = this._constructOptions(value, path);

      if (this.parent.body && this.parent.body.emitter && this.parent.body.emitter.emit) {
        this.parent.body.emitter.emit("configChange", options);
      }
      this.initialized = true;
      this.parent.setOptions(options);
    }
  }, {
    key: '_constructOptions',
    value: function _constructOptions(value, path) {
      var optionsObj = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

      var pointer = optionsObj;

      // when dropdown boxes can be string or boolean, we typecast it into correct types
      value = value === 'true' ? true : value;
      value = value === 'false' ? false : value;

      for (var i = 0; i < path.length; i++) {
        if (path[i] !== 'global') {
          if (pointer[path[i]] === undefined) {
            pointer[path[i]] = {};
          }
          if (i !== path.length - 1) {
            pointer = pointer[path[i]];
          } else {
            pointer[path[i]] = value;
          }
        }
      }
      return optionsObj;
    }
  }, {
    key: '_printOptions',
    value: function _printOptions() {
      var options = this.getOptions();
      this.optionsContainer.innerHTML = '<pre>var options = ' + JSON.stringify(options, null, 2) + '</pre>';
    }
  }, {
    key: 'getOptions',
    value: function getOptions() {
      var options = {};
      for (var i = 0; i < this.changedOptions.length; i++) {
        this._constructOptions(this.changedOptions[i].value, this.changedOptions[i].path, options);
      }
      return options;
    }
  }]);

  return Configurator;
}();

exports.default = Configurator;