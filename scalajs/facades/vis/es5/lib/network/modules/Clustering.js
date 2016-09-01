'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _NetworkUtil = require('../NetworkUtil');

var _NetworkUtil2 = _interopRequireDefault(_NetworkUtil);

var _Cluster = require('./components/nodes/Cluster');

var _Cluster2 = _interopRequireDefault(_Cluster);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var util = require("../../util");

var ClusterEngine = function () {
  function ClusterEngine(body) {
    var _this = this;

    _classCallCheck(this, ClusterEngine);

    this.body = body;
    this.clusteredNodes = {};
    this.clusteredEdges = {};

    this.options = {};
    this.defaultOptions = {};
    util.extend(this.options, this.defaultOptions);

    this.body.emitter.on('_resetData', function () {
      _this.clusteredNodes = {};_this.clusteredEdges = {};
    });
  }

  _createClass(ClusterEngine, [{
    key: 'setOptions',
    value: function setOptions(options) {
      if (options !== undefined) {}
    }

    /**
    *
    * @param hubsize
    * @param options
    */

  }, {
    key: 'clusterByHubsize',
    value: function clusterByHubsize(hubsize, options) {
      if (hubsize === undefined) {
        hubsize = this._getHubSize();
      } else if ((typeof hubsize === 'undefined' ? 'undefined' : _typeof(hubsize)) === "object") {
        options = this._checkOptions(hubsize);
        hubsize = this._getHubSize();
      }

      var nodesToCluster = [];
      for (var i = 0; i < this.body.nodeIndices.length; i++) {
        var node = this.body.nodes[this.body.nodeIndices[i]];
        if (node.edges.length >= hubsize) {
          nodesToCluster.push(node.id);
        }
      }

      for (var _i = 0; _i < nodesToCluster.length; _i++) {
        this.clusterByConnection(nodesToCluster[_i], options, true);
      }

      this.body.emitter.emit('_dataChanged');
    }

    /**
    * loop over all nodes, check if they adhere to the condition and cluster if needed.
    * @param options
    * @param refreshData
    */

  }, {
    key: 'cluster',
    value: function cluster() {
      var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
      var refreshData = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

      if (options.joinCondition === undefined) {
        throw new Error("Cannot call clusterByNodeData without a joinCondition function in the options.");
      }

      // check if the options object is fine, append if needed
      options = this._checkOptions(options);

      var childNodesObj = {};
      var childEdgesObj = {};

      // collect the nodes that will be in the cluster
      for (var i = 0; i < this.body.nodeIndices.length; i++) {
        var nodeId = this.body.nodeIndices[i];
        var node = this.body.nodes[nodeId];
        var clonedOptions = _NetworkUtil2.default.cloneOptions(node);
        if (options.joinCondition(clonedOptions) === true) {
          childNodesObj[nodeId] = this.body.nodes[nodeId];

          // collect the nodes that will be in the cluster
          for (var _i2 = 0; _i2 < node.edges.length; _i2++) {
            var edge = node.edges[_i2];
            if (this.clusteredEdges[edge.id] === undefined) {
              childEdgesObj[edge.id] = edge;
            }
          }
        }
      }

      this._cluster(childNodesObj, childEdgesObj, options, refreshData);
    }

    /**
     * Cluster all nodes in the network that have only X edges
     * @param edgeCount
     * @param options
     * @param refreshData
     */

  }, {
    key: 'clusterByEdgeCount',
    value: function clusterByEdgeCount(edgeCount, options) {
      var refreshData = arguments.length <= 2 || arguments[2] === undefined ? true : arguments[2];

      options = this._checkOptions(options);
      var clusters = [];
      var usedNodes = {};
      var edge = void 0,
          edges = void 0,
          node = void 0,
          nodeId = void 0,
          relevantEdgeCount = void 0;
      // collect the nodes that will be in the cluster
      for (var i = 0; i < this.body.nodeIndices.length; i++) {
        var childNodesObj = {};
        var childEdgesObj = {};
        nodeId = this.body.nodeIndices[i];

        // if this node is already used in another cluster this session, we do not have to re-evaluate it.
        if (usedNodes[nodeId] === undefined) {
          relevantEdgeCount = 0;
          node = this.body.nodes[nodeId];
          edges = [];
          for (var j = 0; j < node.edges.length; j++) {
            edge = node.edges[j];
            if (this.clusteredEdges[edge.id] === undefined) {
              if (edge.toId !== edge.fromId) {
                relevantEdgeCount++;
              }
              edges.push(edge);
            }
          }

          // this node qualifies, we collect its neighbours to start the clustering process.
          if (relevantEdgeCount === edgeCount) {
            var gatheringSuccessful = true;
            for (var _j = 0; _j < edges.length; _j++) {
              edge = edges[_j];
              var childNodeId = this._getConnectedId(edge, nodeId);
              // add the nodes to the list by the join condition.
              if (options.joinCondition === undefined) {
                childEdgesObj[edge.id] = edge;
                childNodesObj[nodeId] = this.body.nodes[nodeId];
                childNodesObj[childNodeId] = this.body.nodes[childNodeId];
                usedNodes[nodeId] = true;
              } else {
                var clonedOptions = _NetworkUtil2.default.cloneOptions(this.body.nodes[nodeId]);
                if (options.joinCondition(clonedOptions) === true) {
                  childEdgesObj[edge.id] = edge;
                  childNodesObj[nodeId] = this.body.nodes[nodeId];
                  usedNodes[nodeId] = true;
                } else {
                  // this node does not qualify after all.
                  gatheringSuccessful = false;
                  break;
                }
              }
            }

            // add to the cluster queue
            if (Object.keys(childNodesObj).length > 0 && Object.keys(childEdgesObj).length > 0 && gatheringSuccessful === true) {
              clusters.push({ nodes: childNodesObj, edges: childEdgesObj });
            }
          }
        }
      }

      for (var _i3 = 0; _i3 < clusters.length; _i3++) {
        this._cluster(clusters[_i3].nodes, clusters[_i3].edges, options, false);
      }

      if (refreshData === true) {
        this.body.emitter.emit('_dataChanged');
      }
    }

    /**
    * Cluster all nodes in the network that have only 1 edge
    * @param options
    * @param refreshData
    */

  }, {
    key: 'clusterOutliers',
    value: function clusterOutliers(options) {
      var refreshData = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

      this.clusterByEdgeCount(1, options, refreshData);
    }

    /**
     * Cluster all nodes in the network that have only 2 edge
     * @param options
     * @param refreshData
     */

  }, {
    key: 'clusterBridges',
    value: function clusterBridges(options) {
      var refreshData = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

      this.clusterByEdgeCount(2, options, refreshData);
    }

    /**
    * suck all connected nodes of a node into the node.
    * @param nodeId
    * @param options
    * @param refreshData
    */

  }, {
    key: 'clusterByConnection',
    value: function clusterByConnection(nodeId, options) {
      var refreshData = arguments.length <= 2 || arguments[2] === undefined ? true : arguments[2];

      // kill conditions
      if (nodeId === undefined) {
        throw new Error("No nodeId supplied to clusterByConnection!");
      }
      if (this.body.nodes[nodeId] === undefined) {
        throw new Error("The nodeId given to clusterByConnection does not exist!");
      }

      var node = this.body.nodes[nodeId];
      options = this._checkOptions(options, node);
      if (options.clusterNodeProperties.x === undefined) {
        options.clusterNodeProperties.x = node.x;
      }
      if (options.clusterNodeProperties.y === undefined) {
        options.clusterNodeProperties.y = node.y;
      }
      if (options.clusterNodeProperties.fixed === undefined) {
        options.clusterNodeProperties.fixed = {};
        options.clusterNodeProperties.fixed.x = node.options.fixed.x;
        options.clusterNodeProperties.fixed.y = node.options.fixed.y;
      }

      var childNodesObj = {};
      var childEdgesObj = {};
      var parentNodeId = node.id;
      var parentClonedOptions = _NetworkUtil2.default.cloneOptions(node);
      childNodesObj[parentNodeId] = node;

      // collect the nodes that will be in the cluster
      for (var i = 0; i < node.edges.length; i++) {
        var edge = node.edges[i];
        if (this.clusteredEdges[edge.id] === undefined) {
          var childNodeId = this._getConnectedId(edge, parentNodeId);

          // if the child node is not in a cluster
          if (this.clusteredNodes[childNodeId] === undefined) {
            if (childNodeId !== parentNodeId) {
              if (options.joinCondition === undefined) {
                childEdgesObj[edge.id] = edge;
                childNodesObj[childNodeId] = this.body.nodes[childNodeId];
              } else {
                // clone the options and insert some additional parameters that could be interesting.
                var childClonedOptions = _NetworkUtil2.default.cloneOptions(this.body.nodes[childNodeId]);
                if (options.joinCondition(parentClonedOptions, childClonedOptions) === true) {
                  childEdgesObj[edge.id] = edge;
                  childNodesObj[childNodeId] = this.body.nodes[childNodeId];
                }
              }
            } else {
              // swallow the edge if it is self-referencing.
              childEdgesObj[edge.id] = edge;
            }
          }
        }
      }

      this._cluster(childNodesObj, childEdgesObj, options, refreshData);
    }

    /**
    * This function creates the edges that will be attached to the cluster
    * It looks for edges that are connected to the nodes from the "outside' of the cluster.
    *
    * @param childNodesObj
    * @param childEdgesObj
    * @param clusterNodeProperties
    * @param clusterEdgeProperties
    * @private
    */

  }, {
    key: '_createClusterEdges',
    value: function _createClusterEdges(childNodesObj, childEdgesObj, clusterNodeProperties, clusterEdgeProperties) {
      var edge = void 0,
          childNodeId = void 0,
          childNode = void 0,
          toId = void 0,
          fromId = void 0,
          otherNodeId = void 0;

      // loop over all child nodes and their edges to find edges going out of the cluster
      // these edges will be replaced by clusterEdges.
      var childKeys = Object.keys(childNodesObj);
      var createEdges = [];
      for (var i = 0; i < childKeys.length; i++) {
        childNodeId = childKeys[i];
        childNode = childNodesObj[childNodeId];

        // construct new edges from the cluster to others
        for (var j = 0; j < childNode.edges.length; j++) {
          edge = childNode.edges[j];
          // we only handle edges that are visible to the system, not the disabled ones from the clustering process.
          if (this.clusteredEdges[edge.id] === undefined) {
            // self-referencing edges will be added to the "hidden" list
            if (edge.toId == edge.fromId) {
              childEdgesObj[edge.id] = edge;
            } else {
              // set up the from and to.
              if (edge.toId == childNodeId) {
                // this is a double equals because ints and strings can be interchanged here.
                toId = clusterNodeProperties.id;
                fromId = edge.fromId;
                otherNodeId = fromId;
              } else {
                toId = edge.toId;
                fromId = clusterNodeProperties.id;
                otherNodeId = toId;
              }
            }

            // Only edges from the cluster outwards are being replaced.
            if (childNodesObj[otherNodeId] === undefined) {
              createEdges.push({ edge: edge, fromId: fromId, toId: toId });
            }
          }
        }
      }

      // here we actually create the replacement edges. We could not do this in the loop above as the creation process
      // would add an edge to the edges array we are iterating over.
      for (var _j2 = 0; _j2 < createEdges.length; _j2++) {
        var _edge = createEdges[_j2].edge;
        // copy the options of the edge we will replace
        var clonedOptions = _NetworkUtil2.default.cloneOptions(_edge, 'edge');
        // make sure the properties of clusterEdges are superimposed on it
        util.deepExtend(clonedOptions, clusterEdgeProperties);

        // set up the edge
        clonedOptions.from = createEdges[_j2].fromId;
        clonedOptions.to = createEdges[_j2].toId;
        clonedOptions.id = 'clusterEdge:' + util.randomUUID();
        //clonedOptions.id = '(cf: ' + createEdges[j].fromId + " to: " + createEdges[j].toId + ")" + Math.random();

        // create the edge and give a reference to the one it replaced.
        var newEdge = this.body.functions.createEdge(clonedOptions);
        newEdge.clusteringEdgeReplacingId = _edge.id;

        // connect the edge.
        this.body.edges[newEdge.id] = newEdge;
        newEdge.connect();

        // hide the replaced edge
        this._backupEdgeOptions(_edge);
        _edge.setOptions({ physics: false, hidden: true });
      }
    }

    /**
    * This function checks the options that can be supplied to the different cluster functions
    * for certain fields and inserts defaults if needed
    * @param options
    * @returns {*}
    * @private
    */

  }, {
    key: '_checkOptions',
    value: function _checkOptions() {
      var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      if (options.clusterEdgeProperties === undefined) {
        options.clusterEdgeProperties = {};
      }
      if (options.clusterNodeProperties === undefined) {
        options.clusterNodeProperties = {};
      }

      return options;
    }

    /**
    *
    * @param {Object}    childNodesObj         | object with node objects, id as keys, same as childNodes except it also contains a source node
    * @param {Object}    childEdgesObj         | object with edge objects, id as keys
    * @param {Array}     options               | object with {clusterNodeProperties, clusterEdgeProperties, processProperties}
    * @param {Boolean}   refreshData | when true, do not wrap up
    * @private
    */

  }, {
    key: '_cluster',
    value: function _cluster(childNodesObj, childEdgesObj, options) {
      var refreshData = arguments.length <= 3 || arguments[3] === undefined ? true : arguments[3];

      // kill condition: no children so can't cluster or only one node in the cluster, don't bother
      if (Object.keys(childNodesObj).length < 2) {
        return;
      }

      // check if this cluster call is not trying to cluster anything that is in another cluster.
      for (var nodeId in childNodesObj) {
        if (childNodesObj.hasOwnProperty(nodeId)) {
          if (this.clusteredNodes[nodeId] !== undefined) {
            return;
          }
        }
      }

      var clusterNodeProperties = util.deepExtend({}, options.clusterNodeProperties);

      // construct the clusterNodeProperties
      if (options.processProperties !== undefined) {
        // get the childNode options
        var childNodesOptions = [];
        for (var _nodeId in childNodesObj) {
          if (childNodesObj.hasOwnProperty(_nodeId)) {
            var clonedOptions = _NetworkUtil2.default.cloneOptions(childNodesObj[_nodeId]);
            childNodesOptions.push(clonedOptions);
          }
        }

        // get cluster properties based on childNodes
        var childEdgesOptions = [];
        for (var edgeId in childEdgesObj) {
          if (childEdgesObj.hasOwnProperty(edgeId)) {
            // these cluster edges will be removed on creation of the cluster.
            if (edgeId.substr(0, 12) !== "clusterEdge:") {
              var _clonedOptions = _NetworkUtil2.default.cloneOptions(childEdgesObj[edgeId], 'edge');
              childEdgesOptions.push(_clonedOptions);
            }
          }
        }

        clusterNodeProperties = options.processProperties(clusterNodeProperties, childNodesOptions, childEdgesOptions);
        if (!clusterNodeProperties) {
          throw new Error("The processProperties function does not return properties!");
        }
      }

      // check if we have an unique id;
      if (clusterNodeProperties.id === undefined) {
        clusterNodeProperties.id = 'cluster:' + util.randomUUID();
      }
      var clusterId = clusterNodeProperties.id;

      if (clusterNodeProperties.label === undefined) {
        clusterNodeProperties.label = 'cluster';
      }

      // give the clusterNode a position if it does not have one.
      var pos = undefined;
      if (clusterNodeProperties.x === undefined) {
        pos = this._getClusterPosition(childNodesObj);
        clusterNodeProperties.x = pos.x;
      }
      if (clusterNodeProperties.y === undefined) {
        if (pos === undefined) {
          pos = this._getClusterPosition(childNodesObj);
        }
        clusterNodeProperties.y = pos.y;
      }

      // force the ID to remain the same
      clusterNodeProperties.id = clusterId;

      // create the clusterNode
      var clusterNode = this.body.functions.createNode(clusterNodeProperties, _Cluster2.default);
      clusterNode.isCluster = true;
      clusterNode.containedNodes = childNodesObj;
      clusterNode.containedEdges = childEdgesObj;
      // cache a copy from the cluster edge properties if we have to reconnect others later on
      clusterNode.clusterEdgeProperties = options.clusterEdgeProperties;

      // finally put the cluster node into global
      this.body.nodes[clusterNodeProperties.id] = clusterNode;

      // create the new edges that will connect to the cluster, all self-referencing edges will be added to childEdgesObject here.
      this._createClusterEdges(childNodesObj, childEdgesObj, clusterNodeProperties, options.clusterEdgeProperties);

      // disable the childEdges
      for (var _edgeId in childEdgesObj) {
        if (childEdgesObj.hasOwnProperty(_edgeId)) {
          if (this.body.edges[_edgeId] !== undefined) {
            var edge = this.body.edges[_edgeId];
            // cache the options before changing
            this._backupEdgeOptions(edge);
            // disable physics and hide the edge
            edge.setOptions({ physics: false, hidden: true });
          }
        }
      }

      // disable the childNodes
      for (var _nodeId2 in childNodesObj) {
        if (childNodesObj.hasOwnProperty(_nodeId2)) {
          this.clusteredNodes[_nodeId2] = { clusterId: clusterNodeProperties.id, node: this.body.nodes[_nodeId2] };
          this.body.nodes[_nodeId2].setOptions({ hidden: true, physics: false });
        }
      }

      // set ID to undefined so no duplicates arise
      clusterNodeProperties.id = undefined;

      // wrap up
      if (refreshData === true) {
        this.body.emitter.emit('_dataChanged');
      }
    }
  }, {
    key: '_backupEdgeOptions',
    value: function _backupEdgeOptions(edge) {
      if (this.clusteredEdges[edge.id] === undefined) {
        this.clusteredEdges[edge.id] = { physics: edge.options.physics, hidden: edge.options.hidden };
      }
    }
  }, {
    key: '_restoreEdge',
    value: function _restoreEdge(edge) {
      var originalOptions = this.clusteredEdges[edge.id];
      if (originalOptions !== undefined) {
        edge.setOptions({ physics: originalOptions.physics, hidden: originalOptions.hidden });
        delete this.clusteredEdges[edge.id];
      }
    }

    /**
    * Check if a node is a cluster.
    * @param nodeId
    * @returns {*}
    */

  }, {
    key: 'isCluster',
    value: function isCluster(nodeId) {
      if (this.body.nodes[nodeId] !== undefined) {
        return this.body.nodes[nodeId].isCluster === true;
      } else {
        console.log("Node does not exist.");
        return false;
      }
    }

    /**
    * get the position of the cluster node based on what's inside
    * @param {object} childNodesObj    | object with node objects, id as keys
    * @returns {{x: number, y: number}}
    * @private
    */

  }, {
    key: '_getClusterPosition',
    value: function _getClusterPosition(childNodesObj) {
      var childKeys = Object.keys(childNodesObj);
      var minX = childNodesObj[childKeys[0]].x;
      var maxX = childNodesObj[childKeys[0]].x;
      var minY = childNodesObj[childKeys[0]].y;
      var maxY = childNodesObj[childKeys[0]].y;
      var node = void 0;
      for (var i = 1; i < childKeys.length; i++) {
        node = childNodesObj[childKeys[i]];
        minX = node.x < minX ? node.x : minX;
        maxX = node.x > maxX ? node.x : maxX;
        minY = node.y < minY ? node.y : minY;
        maxY = node.y > maxY ? node.y : maxY;
      }

      return { x: 0.5 * (minX + maxX), y: 0.5 * (minY + maxY) };
    }

    /**
    * Open a cluster by calling this function.
    * @param {String}  clusterNodeId | the ID of the cluster node
    * @param {Boolean} refreshData | wrap up afterwards if not true
    */

  }, {
    key: 'openCluster',
    value: function openCluster(clusterNodeId, options) {
      var refreshData = arguments.length <= 2 || arguments[2] === undefined ? true : arguments[2];

      // kill conditions
      if (clusterNodeId === undefined) {
        throw new Error("No clusterNodeId supplied to openCluster.");
      }
      if (this.body.nodes[clusterNodeId] === undefined) {
        throw new Error("The clusterNodeId supplied to openCluster does not exist.");
      }
      if (this.body.nodes[clusterNodeId].containedNodes === undefined) {
        console.log("The node:" + clusterNodeId + " is not a cluster.");
        return;
      }
      var clusterNode = this.body.nodes[clusterNodeId];
      var containedNodes = clusterNode.containedNodes;
      var containedEdges = clusterNode.containedEdges;

      // allow the user to position the nodes after release.
      if (options !== undefined && options.releaseFunction !== undefined && typeof options.releaseFunction === 'function') {
        var positions = {};
        var clusterPosition = { x: clusterNode.x, y: clusterNode.y };
        for (var nodeId in containedNodes) {
          if (containedNodes.hasOwnProperty(nodeId)) {
            var containedNode = this.body.nodes[nodeId];
            positions[nodeId] = { x: containedNode.x, y: containedNode.y };
          }
        }
        var newPositions = options.releaseFunction(clusterPosition, positions);

        for (var _nodeId3 in containedNodes) {
          if (containedNodes.hasOwnProperty(_nodeId3)) {
            var _containedNode = this.body.nodes[_nodeId3];
            if (newPositions[_nodeId3] !== undefined) {
              _containedNode.x = newPositions[_nodeId3].x === undefined ? clusterNode.x : newPositions[_nodeId3].x;
              _containedNode.y = newPositions[_nodeId3].y === undefined ? clusterNode.y : newPositions[_nodeId3].y;
            }
          }
        }
      } else {
        // copy the position from the cluster
        for (var _nodeId4 in containedNodes) {
          if (containedNodes.hasOwnProperty(_nodeId4)) {
            var _containedNode2 = this.body.nodes[_nodeId4];
            _containedNode2 = containedNodes[_nodeId4];
            // inherit position
            if (_containedNode2.options.fixed.x === false) {
              _containedNode2.x = clusterNode.x;
            }
            if (_containedNode2.options.fixed.y === false) {
              _containedNode2.y = clusterNode.y;
            }
          }
        }
      }

      // release nodes
      for (var _nodeId5 in containedNodes) {
        if (containedNodes.hasOwnProperty(_nodeId5)) {
          var _containedNode3 = this.body.nodes[_nodeId5];

          // inherit speed
          _containedNode3.vx = clusterNode.vx;
          _containedNode3.vy = clusterNode.vy;

          // we use these methods to avoid re-instantiating the shape, which happens with setOptions.
          _containedNode3.setOptions({ hidden: false, physics: true });

          delete this.clusteredNodes[_nodeId5];
        }
      }

      // copy the clusterNode edges because we cannot iterate over an object that we add or remove from.
      var edgesToBeDeleted = [];
      for (var i = 0; i < clusterNode.edges.length; i++) {
        edgesToBeDeleted.push(clusterNode.edges[i]);
      }

      // actually handling the deleting.
      for (var _i4 = 0; _i4 < edgesToBeDeleted.length; _i4++) {
        var edge = edgesToBeDeleted[_i4];

        var otherNodeId = this._getConnectedId(edge, clusterNodeId);
        // if the other node is in another cluster, we transfer ownership of this edge to the other cluster
        if (this.clusteredNodes[otherNodeId] !== undefined) {
          // transfer ownership:
          var otherCluster = this.body.nodes[this.clusteredNodes[otherNodeId].clusterId];
          var transferEdge = this.body.edges[edge.clusteringEdgeReplacingId];
          if (transferEdge !== undefined) {
            otherCluster.containedEdges[transferEdge.id] = transferEdge;

            // delete local reference
            delete containedEdges[transferEdge.id];

            // create new cluster edge from the otherCluster:
            // get to and from
            var fromId = transferEdge.fromId;
            var toId = transferEdge.toId;
            if (transferEdge.toId == otherNodeId) {
              toId = this.clusteredNodes[otherNodeId].clusterId;
            } else {
              fromId = this.clusteredNodes[otherNodeId].clusterId;
            }

            // clone the options and apply the cluster options to them
            var clonedOptions = _NetworkUtil2.default.cloneOptions(transferEdge, 'edge');
            util.deepExtend(clonedOptions, otherCluster.clusterEdgeProperties);

            // apply the edge specific options to it.
            var id = 'clusterEdge:' + util.randomUUID();
            util.deepExtend(clonedOptions, { from: fromId, to: toId, hidden: false, physics: true, id: id });

            // create it
            var newEdge = this.body.functions.createEdge(clonedOptions);
            newEdge.clusteringEdgeReplacingId = transferEdge.id;
            this.body.edges[id] = newEdge;
            this.body.edges[id].connect();
          }
        } else {
          var replacedEdge = this.body.edges[edge.clusteringEdgeReplacingId];
          if (replacedEdge !== undefined) {
            this._restoreEdge(replacedEdge);
          }
        }
        edge.cleanup();
        // this removes the edge from node.edges, which is why edgeIds is formed
        edge.disconnect();
        delete this.body.edges[edge.id];
      }

      // handle the releasing of the edges
      for (var edgeId in containedEdges) {
        if (containedEdges.hasOwnProperty(edgeId)) {
          this._restoreEdge(containedEdges[edgeId]);
        }
      }

      // remove clusterNode
      delete this.body.nodes[clusterNodeId];

      if (refreshData === true) {
        this.body.emitter.emit('_dataChanged');
      }
    }
  }, {
    key: 'getNodesInCluster',
    value: function getNodesInCluster(clusterId) {
      var nodesArray = [];
      if (this.isCluster(clusterId) === true) {
        var containedNodes = this.body.nodes[clusterId].containedNodes;
        for (var nodeId in containedNodes) {
          if (containedNodes.hasOwnProperty(nodeId)) {
            nodesArray.push(this.body.nodes[nodeId].id);
          }
        }
      }

      return nodesArray;
    }

    /**
    * Get the stack clusterId's that a certain node resides in. cluster A -> cluster B -> cluster C -> node
    * @param nodeId
    * @returns {Array}
    */

  }, {
    key: 'findNode',
    value: function findNode(nodeId) {
      var stack = [];
      var max = 100;
      var counter = 0;

      while (this.clusteredNodes[nodeId] !== undefined && counter < max) {
        stack.push(this.body.nodes[nodeId].id);
        nodeId = this.clusteredNodes[nodeId].clusterId;
        counter++;
      }
      stack.push(this.body.nodes[nodeId].id);
      stack.reverse();

      return stack;
    }

    /**
    * Get the Id the node is connected to
    * @param edge
    * @param nodeId
    * @returns {*}
    * @private
    */

  }, {
    key: '_getConnectedId',
    value: function _getConnectedId(edge, nodeId) {
      if (edge.toId != nodeId) {
        return edge.toId;
      } else if (edge.fromId != nodeId) {
        return edge.fromId;
      } else {
        return edge.fromId;
      }
    }

    /**
    * We determine how many connections denote an important hub.
    * We take the mean + 2*std as the important hub size. (Assuming a normal distribution of data, ~2.2%)
    *
    * @private
    */

  }, {
    key: '_getHubSize',
    value: function _getHubSize() {
      var average = 0;
      var averageSquared = 0;
      var hubCounter = 0;
      var largestHub = 0;

      for (var i = 0; i < this.body.nodeIndices.length; i++) {
        var node = this.body.nodes[this.body.nodeIndices[i]];
        if (node.edges.length > largestHub) {
          largestHub = node.edges.length;
        }
        average += node.edges.length;
        averageSquared += Math.pow(node.edges.length, 2);
        hubCounter += 1;
      }
      average = average / hubCounter;
      averageSquared = averageSquared / hubCounter;

      var variance = averageSquared - Math.pow(average, 2);
      var standardDeviation = Math.sqrt(variance);

      var hubThreshold = Math.floor(average + 2 * standardDeviation);

      // always have at least one to cluster
      if (hubThreshold > largestHub) {
        hubThreshold = largestHub;
      }

      return hubThreshold;
    }
  }]);

  return ClusterEngine;
}();

exports.default = ClusterEngine;