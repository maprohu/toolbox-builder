'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var DOMutil = require('../../../DOMutil');

function Points(groupId, options) {}

/**
 * draw the data points
 *
 * @param {Array} dataset
 * @param {Object} JSONcontainer
 * @param {Object} svg            | SVG DOM element
 * @param {GraphGroup} group
 * @param {Number} [offset]
 */
Points.draw = function (dataset, group, framework, offset) {
  offset = offset || 0;
  var callback = getCallback(framework, group);

  for (var i = 0; i < dataset.length; i++) {
    if (!callback) {
      // draw the point the simple way.
      DOMutil.drawPoint(dataset[i].screen_x + offset, dataset[i].screen_y, getGroupTemplate(group), framework.svgElements, framework.svg, dataset[i].label);
    } else {
      var callbackResult = callback(dataset[i], group); // result might be true, false or an object
      if (callbackResult === true || (typeof callbackResult === 'undefined' ? 'undefined' : _typeof(callbackResult)) === 'object') {
        DOMutil.drawPoint(dataset[i].screen_x + offset, dataset[i].screen_y, getGroupTemplate(group, callbackResult), framework.svgElements, framework.svg, dataset[i].label);
      }
    }
  }
};

Points.drawIcon = function (group, x, y, iconWidth, iconHeight, framework) {
  var fillHeight = iconHeight * 0.5;
  var path, fillPath;

  var outline = DOMutil.getSVGElement("rect", framework.svgElements, framework.svg);
  outline.setAttributeNS(null, "x", x);
  outline.setAttributeNS(null, "y", y - fillHeight);
  outline.setAttributeNS(null, "width", iconWidth);
  outline.setAttributeNS(null, "height", 2 * fillHeight);
  outline.setAttributeNS(null, "class", "vis-outline");

  //Don't call callback on icon
  DOMutil.drawPoint(x + 0.5 * iconWidth, y, getGroupTemplate(group), framework.svgElements, framework.svg);
};

function getGroupTemplate(group, callbackResult) {
  callbackResult = typeof callbackResult === 'undefined' ? {} : callbackResult;
  return {
    style: callbackResult.style || group.options.drawPoints.style,
    styles: callbackResult.styles || group.options.drawPoints.styles,
    size: callbackResult.size || group.options.drawPoints.size,
    className: callbackResult.className || group.className
  };
}

function getCallback(framework, group) {
  var callback = undefined;
  // check for the graph2d onRender
  if (framework.options && framework.options.drawPoints && framework.options.drawPoints.onRender && typeof framework.options.drawPoints.onRender == 'function') {
    callback = framework.options.drawPoints.onRender;
  }

  // override it with the group onRender if defined
  if (group.group.options && group.group.options.drawPoints && group.group.options.drawPoints.onRender && typeof group.group.options.drawPoints.onRender == 'function') {
    callback = group.group.options.drawPoints.onRender;
  }
  return callback;
}

module.exports = Points;