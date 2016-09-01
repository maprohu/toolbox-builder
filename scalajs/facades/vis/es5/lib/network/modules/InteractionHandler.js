'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _NavigationHandler = require('./components/NavigationHandler');

var _NavigationHandler2 = _interopRequireDefault(_NavigationHandler);

var _Popup = require('./components/Popup');

var _Popup2 = _interopRequireDefault(_Popup);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var util = require('../../util');

var InteractionHandler = function () {
  function InteractionHandler(body, canvas, selectionHandler) {
    _classCallCheck(this, InteractionHandler);

    this.body = body;
    this.canvas = canvas;
    this.selectionHandler = selectionHandler;
    this.navigationHandler = new _NavigationHandler2.default(body, canvas);

    // bind the events from hammer to functions in this object
    this.body.eventListeners.onTap = this.onTap.bind(this);
    this.body.eventListeners.onTouch = this.onTouch.bind(this);
    this.body.eventListeners.onDoubleTap = this.onDoubleTap.bind(this);
    this.body.eventListeners.onHold = this.onHold.bind(this);
    this.body.eventListeners.onDragStart = this.onDragStart.bind(this);
    this.body.eventListeners.onDrag = this.onDrag.bind(this);
    this.body.eventListeners.onDragEnd = this.onDragEnd.bind(this);
    this.body.eventListeners.onMouseWheel = this.onMouseWheel.bind(this);
    this.body.eventListeners.onPinch = this.onPinch.bind(this);
    this.body.eventListeners.onMouseMove = this.onMouseMove.bind(this);
    this.body.eventListeners.onRelease = this.onRelease.bind(this);
    this.body.eventListeners.onContext = this.onContext.bind(this);

    this.touchTime = 0;
    this.drag = {};
    this.pinch = {};
    this.popup = undefined;
    this.popupObj = undefined;
    this.popupTimer = undefined;

    this.body.functions.getPointer = this.getPointer.bind(this);

    this.options = {};
    this.defaultOptions = {
      dragNodes: true,
      dragView: true,
      hover: false,
      keyboard: {
        enabled: false,
        speed: { x: 10, y: 10, zoom: 0.02 },
        bindToWindow: true
      },
      navigationButtons: false,
      tooltipDelay: 300,
      zoomView: true
    };
    util.extend(this.options, this.defaultOptions);

    this.bindEventListeners();
  }

  _createClass(InteractionHandler, [{
    key: 'bindEventListeners',
    value: function bindEventListeners() {
      var _this = this;

      this.body.emitter.on('destroy', function () {
        clearTimeout(_this.popupTimer);
        delete _this.body.functions.getPointer;
      });
    }
  }, {
    key: 'setOptions',
    value: function setOptions(options) {
      if (options !== undefined) {
        // extend all but the values in fields
        var fields = ['hideEdgesOnDrag', 'hideNodesOnDrag', 'keyboard', 'multiselect', 'selectable', 'selectConnectedEdges'];
        util.selectiveNotDeepExtend(fields, this.options, options);

        // merge the keyboard options in.
        util.mergeOptions(this.options, options, 'keyboard');

        if (options.tooltip) {
          util.extend(this.options.tooltip, options.tooltip);
          if (options.tooltip.color) {
            this.options.tooltip.color = util.parseColor(options.tooltip.color);
          }
        }
      }

      this.navigationHandler.setOptions(this.options);
    }

    /**
     * Get the pointer location from a touch location
     * @param {{x: Number, y: Number}} touch
     * @return {{x: Number, y: Number}} pointer
     * @private
     */

  }, {
    key: 'getPointer',
    value: function getPointer(touch) {
      return {
        x: touch.x - util.getAbsoluteLeft(this.canvas.frame.canvas),
        y: touch.y - util.getAbsoluteTop(this.canvas.frame.canvas)
      };
    }

    /**
     * On start of a touch gesture, store the pointer
     * @param event
     * @private
     */

  }, {
    key: 'onTouch',
    value: function onTouch(event) {
      if (new Date().valueOf() - this.touchTime > 50) {
        this.drag.pointer = this.getPointer(event.center);
        this.drag.pinched = false;
        this.pinch.scale = this.body.view.scale;
        // to avoid double fireing of this event because we have two hammer instances. (on canvas and on frame)
        this.touchTime = new Date().valueOf();
      }
    }

    /**
     * handle tap/click event: select/unselect a node
     * @private
     */

  }, {
    key: 'onTap',
    value: function onTap(event) {
      var pointer = this.getPointer(event.center);
      var multiselect = this.selectionHandler.options.multiselect && (event.changedPointers[0].ctrlKey || event.changedPointers[0].metaKey);

      this.checkSelectionChanges(pointer, event, multiselect);
      this.selectionHandler._generateClickEvent('click', event, pointer);
    }

    /**
     * handle doubletap event
     * @private
     */

  }, {
    key: 'onDoubleTap',
    value: function onDoubleTap(event) {
      var pointer = this.getPointer(event.center);
      this.selectionHandler._generateClickEvent('doubleClick', event, pointer);
    }

    /**
     * handle long tap event: multi select nodes
     * @private
     */

  }, {
    key: 'onHold',
    value: function onHold(event) {
      var pointer = this.getPointer(event.center);
      var multiselect = this.selectionHandler.options.multiselect;

      this.checkSelectionChanges(pointer, event, multiselect);

      this.selectionHandler._generateClickEvent('click', event, pointer);
      this.selectionHandler._generateClickEvent('hold', event, pointer);
    }

    /**
     * handle the release of the screen
     *
     * @private
     */

  }, {
    key: 'onRelease',
    value: function onRelease(event) {
      if (new Date().valueOf() - this.touchTime > 10) {
        var pointer = this.getPointer(event.center);
        this.selectionHandler._generateClickEvent('release', event, pointer);
        // to avoid double fireing of this event because we have two hammer instances. (on canvas and on frame)
        this.touchTime = new Date().valueOf();
      }
    }
  }, {
    key: 'onContext',
    value: function onContext(event) {
      var pointer = this.getPointer({ x: event.clientX, y: event.clientY });
      this.selectionHandler._generateClickEvent('oncontext', event, pointer);
    }

    /**
     *
     * @param pointer
     * @param add
     */

  }, {
    key: 'checkSelectionChanges',
    value: function checkSelectionChanges(pointer, event) {
      var add = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

      var previouslySelectedEdgeCount = this.selectionHandler._getSelectedEdgeCount();
      var previouslySelectedNodeCount = this.selectionHandler._getSelectedNodeCount();
      var previousSelection = this.selectionHandler.getSelection();
      var selected = void 0;
      if (add === true) {
        selected = this.selectionHandler.selectAdditionalOnPoint(pointer);
      } else {
        selected = this.selectionHandler.selectOnPoint(pointer);
      }
      var selectedEdgesCount = this.selectionHandler._getSelectedEdgeCount();
      var selectedNodesCount = this.selectionHandler._getSelectedNodeCount();
      var currentSelection = this.selectionHandler.getSelection();

      var _determineIfDifferent2 = this._determineIfDifferent(previousSelection, currentSelection);

      var nodesChanged = _determineIfDifferent2.nodesChanged;
      var edgesChanged = _determineIfDifferent2.edgesChanged;

      var nodeSelected = false;

      if (selectedNodesCount - previouslySelectedNodeCount > 0) {
        // node was selected
        this.selectionHandler._generateClickEvent('selectNode', event, pointer);
        selected = true;
        nodeSelected = true;
      } else if (nodesChanged === true && selectedNodesCount > 0) {
        this.selectionHandler._generateClickEvent('deselectNode', event, pointer, previousSelection);
        this.selectionHandler._generateClickEvent('selectNode', event, pointer);
        nodeSelected = true;
        selected = true;
      } else if (selectedNodesCount - previouslySelectedNodeCount < 0) {
        // node was deselected
        this.selectionHandler._generateClickEvent('deselectNode', event, pointer, previousSelection);
        selected = true;
      }

      // handle the selected edges
      if (selectedEdgesCount - previouslySelectedEdgeCount > 0 && nodeSelected === false) {
        // edge was selected
        this.selectionHandler._generateClickEvent('selectEdge', event, pointer);
        selected = true;
      } else if (selectedEdgesCount > 0 && edgesChanged === true) {
        this.selectionHandler._generateClickEvent('deselectEdge', event, pointer, previousSelection);
        this.selectionHandler._generateClickEvent('selectEdge', event, pointer);
        selected = true;
      } else if (selectedEdgesCount - previouslySelectedEdgeCount < 0) {
        // edge was deselected
        this.selectionHandler._generateClickEvent('deselectEdge', event, pointer, previousSelection);
        selected = true;
      }

      // fire the select event if anything has been selected or deselected
      if (selected === true) {
        // select or unselect
        this.selectionHandler._generateClickEvent('select', event, pointer);
      }
    }

    /**
     * This function checks if the nodes and edges previously selected have changed.
     * @param previousSelection
     * @param currentSelection
     * @returns {{nodesChanged: boolean, edgesChanged: boolean}}
     * @private
     */

  }, {
    key: '_determineIfDifferent',
    value: function _determineIfDifferent(previousSelection, currentSelection) {
      var nodesChanged = false;
      var edgesChanged = false;

      for (var i = 0; i < previousSelection.nodes.length; i++) {
        if (currentSelection.nodes.indexOf(previousSelection.nodes[i]) === -1) {
          nodesChanged = true;
        }
      }
      for (var _i = 0; _i < currentSelection.nodes.length; _i++) {
        if (previousSelection.nodes.indexOf(previousSelection.nodes[_i]) === -1) {
          nodesChanged = true;
        }
      }
      for (var _i2 = 0; _i2 < previousSelection.edges.length; _i2++) {
        if (currentSelection.edges.indexOf(previousSelection.edges[_i2]) === -1) {
          edgesChanged = true;
        }
      }
      for (var _i3 = 0; _i3 < currentSelection.edges.length; _i3++) {
        if (previousSelection.edges.indexOf(previousSelection.edges[_i3]) === -1) {
          edgesChanged = true;
        }
      }

      return { nodesChanged: nodesChanged, edgesChanged: edgesChanged };
    }

    /**
     * This function is called by onDragStart.
     * It is separated out because we can then overload it for the datamanipulation system.
     *
     * @private
     */

  }, {
    key: 'onDragStart',
    value: function onDragStart(event) {
      //in case the touch event was triggered on an external div, do the initial touch now.
      if (this.drag.pointer === undefined) {
        this.onTouch(event);
      }

      // note: drag.pointer is set in onTouch to get the initial touch location
      var node = this.selectionHandler.getNodeAt(this.drag.pointer);

      this.drag.dragging = true;
      this.drag.selection = [];
      this.drag.translation = util.extend({}, this.body.view.translation); // copy the object
      this.drag.nodeId = undefined;

      if (node !== undefined && this.options.dragNodes === true) {
        this.drag.nodeId = node.id;
        // select the clicked node if not yet selected
        if (node.isSelected() === false) {
          this.selectionHandler.unselectAll();
          this.selectionHandler.selectObject(node);
        }

        // after select to contain the node
        this.selectionHandler._generateClickEvent('dragStart', event, this.drag.pointer);

        var selection = this.selectionHandler.selectionObj.nodes;
        // create an array with the selected nodes and their original location and status
        for (var nodeId in selection) {
          if (selection.hasOwnProperty(nodeId)) {
            var object = selection[nodeId];
            var s = {
              id: object.id,
              node: object,

              // store original x, y, xFixed and yFixed, make the node temporarily Fixed
              x: object.x,
              y: object.y,
              xFixed: object.options.fixed.x,
              yFixed: object.options.fixed.y
            };

            object.options.fixed.x = true;
            object.options.fixed.y = true;

            this.drag.selection.push(s);
          }
        }
      } else {
        // fallback if no node is selected and thus the view is dragged.
        this.selectionHandler._generateClickEvent('dragStart', event, this.drag.pointer, undefined, true);
      }
    }

    /**
     * handle drag event
     * @private
     */

  }, {
    key: 'onDrag',
    value: function onDrag(event) {
      var _this2 = this;

      if (this.drag.pinched === true) {
        return;
      }

      // remove the focus on node if it is focussed on by the focusOnNode
      this.body.emitter.emit('unlockNode');

      var pointer = this.getPointer(event.center);

      var selection = this.drag.selection;
      if (selection && selection.length && this.options.dragNodes === true) {
        (function () {
          _this2.selectionHandler._generateClickEvent('dragging', event, pointer);

          // calculate delta's and new location
          var deltaX = pointer.x - _this2.drag.pointer.x;
          var deltaY = pointer.y - _this2.drag.pointer.y;

          // update position of all selected nodes
          selection.forEach(function (selection) {
            var node = selection.node;
            // only move the node if it was not fixed initially
            if (selection.xFixed === false) {
              node.x = _this2.canvas._XconvertDOMtoCanvas(_this2.canvas._XconvertCanvasToDOM(selection.x) + deltaX);
            }
            // only move the node if it was not fixed initially
            if (selection.yFixed === false) {
              node.y = _this2.canvas._YconvertDOMtoCanvas(_this2.canvas._YconvertCanvasToDOM(selection.y) + deltaY);
            }
          });

          // start the simulation of the physics
          _this2.body.emitter.emit('startSimulation');
        })();
      } else {
        // move the network
        if (this.options.dragView === true) {
          this.selectionHandler._generateClickEvent('dragging', event, pointer, undefined, true);

          // if the drag was not started properly because the click started outside the network div, start it now.
          if (this.drag.pointer === undefined) {
            this.onDragStart(event);
            return;
          }
          var diffX = pointer.x - this.drag.pointer.x;
          var diffY = pointer.y - this.drag.pointer.y;

          this.body.view.translation = { x: this.drag.translation.x + diffX, y: this.drag.translation.y + diffY };
          this.body.emitter.emit('_redraw');
        }
      }
    }

    /**
     * handle drag start event
     * @private
     */

  }, {
    key: 'onDragEnd',
    value: function onDragEnd(event) {
      this.drag.dragging = false;
      var selection = this.drag.selection;
      if (selection && selection.length) {
        selection.forEach(function (s) {
          // restore original xFixed and yFixed
          s.node.options.fixed.x = s.xFixed;
          s.node.options.fixed.y = s.yFixed;
        });
        this.selectionHandler._generateClickEvent('dragEnd', event, this.getPointer(event.center));
        this.body.emitter.emit('startSimulation');
      } else {
        this.selectionHandler._generateClickEvent('dragEnd', event, this.getPointer(event.center), undefined, true);
        this.body.emitter.emit('_requestRedraw');
      }
    }

    /**
     * Handle pinch event
     * @param event
     * @private
     */

  }, {
    key: 'onPinch',
    value: function onPinch(event) {
      var pointer = this.getPointer(event.center);

      this.drag.pinched = true;
      if (this.pinch['scale'] === undefined) {
        this.pinch.scale = 1;
      }

      // TODO: enabled moving while pinching?
      var scale = this.pinch.scale * event.scale;
      this.zoom(scale, pointer);
    }

    /**
     * Zoom the network in or out
     * @param {Number} scale a number around 1, and between 0.01 and 10
     * @param {{x: Number, y: Number}} pointer    Position on screen
     * @return {Number} appliedScale    scale is limited within the boundaries
     * @private
     */

  }, {
    key: 'zoom',
    value: function zoom(scale, pointer) {
      if (this.options.zoomView === true) {
        var scaleOld = this.body.view.scale;
        if (scale < 0.00001) {
          scale = 0.00001;
        }
        if (scale > 10) {
          scale = 10;
        }

        var preScaleDragPointer = undefined;
        if (this.drag !== undefined) {
          if (this.drag.dragging === true) {
            preScaleDragPointer = this.canvas.DOMtoCanvas(this.drag.pointer);
          }
        }
        // + this.canvas.frame.canvas.clientHeight / 2
        var translation = this.body.view.translation;

        var scaleFrac = scale / scaleOld;
        var tx = (1 - scaleFrac) * pointer.x + translation.x * scaleFrac;
        var ty = (1 - scaleFrac) * pointer.y + translation.y * scaleFrac;

        this.body.view.scale = scale;
        this.body.view.translation = { x: tx, y: ty };

        if (preScaleDragPointer != undefined) {
          var postScaleDragPointer = this.canvas.canvasToDOM(preScaleDragPointer);
          this.drag.pointer.x = postScaleDragPointer.x;
          this.drag.pointer.y = postScaleDragPointer.y;
        }

        this.body.emitter.emit('_requestRedraw');

        if (scaleOld < scale) {
          this.body.emitter.emit('zoom', { direction: '+', scale: this.body.view.scale });
        } else {
          this.body.emitter.emit('zoom', { direction: '-', scale: this.body.view.scale });
        }
      }
    }

    /**
     * Event handler for mouse wheel event, used to zoom the timeline
     * See http://adomas.org/javascript-mouse-wheel/
     *     https://github.com/EightMedia/hammer.js/issues/256
     * @param {MouseEvent}  event
     * @private
     */

  }, {
    key: 'onMouseWheel',
    value: function onMouseWheel(event) {
      if (this.options.zoomView === true) {
        // retrieve delta
        var delta = 0;
        if (event.wheelDelta) {
          /* IE/Opera. */
          delta = event.wheelDelta / 120;
        } else if (event.detail) {
          /* Mozilla case. */
          // In Mozilla, sign of delta is different than in IE.
          // Also, delta is multiple of 3.
          delta = -event.detail / 3;
        }

        // If delta is nonzero, handle it.
        // Basically, delta is now positive if wheel was scrolled up,
        // and negative, if wheel was scrolled down.
        if (delta !== 0) {

          // calculate the new scale
          var scale = this.body.view.scale;
          var zoom = delta / 10;
          if (delta < 0) {
            zoom = zoom / (1 - zoom);
          }
          scale *= 1 + zoom;

          // calculate the pointer location
          var pointer = this.getPointer({ x: event.clientX, y: event.clientY });

          // apply the new scale
          this.zoom(scale, pointer);
        }

        // Prevent default actions caused by mouse wheel.
        event.preventDefault();
      }
    }

    /**
     * Mouse move handler for checking whether the title moves over a node with a title.
     * @param  {Event} event
     * @private
     */

  }, {
    key: 'onMouseMove',
    value: function onMouseMove(event) {
      var _this3 = this;

      var pointer = this.getPointer({ x: event.clientX, y: event.clientY });
      var popupVisible = false;

      // check if the previously selected node is still selected
      if (this.popup !== undefined) {
        if (this.popup.hidden === false) {
          this._checkHidePopup(pointer);
        }

        // if the popup was not hidden above
        if (this.popup.hidden === false) {
          popupVisible = true;
          this.popup.setPosition(pointer.x + 3, pointer.y - 5);
          this.popup.show();
        }
      }

      // if we bind the keyboard to the div, we have to highlight it to use it. This highlights it on mouse over.
      if (this.options.keyboard.bindToWindow === false && this.options.keyboard.enabled === true) {
        this.canvas.frame.focus();
      }

      // start a timeout that will check if the mouse is positioned above an element
      if (popupVisible === false) {
        if (this.popupTimer !== undefined) {
          clearInterval(this.popupTimer); // stop any running calculationTimer
          this.popupTimer = undefined;
        }
        if (!this.drag.dragging) {
          this.popupTimer = setTimeout(function () {
            return _this3._checkShowPopup(pointer);
          }, this.options.tooltipDelay);
        }
      }

      /**
      * Adding hover highlights
      */
      if (this.options.hover === true) {
        // adding hover highlights
        var obj = this.selectionHandler.getNodeAt(pointer);
        if (obj === undefined) {
          obj = this.selectionHandler.getEdgeAt(pointer);
        }
        this.selectionHandler.hoverObject(obj);
      }
    }

    /**
     * Check if there is an element on the given position in the network
     * (a node or edge). If so, and if this element has a title,
     * show a popup window with its title.
     *
     * @param {{x:Number, y:Number}} pointer
     * @private
     */

  }, {
    key: '_checkShowPopup',
    value: function _checkShowPopup(pointer) {
      var x = this.canvas._XconvertDOMtoCanvas(pointer.x);
      var y = this.canvas._YconvertDOMtoCanvas(pointer.y);
      var pointerObj = {
        left: x,
        top: y,
        right: x,
        bottom: y
      };

      var previousPopupObjId = this.popupObj === undefined ? undefined : this.popupObj.id;
      var nodeUnderCursor = false;
      var popupType = 'node';

      // check if a node is under the cursor.
      if (this.popupObj === undefined) {
        // search the nodes for overlap, select the top one in case of multiple nodes
        var nodeIndices = this.body.nodeIndices;
        var nodes = this.body.nodes;
        var node = void 0;
        var overlappingNodes = [];
        for (var i = 0; i < nodeIndices.length; i++) {
          node = nodes[nodeIndices[i]];
          if (node.isOverlappingWith(pointerObj) === true) {
            if (node.getTitle() !== undefined) {
              overlappingNodes.push(nodeIndices[i]);
            }
          }
        }

        if (overlappingNodes.length > 0) {
          // if there are overlapping nodes, select the last one, this is the one which is drawn on top of the others
          this.popupObj = nodes[overlappingNodes[overlappingNodes.length - 1]];
          // if you hover over a node, the title of the edge is not supposed to be shown.
          nodeUnderCursor = true;
        }
      }

      if (this.popupObj === undefined && nodeUnderCursor === false) {
        // search the edges for overlap
        var edgeIndices = this.body.edgeIndices;
        var edges = this.body.edges;
        var edge = void 0;
        var overlappingEdges = [];
        for (var _i4 = 0; _i4 < edgeIndices.length; _i4++) {
          edge = edges[edgeIndices[_i4]];
          if (edge.isOverlappingWith(pointerObj) === true) {
            if (edge.connected === true && edge.getTitle() !== undefined) {
              overlappingEdges.push(edgeIndices[_i4]);
            }
          }
        }

        if (overlappingEdges.length > 0) {
          this.popupObj = edges[overlappingEdges[overlappingEdges.length - 1]];
          popupType = 'edge';
        }
      }

      if (this.popupObj !== undefined) {
        // show popup message window
        if (this.popupObj.id !== previousPopupObjId) {
          if (this.popup === undefined) {
            this.popup = new _Popup2.default(this.canvas.frame);
          }

          this.popup.popupTargetType = popupType;
          this.popup.popupTargetId = this.popupObj.id;

          // adjust a small offset such that the mouse cursor is located in the
          // bottom left location of the popup, and you can easily move over the
          // popup area
          this.popup.setPosition(pointer.x + 3, pointer.y - 5);
          this.popup.setText(this.popupObj.getTitle());
          this.popup.show();
          this.body.emitter.emit('showPopup', this.popupObj.id);
        }
      } else {
        if (this.popup !== undefined) {
          this.popup.hide();
          this.body.emitter.emit('hidePopup');
        }
      }
    }

    /**
     * Check if the popup must be hidden, which is the case when the mouse is no
     * longer hovering on the object
     * @param {{x:Number, y:Number}} pointer
     * @private
     */

  }, {
    key: '_checkHidePopup',
    value: function _checkHidePopup(pointer) {
      var pointerObj = this.selectionHandler._pointerToPositionObject(pointer);

      var stillOnObj = false;
      if (this.popup.popupTargetType === 'node') {
        if (this.body.nodes[this.popup.popupTargetId] !== undefined) {
          stillOnObj = this.body.nodes[this.popup.popupTargetId].isOverlappingWith(pointerObj);

          // if the mouse is still one the node, we have to check if it is not also on one that is drawn on top of it.
          // we initially only check stillOnObj because this is much faster.
          if (stillOnObj === true) {
            var overNode = this.selectionHandler.getNodeAt(pointer);
            stillOnObj = overNode.id === this.popup.popupTargetId;
          }
        }
      } else {
        if (this.selectionHandler.getNodeAt(pointer) === undefined) {
          if (this.body.edges[this.popup.popupTargetId] !== undefined) {
            stillOnObj = this.body.edges[this.popup.popupTargetId].isOverlappingWith(pointerObj);
          }
        }
      }

      if (stillOnObj === false) {
        this.popupObj = undefined;
        this.popup.hide();
        this.body.emitter.emit('hidePopup');
      }
    }
  }]);

  return InteractionHandler;
}();

exports.default = InteractionHandler;