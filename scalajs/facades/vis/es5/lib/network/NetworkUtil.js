"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var util = require("../util");

var NetworkUtil = function () {
  function NetworkUtil() {
    _classCallCheck(this, NetworkUtil);
  }

  /**
   * Find the center position of the network considering the bounding boxes
   */


  _createClass(NetworkUtil, null, [{
    key: "getRange",
    value: function getRange(allNodes) {
      var specificNodes = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

      var minY = 1e9,
          maxY = -1e9,
          minX = 1e9,
          maxX = -1e9,
          node;
      if (specificNodes.length > 0) {
        for (var i = 0; i < specificNodes.length; i++) {
          node = allNodes[specificNodes[i]];
          if (minX > node.shape.boundingBox.left) {
            minX = node.shape.boundingBox.left;
          }
          if (maxX < node.shape.boundingBox.right) {
            maxX = node.shape.boundingBox.right;
          }
          if (minY > node.shape.boundingBox.top) {
            minY = node.shape.boundingBox.top;
          } // top is negative, bottom is positive
          if (maxY < node.shape.boundingBox.bottom) {
            maxY = node.shape.boundingBox.bottom;
          } // top is negative, bottom is positive
        }
      }

      if (minX === 1e9 && maxX === -1e9 && minY === 1e9 && maxY === -1e9) {
        minY = 0, maxY = 0, minX = 0, maxX = 0;
      }
      return { minX: minX, maxX: maxX, minY: minY, maxY: maxY };
    }

    /**
     * Find the center position of the network
     */

  }, {
    key: "getRangeCore",
    value: function getRangeCore(allNodes) {
      var specificNodes = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

      var minY = 1e9,
          maxY = -1e9,
          minX = 1e9,
          maxX = -1e9,
          node;
      if (specificNodes.length > 0) {
        for (var i = 0; i < specificNodes.length; i++) {
          node = allNodes[specificNodes[i]];
          if (minX > node.x) {
            minX = node.x;
          }
          if (maxX < node.x) {
            maxX = node.x;
          }
          if (minY > node.y) {
            minY = node.y;
          } // top is negative, bottom is positive
          if (maxY < node.y) {
            maxY = node.y;
          } // top is negative, bottom is positive
        }
      }

      if (minX === 1e9 && maxX === -1e9 && minY === 1e9 && maxY === -1e9) {
        minY = 0, maxY = 0, minX = 0, maxX = 0;
      }
      return { minX: minX, maxX: maxX, minY: minY, maxY: maxY };
    }

    /**
     * @param {object} range = {minX: minX, maxX: maxX, minY: minY, maxY: maxY};
     * @returns {{x: number, y: number}}
     */

  }, {
    key: "findCenter",
    value: function findCenter(range) {
      return { x: 0.5 * (range.maxX + range.minX),
        y: 0.5 * (range.maxY + range.minY) };
    }

    /**
     * This returns a clone of the options or options of the edge or node to be used for construction of new edges or check functions for new nodes.
     * @param item
     * @param type
     * @returns {{}}
     */

  }, {
    key: "cloneOptions",
    value: function cloneOptions(item, type) {
      var clonedOptions = {};
      if (type === undefined || type === 'node') {
        util.deepExtend(clonedOptions, item.options, true);
        clonedOptions.x = item.x;
        clonedOptions.y = item.y;
        clonedOptions.amountOfConnections = item.edges.length;
      } else {
        util.deepExtend(clonedOptions, item.options, true);
      }
      return clonedOptions;
    }
  }]);

  return NetworkUtil;
}();

exports.default = NetworkUtil;