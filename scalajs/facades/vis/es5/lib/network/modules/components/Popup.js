'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Popup is a class to create a popup window with some text
 * @param {Element}  container     The container object.
 * @param {Number} [x]
 * @param {Number} [y]
 * @param {String} [text]
 * @param {Object} [style]     An object containing borderColor,
 *                             backgroundColor, etc.
 */
var Popup = function () {
  function Popup(container) {
    _classCallCheck(this, Popup);

    this.container = container;

    this.x = 0;
    this.y = 0;
    this.padding = 5;
    this.hidden = false;

    // create the frame
    this.frame = document.createElement('div');
    this.frame.className = 'vis-network-tooltip';
    this.container.appendChild(this.frame);
  }

  /**
   * @param {number} x   Horizontal position of the popup window
   * @param {number} y   Vertical position of the popup window
   */


  _createClass(Popup, [{
    key: 'setPosition',
    value: function setPosition(x, y) {
      this.x = parseInt(x);
      this.y = parseInt(y);
    }

    /**
     * Set the content for the popup window. This can be HTML code or text.
     * @param {string | Element} content
     */

  }, {
    key: 'setText',
    value: function setText(content) {
      if (content instanceof Element) {
        this.frame.innerHTML = '';
        this.frame.appendChild(content);
      } else {
        this.frame.innerHTML = content; // string containing text or HTML
      }
    }

    /**
     * Show the popup window
     * @param {boolean} [doShow]    Show or hide the window
     */

  }, {
    key: 'show',
    value: function show(doShow) {
      if (doShow === undefined) {
        doShow = true;
      }

      if (doShow === true) {
        var height = this.frame.clientHeight;
        var width = this.frame.clientWidth;
        var maxHeight = this.frame.parentNode.clientHeight;
        var maxWidth = this.frame.parentNode.clientWidth;

        var top = this.y - height;
        if (top + height + this.padding > maxHeight) {
          top = maxHeight - height - this.padding;
        }
        if (top < this.padding) {
          top = this.padding;
        }

        var left = this.x;
        if (left + width + this.padding > maxWidth) {
          left = maxWidth - width - this.padding;
        }
        if (left < this.padding) {
          left = this.padding;
        }

        this.frame.style.left = left + "px";
        this.frame.style.top = top + "px";
        this.frame.style.visibility = "visible";
        this.hidden = false;
      } else {
        this.hide();
      }
    }

    /**
     * Hide the popup window
     */

  }, {
    key: 'hide',
    value: function hide() {
      this.hidden = true;
      this.frame.style.visibility = "hidden";
    }
  }]);

  return Popup;
}();

exports.default = Popup;