'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Node = require('./components/Node');

var _Node2 = _interopRequireDefault(_Node);

var _Label = require('./components/shared/Label');

var _Label2 = _interopRequireDefault(_Label);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var util = require("../../util");
var DataSet = require('../../DataSet');
var DataView = require('../../DataView');

var NodesHandler = function () {
  function NodesHandler(body, images, groups, layoutEngine) {
    var _this = this;

    _classCallCheck(this, NodesHandler);

    this.body = body;
    this.images = images;
    this.groups = groups;
    this.layoutEngine = layoutEngine;

    // create the node API in the body container
    this.body.functions.createNode = this.create.bind(this);

    this.nodesListeners = {
      add: function add(event, params) {
        _this.add(params.items);
      },
      update: function update(event, params) {
        _this.update(params.items, params.data);
      },
      remove: function remove(event, params) {
        _this.remove(params.items);
      }
    };

    this.options = {};
    this.defaultOptions = {
      borderWidth: 1,
      borderWidthSelected: 2,
      brokenImage: undefined,
      color: {
        border: '#2B7CE9',
        background: '#97C2FC',
        highlight: {
          border: '#2B7CE9',
          background: '#D2E5FF'
        },
        hover: {
          border: '#2B7CE9',
          background: '#D2E5FF'
        }
      },
      fixed: {
        x: false,
        y: false
      },
      font: {
        color: '#343434',
        size: 14, // px
        face: 'arial',
        background: 'none',
        strokeWidth: 0, // px
        strokeColor: '#ffffff',
        align: 'center'
      },
      group: undefined,
      hidden: false,
      icon: {
        face: 'FontAwesome', //'FontAwesome',
        code: undefined, //'\uf007',
        size: 50, //50,
        color: '#2B7CE9' //'#aa00ff'
      },
      image: undefined, // --> URL
      label: undefined,
      labelHighlightBold: true,
      level: undefined,
      mass: 1,
      physics: true,
      scaling: {
        min: 10,
        max: 30,
        label: {
          enabled: false,
          min: 14,
          max: 30,
          maxVisible: 30,
          drawThreshold: 5
        },
        customScalingFunction: function customScalingFunction(min, max, total, value) {
          if (max === min) {
            return 0.5;
          } else {
            var scale = 1 / (max - min);
            return Math.max(0, (value - min) * scale);
          }
        }
      },
      shadow: {
        enabled: false,
        color: 'rgba(0,0,0,0.5)',
        size: 10,
        x: 5,
        y: 5
      },
      shape: 'ellipse',
      shapeProperties: {
        borderDashes: false, // only for borders
        borderRadius: 6, // only for box shape
        interpolation: true, // only for image and circularImage shapes
        useImageSize: false, // only for image and circularImage shapes
        useBorderWithImage: false // only for image shape
      },
      size: 25,
      title: undefined,
      value: undefined,
      x: undefined,
      y: undefined
    };
    util.extend(this.options, this.defaultOptions);

    this.bindEventListeners();
  }

  _createClass(NodesHandler, [{
    key: 'bindEventListeners',
    value: function bindEventListeners() {
      var _this2 = this;

      // refresh the nodes. Used when reverting from hierarchical layout
      this.body.emitter.on('refreshNodes', this.refresh.bind(this));
      this.body.emitter.on('refresh', this.refresh.bind(this));
      this.body.emitter.on('destroy', function () {
        util.forEach(_this2.nodesListeners, function (callback, event) {
          if (_this2.body.data.nodes) _this2.body.data.nodes.off(event, callback);
        });
        delete _this2.body.functions.createNode;
        delete _this2.nodesListeners.add;
        delete _this2.nodesListeners.update;
        delete _this2.nodesListeners.remove;
        delete _this2.nodesListeners;
      });
    }
  }, {
    key: 'setOptions',
    value: function setOptions(options) {
      if (options !== undefined) {
        _Node2.default.parseOptions(this.options, options);

        // update the shape in all nodes
        if (options.shape !== undefined) {
          for (var nodeId in this.body.nodes) {
            if (this.body.nodes.hasOwnProperty(nodeId)) {
              this.body.nodes[nodeId].updateShape();
            }
          }
        }

        // update the font in all nodes
        if (options.font !== undefined) {
          _Label2.default.parseOptions(this.options.font, options);
          for (var _nodeId in this.body.nodes) {
            if (this.body.nodes.hasOwnProperty(_nodeId)) {
              this.body.nodes[_nodeId].updateLabelModule();
              this.body.nodes[_nodeId]._reset();
            }
          }
        }

        // update the shape size in all nodes
        if (options.size !== undefined) {
          for (var _nodeId2 in this.body.nodes) {
            if (this.body.nodes.hasOwnProperty(_nodeId2)) {
              this.body.nodes[_nodeId2]._reset();
            }
          }
        }

        // update the state of the letiables if needed
        if (options.hidden !== undefined || options.physics !== undefined) {
          this.body.emitter.emit('_dataChanged');
        }
      }
    }

    /**
     * Set a data set with nodes for the network
     * @param {Array | DataSet | DataView} nodes         The data containing the nodes.
     * @private
     */

  }, {
    key: 'setData',
    value: function setData(nodes) {
      var _this3 = this;

      var doNotEmit = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

      var oldNodesData = this.body.data.nodes;

      if (nodes instanceof DataSet || nodes instanceof DataView) {
        this.body.data.nodes = nodes;
      } else if (Array.isArray(nodes)) {
        this.body.data.nodes = new DataSet();
        this.body.data.nodes.add(nodes);
      } else if (!nodes) {
        this.body.data.nodes = new DataSet();
      } else {
        throw new TypeError('Array or DataSet expected');
      }

      if (oldNodesData) {
        // unsubscribe from old dataset
        util.forEach(this.nodesListeners, function (callback, event) {
          oldNodesData.off(event, callback);
        });
      }

      // remove drawn nodes
      this.body.nodes = {};

      if (this.body.data.nodes) {
        (function () {
          // subscribe to new dataset
          var me = _this3;
          util.forEach(_this3.nodesListeners, function (callback, event) {
            me.body.data.nodes.on(event, callback);
          });

          // draw all new nodes
          var ids = _this3.body.data.nodes.getIds();
          _this3.add(ids, true);
        })();
      }

      if (doNotEmit === false) {
        this.body.emitter.emit("_dataChanged");
      }
    }

    /**
     * Add nodes
     * @param {Number[] | String[]} ids
     * @private
     */

  }, {
    key: 'add',
    value: function add(ids) {
      var doNotEmit = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

      var id = void 0;
      var newNodes = [];
      for (var i = 0; i < ids.length; i++) {
        id = ids[i];
        var properties = this.body.data.nodes.get(id);
        var node = this.create(properties);
        newNodes.push(node);
        this.body.nodes[id] = node; // note: this may replace an existing node
      }

      this.layoutEngine.positionInitially(newNodes);

      if (doNotEmit === false) {
        this.body.emitter.emit("_dataChanged");
      }
    }

    /**
     * Update existing nodes, or create them when not yet existing
     * @param {Number[] | String[]} ids
     * @private
     */

  }, {
    key: 'update',
    value: function update(ids, changedData) {
      var nodes = this.body.nodes;
      var dataChanged = false;
      for (var i = 0; i < ids.length; i++) {
        var id = ids[i];
        var node = nodes[id];
        var data = changedData[i];
        if (node !== undefined) {
          // update node
          dataChanged = node.setOptions(data);
        } else {
          dataChanged = true;
          // create node
          node = this.create(data);
          nodes[id] = node;
        }
      }
      if (dataChanged === true) {
        this.body.emitter.emit("_dataChanged");
      } else {
        this.body.emitter.emit("_dataUpdated");
      }
    }

    /**
     * Remove existing nodes. If nodes do not exist, the method will just ignore it.
     * @param {Number[] | String[]} ids
     * @private
     */

  }, {
    key: 'remove',
    value: function remove(ids) {
      var nodes = this.body.nodes;

      for (var i = 0; i < ids.length; i++) {
        var id = ids[i];
        delete nodes[id];
      }

      this.body.emitter.emit("_dataChanged");
    }

    /**
     * create a node
     * @param properties
     * @param constructorClass
     */

  }, {
    key: 'create',
    value: function create(properties) {
      var constructorClass = arguments.length <= 1 || arguments[1] === undefined ? _Node2.default : arguments[1];

      return new constructorClass(properties, this.body, this.images, this.groups, this.options);
    }
  }, {
    key: 'refresh',
    value: function refresh() {
      var clearPositions = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

      var nodes = this.body.nodes;
      for (var nodeId in nodes) {
        var node = undefined;
        if (nodes.hasOwnProperty(nodeId)) {
          node = nodes[nodeId];
        }
        var data = this.body.data.nodes._data[nodeId];
        if (node !== undefined && data !== undefined) {
          if (clearPositions === true) {
            node.setOptions({ x: null, y: null });
          }
          node.setOptions({ fixed: false });
          node.setOptions(data);
        }
      }
    }

    /**
     * Returns the positions of the nodes.
     * @param ids  --> optional, can be array of nodeIds, can be string
     * @returns {{}}
     */

  }, {
    key: 'getPositions',
    value: function getPositions(ids) {
      var dataArray = {};
      if (ids !== undefined) {
        if (Array.isArray(ids) === true) {
          for (var i = 0; i < ids.length; i++) {
            if (this.body.nodes[ids[i]] !== undefined) {
              var node = this.body.nodes[ids[i]];
              dataArray[ids[i]] = { x: Math.round(node.x), y: Math.round(node.y) };
            }
          }
        } else {
          if (this.body.nodes[ids] !== undefined) {
            var _node = this.body.nodes[ids];
            dataArray[ids] = { x: Math.round(_node.x), y: Math.round(_node.y) };
          }
        }
      } else {
        for (var _i = 0; _i < this.body.nodeIndices.length; _i++) {
          var _node2 = this.body.nodes[this.body.nodeIndices[_i]];
          dataArray[this.body.nodeIndices[_i]] = { x: Math.round(_node2.x), y: Math.round(_node2.y) };
        }
      }
      return dataArray;
    }

    /**
     * Load the XY positions of the nodes into the dataset.
     */

  }, {
    key: 'storePositions',
    value: function storePositions() {
      // todo: add support for clusters and hierarchical.
      var dataArray = [];
      var dataset = this.body.data.nodes.getDataSet();

      for (var nodeId in dataset._data) {
        if (dataset._data.hasOwnProperty(nodeId)) {
          var node = this.body.nodes[nodeId];
          if (dataset._data[nodeId].x != Math.round(node.x) || dataset._data[nodeId].y != Math.round(node.y)) {
            dataArray.push({ id: node.id, x: Math.round(node.x), y: Math.round(node.y) });
          }
        }
      }
      dataset.update(dataArray);
    }

    /**
     * get the bounding box of a node.
     * @param nodeId
     * @returns {j|*}
     */

  }, {
    key: 'getBoundingBox',
    value: function getBoundingBox(nodeId) {
      if (this.body.nodes[nodeId] !== undefined) {
        return this.body.nodes[nodeId].shape.boundingBox;
      }
    }

    /**
     * Get the Ids of nodes connected to this node.
     * @param nodeId
     * @returns {Array}
     */

  }, {
    key: 'getConnectedNodes',
    value: function getConnectedNodes(nodeId) {
      var nodeList = [];
      if (this.body.nodes[nodeId] !== undefined) {
        var node = this.body.nodes[nodeId];
        var nodeObj = {}; // used to quickly check if node already exists
        for (var i = 0; i < node.edges.length; i++) {
          var edge = node.edges[i];
          if (edge.toId == node.id) {
            // these are double equals since ids can be numeric or string
            if (nodeObj[edge.fromId] === undefined) {
              nodeList.push(edge.fromId);
              nodeObj[edge.fromId] = true;
            }
          } else if (edge.fromId == node.id) {
            // these are double equals since ids can be numeric or string
            if (nodeObj[edge.toId] === undefined) {
              nodeList.push(edge.toId);
              nodeObj[edge.toId] = true;
            }
          }
        }
      }
      return nodeList;
    }

    /**
     * Get the ids of the edges connected to this node.
     * @param nodeId
     * @returns {*}
     */

  }, {
    key: 'getConnectedEdges',
    value: function getConnectedEdges(nodeId) {
      var edgeList = [];
      if (this.body.nodes[nodeId] !== undefined) {
        var node = this.body.nodes[nodeId];
        for (var i = 0; i < node.edges.length; i++) {
          edgeList.push(node.edges[i].id);
        }
      } else {
        console.log("NodeId provided for getConnectedEdges does not exist. Provided: ", nodeId);
      }
      return edgeList;
    }

    /**
     * Move a node.
     * @param String nodeId
     * @param Number x
     * @param Number y
     */

  }, {
    key: 'moveNode',
    value: function moveNode(nodeId, x, y) {
      var _this4 = this;

      if (this.body.nodes[nodeId] !== undefined) {
        this.body.nodes[nodeId].x = Number(x);
        this.body.nodes[nodeId].y = Number(y);
        setTimeout(function () {
          _this4.body.emitter.emit("startSimulation");
        }, 0);
      } else {
        console.log("Node id supplied to moveNode does not exist. Provided: ", nodeId);
      }
    }
  }]);

  return NodesHandler;
}();

exports.default = NodesHandler;