'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Edge = require('./components/Edge');

var _Edge2 = _interopRequireDefault(_Edge);

var _Label = require('./components/shared/Label');

var _Label2 = _interopRequireDefault(_Label);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var util = require("../../util");
var DataSet = require('../../DataSet');
var DataView = require('../../DataView');

var EdgesHandler = function () {
  function EdgesHandler(body, images, groups) {
    var _this = this;

    _classCallCheck(this, EdgesHandler);

    this.body = body;
    this.images = images;
    this.groups = groups;

    // create the edge API in the body container
    this.body.functions.createEdge = this.create.bind(this);

    this.edgesListeners = {
      add: function add(event, params) {
        _this.add(params.items);
      },
      update: function update(event, params) {
        _this.update(params.items);
      },
      remove: function remove(event, params) {
        _this.remove(params.items);
      }
    };

    this.options = {};
    this.defaultOptions = {
      arrows: {
        to: { enabled: false, scaleFactor: 1 }, // boolean / {arrowScaleFactor:1} / {enabled: false, arrowScaleFactor:1}
        middle: { enabled: false, scaleFactor: 1 },
        from: { enabled: false, scaleFactor: 1 }
      },
      arrowStrikethrough: true,
      color: {
        color: '#848484',
        highlight: '#848484',
        hover: '#848484',
        inherit: 'from',
        opacity: 1.0
      },
      dashes: false,
      font: {
        color: '#343434',
        size: 14, // px
        face: 'arial',
        background: 'none',
        strokeWidth: 2, // px
        strokeColor: '#ffffff',
        align: 'horizontal'
      },
      hidden: false,
      hoverWidth: 1.5,
      label: undefined,
      labelHighlightBold: true,
      length: undefined,
      physics: true,
      scaling: {
        min: 1,
        max: 15,
        label: {
          enabled: true,
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
      selectionWidth: 1.5,
      selfReferenceSize: 20,
      shadow: {
        enabled: false,
        color: 'rgba(0,0,0,0.5)',
        size: 10,
        x: 5,
        y: 5
      },
      smooth: {
        enabled: true,
        type: "dynamic",
        forceDirection: 'none',
        roundness: 0.5
      },
      title: undefined,
      width: 1,
      value: undefined
    };

    util.extend(this.options, this.defaultOptions);

    this.bindEventListeners();
  }

  _createClass(EdgesHandler, [{
    key: 'bindEventListeners',
    value: function bindEventListeners() {
      var _this2 = this;

      // this allows external modules to force all dynamic curves to turn static.
      this.body.emitter.on("_forceDisableDynamicCurves", function (type) {
        if (type === 'dynamic') {
          type = 'continuous';
        }
        var emitChange = false;
        for (var edgeId in _this2.body.edges) {
          if (_this2.body.edges.hasOwnProperty(edgeId)) {
            var edge = _this2.body.edges[edgeId];
            var edgeData = _this2.body.data.edges._data[edgeId];

            // only forcibly remove the smooth curve if the data has been set of the edge has the smooth curves defined.
            // this is because a change in the global would not affect these curves.
            if (edgeData !== undefined) {
              var edgeOptions = edgeData.smooth;
              if (edgeOptions !== undefined) {
                if (edgeOptions.enabled === true && edgeOptions.type === 'dynamic') {
                  if (type === undefined) {
                    edge.setOptions({ smooth: false });
                  } else {
                    edge.setOptions({ smooth: { type: type } });
                  }
                  emitChange = true;
                }
              }
            }
          }
        }
        if (emitChange === true) {
          _this2.body.emitter.emit("_dataChanged");
        }
      });

      // this is called when options of EXISTING nodes or edges have changed.
      this.body.emitter.on("_dataUpdated", function () {
        _this2.reconnectEdges();
        _this2.markAllEdgesAsDirty();
      });

      // refresh the edges. Used when reverting from hierarchical layout
      this.body.emitter.on("refreshEdges", this.refresh.bind(this));
      this.body.emitter.on("refresh", this.refresh.bind(this));
      this.body.emitter.on("destroy", function () {
        util.forEach(_this2.edgesListeners, function (callback, event) {
          if (_this2.body.data.edges) _this2.body.data.edges.off(event, callback);
        });
        delete _this2.body.functions.createEdge;
        delete _this2.edgesListeners.add;
        delete _this2.edgesListeners.update;
        delete _this2.edgesListeners.remove;
        delete _this2.edgesListeners;
      });
    }
  }, {
    key: 'setOptions',
    value: function setOptions(options) {
      if (options !== undefined) {
        // use the parser from the Edge class to fill in all shorthand notations
        _Edge2.default.parseOptions(this.options, options);

        // handle multiple input cases for color
        if (options.color !== undefined) {
          this.markAllEdgesAsDirty();
        }

        // update smooth settings in all edges
        var dataChanged = false;
        if (options.smooth !== undefined) {
          for (var edgeId in this.body.edges) {
            if (this.body.edges.hasOwnProperty(edgeId)) {
              dataChanged = this.body.edges[edgeId].updateEdgeType() || dataChanged;
            }
          }
        }

        // update fonts in all edges
        if (options.font !== undefined) {
          // use the parser from the Label class to fill in all shorthand notations
          _Label2.default.parseOptions(this.options.font, options);
          for (var _edgeId in this.body.edges) {
            if (this.body.edges.hasOwnProperty(_edgeId)) {
              this.body.edges[_edgeId].updateLabelModule();
            }
          }
        }

        // update the state of the variables if needed
        if (options.hidden !== undefined || options.physics !== undefined || dataChanged === true) {
          this.body.emitter.emit('_dataChanged');
        }
      }
    }

    /**
     * Load edges by reading the data table
     * @param {Array | DataSet | DataView} edges    The data containing the edges.
     * @private
     * @private
     */

  }, {
    key: 'setData',
    value: function setData(edges) {
      var _this3 = this;

      var doNotEmit = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

      var oldEdgesData = this.body.data.edges;

      if (edges instanceof DataSet || edges instanceof DataView) {
        this.body.data.edges = edges;
      } else if (Array.isArray(edges)) {
        this.body.data.edges = new DataSet();
        this.body.data.edges.add(edges);
      } else if (!edges) {
        this.body.data.edges = new DataSet();
      } else {
        throw new TypeError('Array or DataSet expected');
      }

      // TODO: is this null or undefined or false?
      if (oldEdgesData) {
        // unsubscribe from old dataset
        util.forEach(this.edgesListeners, function (callback, event) {
          oldEdgesData.off(event, callback);
        });
      }

      // remove drawn edges
      this.body.edges = {};

      // TODO: is this null or undefined or false?
      if (this.body.data.edges) {
        // subscribe to new dataset
        util.forEach(this.edgesListeners, function (callback, event) {
          _this3.body.data.edges.on(event, callback);
        });

        // draw all new nodes
        var ids = this.body.data.edges.getIds();
        this.add(ids, true);
      }

      if (doNotEmit === false) {
        this.body.emitter.emit("_dataChanged");
      }
    }

    /**
     * Add edges
     * @param {Number[] | String[]} ids
     * @private
     */

  }, {
    key: 'add',
    value: function add(ids) {
      var doNotEmit = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

      var edges = this.body.edges;
      var edgesData = this.body.data.edges;

      for (var i = 0; i < ids.length; i++) {
        var id = ids[i];

        var oldEdge = edges[id];
        if (oldEdge) {
          oldEdge.disconnect();
        }

        var data = edgesData.get(id, { "showInternalIds": true });
        edges[id] = this.create(data);
      }

      if (doNotEmit === false) {
        this.body.emitter.emit("_dataChanged");
      }
    }

    /**
     * Update existing edges, or create them when not yet existing
     * @param {Number[] | String[]} ids
     * @private
     */

  }, {
    key: 'update',
    value: function update(ids) {
      var edges = this.body.edges;
      var edgesData = this.body.data.edges;
      var dataChanged = false;
      for (var i = 0; i < ids.length; i++) {
        var id = ids[i];
        var data = edgesData.get(id);
        var edge = edges[id];
        if (edge !== undefined) {
          // update edge
          edge.disconnect();
          dataChanged = edge.setOptions(data) || dataChanged; // if a support node is added, data can be changed.
          edge.connect();
        } else {
          // create edge
          this.body.edges[id] = this.create(data);
          dataChanged = true;
        }
      }

      if (dataChanged === true) {
        this.body.emitter.emit("_dataChanged");
      } else {
        this.body.emitter.emit("_dataUpdated");
      }
    }

    /**
     * Remove existing edges. Non existing ids will be ignored
     * @param {Number[] | String[]} ids
     * @private
     */

  }, {
    key: 'remove',
    value: function remove(ids) {
      var edges = this.body.edges;
      for (var i = 0; i < ids.length; i++) {
        var id = ids[i];
        var edge = edges[id];
        if (edge !== undefined) {
          edge.cleanup();
          edge.disconnect();
          delete edges[id];
        }
      }

      this.body.emitter.emit("_dataChanged");
    }
  }, {
    key: 'refresh',
    value: function refresh() {
      var edges = this.body.edges;
      for (var edgeId in edges) {
        var edge = undefined;
        if (edges.hasOwnProperty(edgeId)) {
          edge = edges[edgeId];
        }
        var data = this.body.data.edges._data[edgeId];
        if (edge !== undefined && data !== undefined) {
          edge.setOptions(data);
        }
      }
    }
  }, {
    key: 'create',
    value: function create(properties) {
      return new _Edge2.default(properties, this.body, this.options);
    }
  }, {
    key: 'markAllEdgesAsDirty',
    value: function markAllEdgesAsDirty() {
      for (var edgeId in this.body.edges) {
        this.body.edges[edgeId].edgeType.colorDirty = true;
      }
    }

    /**
     * Reconnect all edges
     * @private
     */

  }, {
    key: 'reconnectEdges',
    value: function reconnectEdges() {
      var id;
      var nodes = this.body.nodes;
      var edges = this.body.edges;

      for (id in nodes) {
        if (nodes.hasOwnProperty(id)) {
          nodes[id].edges = [];
        }
      }

      for (id in edges) {
        if (edges.hasOwnProperty(id)) {
          var edge = edges[id];
          edge.from = null;
          edge.to = null;
          edge.connect();
        }
      }
    }
  }, {
    key: 'getConnectedNodes',
    value: function getConnectedNodes(edgeId) {
      var nodeList = [];
      if (this.body.edges[edgeId] !== undefined) {
        var edge = this.body.edges[edgeId];
        if (edge.fromId) {
          nodeList.push(edge.fromId);
        }
        if (edge.toId) {
          nodeList.push(edge.toId);
        }
      }
      return nodeList;
    }
  }]);

  return EdgesHandler;
}();

exports.default = EdgesHandler;