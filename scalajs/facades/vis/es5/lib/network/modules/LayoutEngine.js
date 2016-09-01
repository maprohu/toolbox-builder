'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _NetworkUtil = require('../NetworkUtil');

var _NetworkUtil2 = _interopRequireDefault(_NetworkUtil);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var util = require('../../util');

var LayoutEngine = function () {
  function LayoutEngine(body) {
    _classCallCheck(this, LayoutEngine);

    this.body = body;

    this.initialRandomSeed = Math.round(Math.random() * 1000000);
    this.randomSeed = this.initialRandomSeed;
    this.setPhysics = false;
    this.options = {};
    this.optionsBackup = { physics: {} };

    this.defaultOptions = {
      randomSeed: undefined,
      improvedLayout: true,
      hierarchical: {
        enabled: false,
        levelSeparation: 150,
        nodeSpacing: 100,
        treeSpacing: 200,
        blockShifting: true,
        edgeMinimization: true,
        parentCentralization: true,
        direction: 'UD', // UD, DU, LR, RL
        sortMethod: 'hubsize' // hubsize, directed
      }
    };
    util.extend(this.options, this.defaultOptions);
    this.bindEventListeners();
  }

  _createClass(LayoutEngine, [{
    key: 'bindEventListeners',
    value: function bindEventListeners() {
      var _this = this;

      this.body.emitter.on('_dataChanged', function () {
        _this.setupHierarchicalLayout();
      });
      this.body.emitter.on('_dataLoaded', function () {
        _this.layoutNetwork();
      });
      this.body.emitter.on('_resetHierarchicalLayout', function () {
        _this.setupHierarchicalLayout();
      });
    }
  }, {
    key: 'setOptions',
    value: function setOptions(options, allOptions) {
      if (options !== undefined) {
        var prevHierarchicalState = this.options.hierarchical.enabled;
        util.selectiveDeepExtend(["randomSeed", "improvedLayout"], this.options, options);
        util.mergeOptions(this.options, options, 'hierarchical');
        if (options.randomSeed !== undefined) {
          this.initialRandomSeed = options.randomSeed;
        }

        if (this.options.hierarchical.enabled === true) {
          if (prevHierarchicalState === true) {
            // refresh the overridden options for nodes and edges.
            this.body.emitter.emit('refresh', true);
          }

          // make sure the level separation is the right way up
          if (this.options.hierarchical.direction === 'RL' || this.options.hierarchical.direction === 'DU') {
            if (this.options.hierarchical.levelSeparation > 0) {
              this.options.hierarchical.levelSeparation *= -1;
            }
          } else {
            if (this.options.hierarchical.levelSeparation < 0) {
              this.options.hierarchical.levelSeparation *= -1;
            }
          }

          this.body.emitter.emit('_resetHierarchicalLayout');
          // because the hierarchical system needs it's own physics and smooth curve settings, we adapt the other options if needed.
          return this.adaptAllOptionsForHierarchicalLayout(allOptions);
        } else {
          if (prevHierarchicalState === true) {
            // refresh the overridden options for nodes and edges.
            this.body.emitter.emit('refresh');
            return util.deepExtend(allOptions, this.optionsBackup);
          }
        }
      }
      return allOptions;
    }
  }, {
    key: 'adaptAllOptionsForHierarchicalLayout',
    value: function adaptAllOptionsForHierarchicalLayout(allOptions) {
      if (this.options.hierarchical.enabled === true) {
        // set the physics
        if (allOptions.physics === undefined || allOptions.physics === true) {
          allOptions.physics = {
            enabled: this.optionsBackup.physics.enabled === undefined ? true : this.optionsBackup.physics.enabled,
            solver: 'hierarchicalRepulsion'
          };
          this.optionsBackup.physics.enabled = this.optionsBackup.physics.enabled === undefined ? true : this.optionsBackup.physics.enabled;
          this.optionsBackup.physics.solver = this.optionsBackup.physics.solver || 'barnesHut';
        } else if (_typeof(allOptions.physics) === 'object') {
          this.optionsBackup.physics.enabled = allOptions.physics.enabled === undefined ? true : allOptions.physics.enabled;
          this.optionsBackup.physics.solver = allOptions.physics.solver || 'barnesHut';
          allOptions.physics.solver = 'hierarchicalRepulsion';
        } else if (allOptions.physics !== false) {
          this.optionsBackup.physics.solver = 'barnesHut';
          allOptions.physics = { solver: 'hierarchicalRepulsion' };
        }

        // get the type of static smooth curve in case it is required
        var type = 'horizontal';
        if (this.options.hierarchical.direction === 'RL' || this.options.hierarchical.direction === 'LR') {
          type = 'vertical';
        }

        // disable smooth curves if nothing is defined. If smooth curves have been turned on, turn them into static smooth curves.
        if (allOptions.edges === undefined) {
          this.optionsBackup.edges = { smooth: { enabled: true, type: 'dynamic' } };
          allOptions.edges = { smooth: false };
        } else if (allOptions.edges.smooth === undefined) {
          this.optionsBackup.edges = { smooth: { enabled: true, type: 'dynamic' } };
          allOptions.edges.smooth = false;
        } else {
          if (typeof allOptions.edges.smooth === 'boolean') {
            this.optionsBackup.edges = { smooth: allOptions.edges.smooth };
            allOptions.edges.smooth = { enabled: allOptions.edges.smooth, type: type };
          } else {
            // allow custom types except for dynamic
            if (allOptions.edges.smooth.type !== undefined && allOptions.edges.smooth.type !== 'dynamic') {
              type = allOptions.edges.smooth.type;
            }

            this.optionsBackup.edges = {
              smooth: allOptions.edges.smooth.enabled === undefined ? true : allOptions.edges.smooth.enabled,
              type: allOptions.edges.smooth.type === undefined ? 'dynamic' : allOptions.edges.smooth.type,
              roundness: allOptions.edges.smooth.roundness === undefined ? 0.5 : allOptions.edges.smooth.roundness,
              forceDirection: allOptions.edges.smooth.forceDirection === undefined ? false : allOptions.edges.smooth.forceDirection
            };
            allOptions.edges.smooth = {
              enabled: allOptions.edges.smooth.enabled === undefined ? true : allOptions.edges.smooth.enabled,
              type: type,
              roundness: allOptions.edges.smooth.roundness === undefined ? 0.5 : allOptions.edges.smooth.roundness,
              forceDirection: allOptions.edges.smooth.forceDirection === undefined ? false : allOptions.edges.smooth.forceDirection
            };
          }
        }

        // force all edges into static smooth curves. Only applies to edges that do not use the global options for smooth.
        this.body.emitter.emit('_forceDisableDynamicCurves', type);
      }

      return allOptions;
    }
  }, {
    key: 'seededRandom',
    value: function seededRandom() {
      var x = Math.sin(this.randomSeed++) * 10000;
      return x - Math.floor(x);
    }
  }, {
    key: 'positionInitially',
    value: function positionInitially(nodesArray) {
      if (this.options.hierarchical.enabled !== true) {
        this.randomSeed = this.initialRandomSeed;
        for (var i = 0; i < nodesArray.length; i++) {
          var node = nodesArray[i];
          var radius = 10 * 0.1 * nodesArray.length + 10;
          var angle = 2 * Math.PI * this.seededRandom();
          if (node.x === undefined) {
            node.x = radius * Math.cos(angle);
          }
          if (node.y === undefined) {
            node.y = radius * Math.sin(angle);
          }
        }
      }
    }

    /**
     * Use Kamada Kawai to position nodes. This is quite a heavy algorithm so if there are a lot of nodes we
     * cluster them first to reduce the amount.
     */

  }, {
    key: 'layoutNetwork',
    value: function layoutNetwork() {
      if (this.options.hierarchical.enabled !== true && this.options.improvedLayout === true) {
        // first check if we should Kamada Kawai to layout. The threshold is if less than half of the visible
        // nodes have predefined positions we use this.
        var positionDefined = 0;
        for (var i = 0; i < this.body.nodeIndices.length; i++) {
          var node = this.body.nodes[this.body.nodeIndices[i]];
          if (node.predefinedPosition === true) {
            positionDefined += 1;
          }
        }

        // if less than half of the nodes have a predefined position we continue
        if (positionDefined < 0.5 * this.body.nodeIndices.length) {
          var MAX_LEVELS = 10;
          var level = 0;
          var clusterThreshold = 100;
          // if there are a lot of nodes, we cluster before we run the algorithm.
          if (this.body.nodeIndices.length > clusterThreshold) {
            var startLength = this.body.nodeIndices.length;
            while (this.body.nodeIndices.length > clusterThreshold) {
              //console.time("clustering")
              level += 1;
              var before = this.body.nodeIndices.length;
              // if there are many nodes we do a hubsize cluster
              if (level % 3 === 0) {
                this.body.modules.clustering.clusterBridges();
              } else {
                this.body.modules.clustering.clusterOutliers();
              }
              var after = this.body.nodeIndices.length;
              if (before == after && level % 3 !== 0 || level > MAX_LEVELS) {
                this._declusterAll();
                this.body.emitter.emit("_layoutFailed");
                console.info("This network could not be positioned by this version of the improved layout algorithm. Please disable improvedLayout for better performance.");
                return;
              }
              //console.timeEnd("clustering")
              //console.log(level,after)
            }
            // increase the size of the edges
            this.body.modules.kamadaKawai.setOptions({ springLength: Math.max(150, 2 * startLength) });
          }

          // position the system for these nodes and edges
          this.body.modules.kamadaKawai.solve(this.body.nodeIndices, this.body.edgeIndices, true);

          // shift to center point
          this._shiftToCenter();

          // perturb the nodes a little bit to force the physics to kick in
          var offset = 70;
          for (var _i = 0; _i < this.body.nodeIndices.length; _i++) {
            this.body.nodes[this.body.nodeIndices[_i]].x += (0.5 - this.seededRandom()) * offset;
            this.body.nodes[this.body.nodeIndices[_i]].y += (0.5 - this.seededRandom()) * offset;
          }

          // uncluster all clusters
          this._declusterAll();

          // reposition all bezier nodes.
          this.body.emitter.emit("_repositionBezierNodes");
        }
      }
    }

    /**
     * Move all the nodes towards to the center so gravitational pull wil not move the nodes away from view
     * @private
     */

  }, {
    key: '_shiftToCenter',
    value: function _shiftToCenter() {
      var range = _NetworkUtil2.default.getRangeCore(this.body.nodes, this.body.nodeIndices);
      var center = _NetworkUtil2.default.findCenter(range);
      for (var i = 0; i < this.body.nodeIndices.length; i++) {
        this.body.nodes[this.body.nodeIndices[i]].x -= center.x;
        this.body.nodes[this.body.nodeIndices[i]].y -= center.y;
      }
    }
  }, {
    key: '_declusterAll',
    value: function _declusterAll() {
      var clustersPresent = true;
      while (clustersPresent === true) {
        clustersPresent = false;
        for (var i = 0; i < this.body.nodeIndices.length; i++) {
          if (this.body.nodes[this.body.nodeIndices[i]].isCluster === true) {
            clustersPresent = true;
            this.body.modules.clustering.openCluster(this.body.nodeIndices[i], {}, false);
          }
        }
        if (clustersPresent === true) {
          this.body.emitter.emit('_dataChanged');
        }
      }
    }
  }, {
    key: 'getSeed',
    value: function getSeed() {
      return this.initialRandomSeed;
    }

    /**
     * This is the main function to layout the nodes in a hierarchical way.
     * It checks if the node details are supplied correctly
     *
     * @private
     */

  }, {
    key: 'setupHierarchicalLayout',
    value: function setupHierarchicalLayout() {
      if (this.options.hierarchical.enabled === true && this.body.nodeIndices.length > 0) {
        // get the size of the largest hubs and check if the user has defined a level for a node.
        var node = void 0,
            nodeId = void 0;
        var definedLevel = false;
        var definedPositions = true;
        var undefinedLevel = false;
        this.hierarchicalLevels = {};
        this.lastNodeOnLevel = {};
        this.hierarchicalChildrenReference = {};
        this.hierarchicalParentReference = {};
        this.hierarchicalTrees = {};
        this.treeIndex = -1;

        this.distributionOrdering = {};
        this.distributionIndex = {};
        this.distributionOrderingPresence = {};

        for (nodeId in this.body.nodes) {
          if (this.body.nodes.hasOwnProperty(nodeId)) {
            node = this.body.nodes[nodeId];
            if (node.options.x === undefined && node.options.y === undefined) {
              definedPositions = false;
            }
            if (node.options.level !== undefined) {
              definedLevel = true;
              this.hierarchicalLevels[nodeId] = node.options.level;
            } else {
              undefinedLevel = true;
            }
          }
        }

        // if the user defined some levels but not all, alert and run without hierarchical layout
        if (undefinedLevel === true && definedLevel === true) {
          throw new Error('To use the hierarchical layout, nodes require either no predefined levels or levels have to be defined for all nodes.');
          return;
        } else {
          // define levels if undefined by the users. Based on hubsize.
          if (undefinedLevel === true) {
            if (this.options.hierarchical.sortMethod === 'hubsize') {
              this._determineLevelsByHubsize();
            } else if (this.options.hierarchical.sortMethod === 'directed') {
              this._determineLevelsDirected();
            } else if (this.options.hierarchical.sortMethod === 'custom') {
              this._determineLevelsCustomCallback();
            }
          }

          // fallback for cases where there are nodes but no edges
          for (var _nodeId in this.body.nodes) {
            if (this.body.nodes.hasOwnProperty(_nodeId)) {
              if (this.hierarchicalLevels[_nodeId] === undefined) {
                this.hierarchicalLevels[_nodeId] = 0;
              }
            }
          }
          // check the distribution of the nodes per level.
          var distribution = this._getDistribution();

          // get the parent children relations.
          this._generateMap();

          // place the nodes on the canvas.
          this._placeNodesByHierarchy(distribution);

          // condense the whitespace.
          this._condenseHierarchy();

          // shift to center so gravity does not have to do much
          this._shiftToCenter();
        }
      }
    }

    /**
     * @private
     */

  }, {
    key: '_condenseHierarchy',
    value: function _condenseHierarchy() {
      var _this2 = this;

      // Global var in this scope to define when the movement has stopped.
      var stillShifting = false;
      var branches = {};
      // first we have some methods to help shifting trees around.
      // the main method to shift the trees
      var shiftTrees = function shiftTrees() {
        var treeSizes = getTreeSizes();
        for (var i = 0; i < treeSizes.length - 1; i++) {
          var diff = treeSizes[i].max - treeSizes[i + 1].min;
          shiftTree(i + 1, diff + _this2.options.hierarchical.treeSpacing);
        }
      };

      // shift a single tree by an offset
      var shiftTree = function shiftTree(index, offset) {
        for (var nodeId in _this2.hierarchicalTrees) {
          if (_this2.hierarchicalTrees.hasOwnProperty(nodeId)) {
            if (_this2.hierarchicalTrees[nodeId] === index) {
              var node = _this2.body.nodes[nodeId];
              var pos = _this2._getPositionForHierarchy(node);
              _this2._setPositionForHierarchy(node, pos + offset, undefined, true);
            }
          }
        }
      };

      // get the width of a tree
      var getTreeSize = function getTreeSize(index) {
        var min = 1e9;
        var max = -1e9;
        for (var nodeId in _this2.hierarchicalTrees) {
          if (_this2.hierarchicalTrees.hasOwnProperty(nodeId)) {
            if (_this2.hierarchicalTrees[nodeId] === index) {
              var pos = _this2._getPositionForHierarchy(_this2.body.nodes[nodeId]);
              min = Math.min(pos, min);
              max = Math.max(pos, max);
            }
          }
        }
        return { min: min, max: max };
      };

      // get the width of all trees
      var getTreeSizes = function getTreeSizes() {
        var treeWidths = [];
        for (var i = 0; i <= _this2.treeIndex; i++) {
          treeWidths.push(getTreeSize(i));
        }
        return treeWidths;
      };

      // get a map of all nodes in this branch
      var getBranchNodes = function getBranchNodes(source, map) {
        map[source.id] = true;
        if (_this2.hierarchicalChildrenReference[source.id]) {
          var children = _this2.hierarchicalChildrenReference[source.id];
          if (children.length > 0) {
            for (var i = 0; i < children.length; i++) {
              getBranchNodes(_this2.body.nodes[children[i]], map);
            }
          }
        }
      };

      // get a min max width as well as the maximum movement space it has on either sides
      // we use min max terminology because width and height can interchange depending on the direction of the layout
      var getBranchBoundary = function getBranchBoundary(branchMap) {
        var maxLevel = arguments.length <= 1 || arguments[1] === undefined ? 1e9 : arguments[1];

        var minSpace = 1e9;
        var maxSpace = 1e9;
        var min = 1e9;
        var max = -1e9;
        for (var branchNode in branchMap) {
          if (branchMap.hasOwnProperty(branchNode)) {
            var node = _this2.body.nodes[branchNode];
            var level = _this2.hierarchicalLevels[node.id];
            var position = _this2._getPositionForHierarchy(node);

            // get the space around the node.

            var _getSpaceAroundNode2 = _this2._getSpaceAroundNode(node, branchMap);

            var _getSpaceAroundNode3 = _slicedToArray(_getSpaceAroundNode2, 2);

            var minSpaceNode = _getSpaceAroundNode3[0];
            var maxSpaceNode = _getSpaceAroundNode3[1];

            minSpace = Math.min(minSpaceNode, minSpace);
            maxSpace = Math.min(maxSpaceNode, maxSpace);

            // the width is only relevant for the levels two nodes have in common. This is why we filter on this.
            if (level <= maxLevel) {
              min = Math.min(position, min);
              max = Math.max(position, max);
            }
          }
        }

        return [min, max, minSpace, maxSpace];
      };

      // get the maximum level of a branch.
      var getMaxLevel = function getMaxLevel(nodeId) {
        var level = _this2.hierarchicalLevels[nodeId];
        if (_this2.hierarchicalChildrenReference[nodeId]) {
          var children = _this2.hierarchicalChildrenReference[nodeId];
          if (children.length > 0) {
            for (var i = 0; i < children.length; i++) {
              level = Math.max(level, getMaxLevel(children[i]));
            }
          }
        }
        return level;
      };

      // check what the maximum level is these nodes have in common.
      var getCollisionLevel = function getCollisionLevel(node1, node2) {
        var maxLevel1 = getMaxLevel(node1.id);
        var maxLevel2 = getMaxLevel(node2.id);
        return Math.min(maxLevel1, maxLevel2);
      };

      // check if two nodes have the same parent(s)
      var hasSameParent = function hasSameParent(node1, node2) {
        var parents1 = _this2.hierarchicalParentReference[node1.id];
        var parents2 = _this2.hierarchicalParentReference[node2.id];
        if (parents1 === undefined || parents2 === undefined) {
          return false;
        }

        for (var i = 0; i < parents1.length; i++) {
          for (var j = 0; j < parents2.length; j++) {
            if (parents1[i] == parents2[j]) {
              return true;
            }
          }
        }
        return false;
      };

      // condense elements. These can be nodes or branches depending on the callback.
      var shiftElementsCloser = function shiftElementsCloser(callback, levels, centerParents) {
        for (var i = 0; i < levels.length; i++) {
          var level = levels[i];
          var levelNodes = _this2.distributionOrdering[level];
          if (levelNodes.length > 1) {
            for (var j = 0; j < levelNodes.length - 1; j++) {
              if (hasSameParent(levelNodes[j], levelNodes[j + 1]) === true) {
                if (_this2.hierarchicalTrees[levelNodes[j].id] === _this2.hierarchicalTrees[levelNodes[j + 1].id]) {
                  callback(levelNodes[j], levelNodes[j + 1], centerParents);
                }
              }
            }
          }
        }
      };

      // callback for shifting branches
      var branchShiftCallback = function branchShiftCallback(node1, node2) {
        var centerParent = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

        //window.CALLBACKS.push(() => {
        var pos1 = _this2._getPositionForHierarchy(node1);
        var pos2 = _this2._getPositionForHierarchy(node2);
        var diffAbs = Math.abs(pos2 - pos1);
        //console.log("NOW CHEcKING:", node1.id, node2.id, diffAbs);
        if (diffAbs > _this2.options.hierarchical.nodeSpacing) {
          var branchNodes1 = {};branchNodes1[node1.id] = true;
          var branchNodes2 = {};branchNodes2[node2.id] = true;

          getBranchNodes(node1, branchNodes1);
          getBranchNodes(node2, branchNodes2);

          // check the largest distance between the branches
          var maxLevel = getCollisionLevel(node1, node2);

          var _getBranchBoundary = getBranchBoundary(branchNodes1, maxLevel);

          var _getBranchBoundary2 = _slicedToArray(_getBranchBoundary, 4);

          var min1 = _getBranchBoundary2[0];
          var max1 = _getBranchBoundary2[1];
          var minSpace1 = _getBranchBoundary2[2];
          var maxSpace1 = _getBranchBoundary2[3];

          var _getBranchBoundary3 = getBranchBoundary(branchNodes2, maxLevel);

          var _getBranchBoundary4 = _slicedToArray(_getBranchBoundary3, 4);

          var min2 = _getBranchBoundary4[0];
          var max2 = _getBranchBoundary4[1];
          var minSpace2 = _getBranchBoundary4[2];
          var maxSpace2 = _getBranchBoundary4[3];

          //console.log(node1.id, getBranchBoundary(branchNodes1, maxLevel), node2.id, getBranchBoundary(branchNodes2, maxLevel), maxLevel);

          var diffBranch = Math.abs(max1 - min2);
          if (diffBranch > _this2.options.hierarchical.nodeSpacing) {
            var offset = max1 - min2 + _this2.options.hierarchical.nodeSpacing;
            if (offset < -minSpace2 + _this2.options.hierarchical.nodeSpacing) {
              offset = -minSpace2 + _this2.options.hierarchical.nodeSpacing;
              //console.log("RESETTING OFFSET", max1 - min2 + this.options.hierarchical.nodeSpacing, -minSpace2, offset);
            }
            if (offset < 0) {
              //console.log("SHIFTING", node2.id, offset);
              _this2._shiftBlock(node2.id, offset);
              stillShifting = true;

              if (centerParent === true) _this2._centerParent(node2);
            }
          }
        }
        //this.body.emitter.emit("_redraw");})
      };

      var minimizeEdgeLength = function minimizeEdgeLength(iterations, node) {
        //window.CALLBACKS.push(() => {
        //  console.log("ts",node.id);
        var nodeId = node.id;
        var allEdges = node.edges;
        var nodeLevel = _this2.hierarchicalLevels[node.id];

        // gather constants
        var C2 = _this2.options.hierarchical.levelSeparation * _this2.options.hierarchical.levelSeparation;
        var referenceNodes = {};
        var aboveEdges = [];
        for (var i = 0; i < allEdges.length; i++) {
          var edge = allEdges[i];
          if (edge.toId != edge.fromId) {
            var otherNode = edge.toId == nodeId ? edge.from : edge.to;
            referenceNodes[allEdges[i].id] = otherNode;
            if (_this2.hierarchicalLevels[otherNode.id] < nodeLevel) {
              aboveEdges.push(edge);
            }
          }
        }

        // differentiated sum of lengths based on only moving one node over one axis
        var getFx = function getFx(point, edges) {
          var sum = 0;
          for (var _i2 = 0; _i2 < edges.length; _i2++) {
            if (referenceNodes[edges[_i2].id] !== undefined) {
              var a = _this2._getPositionForHierarchy(referenceNodes[edges[_i2].id]) - point;
              sum += a / Math.sqrt(a * a + C2);
            }
          }
          return sum;
        };

        // doubly differentiated sum of lengths based on only moving one node over one axis
        var getDFx = function getDFx(point, edges) {
          var sum = 0;
          for (var _i3 = 0; _i3 < edges.length; _i3++) {
            if (referenceNodes[edges[_i3].id] !== undefined) {
              var a = _this2._getPositionForHierarchy(referenceNodes[edges[_i3].id]) - point;
              sum -= C2 * Math.pow(a * a + C2, -1.5);
            }
          }
          return sum;
        };

        var getGuess = function getGuess(iterations, edges) {
          var guess = _this2._getPositionForHierarchy(node);
          // Newton's method for optimization
          var guessMap = {};
          for (var _i4 = 0; _i4 < iterations; _i4++) {
            var fx = getFx(guess, edges);
            var dfx = getDFx(guess, edges);

            // we limit the movement to avoid instability.
            var limit = 40;
            var ratio = Math.max(-limit, Math.min(limit, Math.round(fx / dfx)));
            guess = guess - ratio;
            // reduce duplicates
            if (guessMap[guess] !== undefined) {
              break;
            }
            guessMap[guess] = _i4;
          }
          return guess;
        };

        var moveBranch = function moveBranch(guess) {
          // position node if there is space
          var nodePosition = _this2._getPositionForHierarchy(node);

          // check movable area of the branch
          if (branches[node.id] === undefined) {
            var branchNodes = {};
            branchNodes[node.id] = true;
            getBranchNodes(node, branchNodes);
            branches[node.id] = branchNodes;
          }

          var _getBranchBoundary5 = getBranchBoundary(branches[node.id]);

          var _getBranchBoundary6 = _slicedToArray(_getBranchBoundary5, 4);

          var minBranch = _getBranchBoundary6[0];
          var maxBranch = _getBranchBoundary6[1];
          var minSpaceBranch = _getBranchBoundary6[2];
          var maxSpaceBranch = _getBranchBoundary6[3];


          var diff = guess - nodePosition;

          // check if we are allowed to move the node:
          var branchOffset = 0;
          if (diff > 0) {
            branchOffset = Math.min(diff, maxSpaceBranch - _this2.options.hierarchical.nodeSpacing);
          } else if (diff < 0) {
            branchOffset = -Math.min(-diff, minSpaceBranch - _this2.options.hierarchical.nodeSpacing);
          }

          if (branchOffset != 0) {
            //console.log("moving branch:",branchOffset, maxSpaceBranch, minSpaceBranch)
            _this2._shiftBlock(node.id, branchOffset);
            //this.body.emitter.emit("_redraw");
            stillShifting = true;
          }
        };

        var moveNode = function moveNode(guess) {
          var nodePosition = _this2._getPositionForHierarchy(node);

          // position node if there is space

          var _getSpaceAroundNode4 = _this2._getSpaceAroundNode(node);

          var _getSpaceAroundNode5 = _slicedToArray(_getSpaceAroundNode4, 2);

          var minSpace = _getSpaceAroundNode5[0];
          var maxSpace = _getSpaceAroundNode5[1];

          var diff = guess - nodePosition;
          // check if we are allowed to move the node:
          var newPosition = nodePosition;
          if (diff > 0) {
            newPosition = Math.min(nodePosition + (maxSpace - _this2.options.hierarchical.nodeSpacing), guess);
          } else if (diff < 0) {
            newPosition = Math.max(nodePosition - (minSpace - _this2.options.hierarchical.nodeSpacing), guess);
          }

          if (newPosition !== nodePosition) {
            //console.log("moving Node:",diff, minSpace, maxSpace);
            _this2._setPositionForHierarchy(node, newPosition, undefined, true);
            //this.body.emitter.emit("_redraw");
            stillShifting = true;
          }
        };

        var guess = getGuess(iterations, aboveEdges);
        moveBranch(guess);
        guess = getGuess(iterations, allEdges);
        moveNode(guess);
        //})
      };

      // method to remove whitespace between branches. Because we do bottom up, we can center the parents.
      var minimizeEdgeLengthBottomUp = function minimizeEdgeLengthBottomUp(iterations) {
        var levels = Object.keys(_this2.distributionOrdering);
        levels = levels.reverse();
        for (var i = 0; i < iterations; i++) {
          stillShifting = false;
          for (var j = 0; j < levels.length; j++) {
            var level = levels[j];
            var levelNodes = _this2.distributionOrdering[level];
            for (var k = 0; k < levelNodes.length; k++) {
              minimizeEdgeLength(1000, levelNodes[k]);
            }
          }
          if (stillShifting !== true) {
            //console.log("FINISHED minimizeEdgeLengthBottomUp IN " + i);
            break;
          }
        }
      };

      // method to remove whitespace between branches. Because we do bottom up, we can center the parents.
      var shiftBranchesCloserBottomUp = function shiftBranchesCloserBottomUp(iterations) {
        var levels = Object.keys(_this2.distributionOrdering);
        levels = levels.reverse();
        for (var i = 0; i < iterations; i++) {
          stillShifting = false;
          shiftElementsCloser(branchShiftCallback, levels, true);
          if (stillShifting !== true) {
            //console.log("FINISHED shiftBranchesCloserBottomUp IN " + (i+1));
            break;
          }
        }
      };

      // center all parents
      var centerAllParents = function centerAllParents() {
        for (var nodeId in _this2.body.nodes) {
          if (_this2.body.nodes.hasOwnProperty(nodeId)) _this2._centerParent(_this2.body.nodes[nodeId]);
        }
      };

      // center all parents
      var centerAllParentsBottomUp = function centerAllParentsBottomUp() {
        var levels = Object.keys(_this2.distributionOrdering);
        levels = levels.reverse();
        for (var i = 0; i < levels.length; i++) {
          var level = levels[i];
          var levelNodes = _this2.distributionOrdering[level];
          for (var j = 0; j < levelNodes.length; j++) {
            _this2._centerParent(levelNodes[j]);
          }
        }
      };

      // the actual work is done here.
      if (this.options.hierarchical.blockShifting === true) {
        shiftBranchesCloserBottomUp(5);
        centerAllParents();
      }

      // minimize edge length
      if (this.options.hierarchical.edgeMinimization === true) {
        minimizeEdgeLengthBottomUp(20);
      }

      if (this.options.hierarchical.parentCentralization === true) {
        centerAllParentsBottomUp();
      }

      shiftTrees();
    }

    /**
     * This gives the space around the node. IF a map is supplied, it will only check against nodes NOT in the map.
     * This is used to only get the distances to nodes outside of a branch.
     * @param node
     * @param map
     * @returns {*[]}
     * @private
     */

  }, {
    key: '_getSpaceAroundNode',
    value: function _getSpaceAroundNode(node, map) {
      var useMap = true;
      if (map === undefined) {
        useMap = false;
      }
      var level = this.hierarchicalLevels[node.id];
      if (level !== undefined) {
        var index = this.distributionIndex[node.id];
        var position = this._getPositionForHierarchy(node);
        var minSpace = 1e9;
        var maxSpace = 1e9;
        if (index !== 0) {
          var prevNode = this.distributionOrdering[level][index - 1];
          if (useMap === true && map[prevNode.id] === undefined || useMap === false) {
            var prevPos = this._getPositionForHierarchy(prevNode);
            minSpace = position - prevPos;
          }
        }

        if (index != this.distributionOrdering[level].length - 1) {
          var nextNode = this.distributionOrdering[level][index + 1];
          if (useMap === true && map[nextNode.id] === undefined || useMap === false) {
            var nextPos = this._getPositionForHierarchy(nextNode);
            maxSpace = Math.min(maxSpace, nextPos - position);
          }
        }

        return [minSpace, maxSpace];
      } else {
        return [0, 0];
      }
    }

    /**
     * We use this method to center a parent node and check if it does not cross other nodes when it does.
     * @param node
     * @private
     */

  }, {
    key: '_centerParent',
    value: function _centerParent(node) {
      if (this.hierarchicalParentReference[node.id]) {
        var parents = this.hierarchicalParentReference[node.id];
        for (var i = 0; i < parents.length; i++) {
          var parentId = parents[i];
          var parentNode = this.body.nodes[parentId];
          if (this.hierarchicalChildrenReference[parentId]) {
            // get the range of the children
            var minPos = 1e9;
            var maxPos = -1e9;
            var children = this.hierarchicalChildrenReference[parentId];
            if (children.length > 0) {
              for (var _i5 = 0; _i5 < children.length; _i5++) {
                var childNode = this.body.nodes[children[_i5]];
                minPos = Math.min(minPos, this._getPositionForHierarchy(childNode));
                maxPos = Math.max(maxPos, this._getPositionForHierarchy(childNode));
              }
            }

            var position = this._getPositionForHierarchy(parentNode);

            var _getSpaceAroundNode6 = this._getSpaceAroundNode(parentNode);

            var _getSpaceAroundNode7 = _slicedToArray(_getSpaceAroundNode6, 2);

            var minSpace = _getSpaceAroundNode7[0];
            var maxSpace = _getSpaceAroundNode7[1];

            var newPosition = 0.5 * (minPos + maxPos);
            var diff = position - newPosition;
            if (diff < 0 && Math.abs(diff) < maxSpace - this.options.hierarchical.nodeSpacing || diff > 0 && Math.abs(diff) < minSpace - this.options.hierarchical.nodeSpacing) {
              this._setPositionForHierarchy(parentNode, newPosition, undefined, true);
            }
          }
        }
      }
    }

    /**
     * This function places the nodes on the canvas based on the hierarchial distribution.
     *
     * @param {Object} distribution | obtained by the function this._getDistribution()
     * @private
     */

  }, {
    key: '_placeNodesByHierarchy',
    value: function _placeNodesByHierarchy(distribution) {
      this.positionedNodes = {};
      // start placing all the level 0 nodes first. Then recursively position their branches.
      for (var level in distribution) {
        if (distribution.hasOwnProperty(level)) {
          // sort nodes in level by position:
          var nodeArray = Object.keys(distribution[level]);
          nodeArray = this._indexArrayToNodes(nodeArray);
          this._sortNodeArray(nodeArray);
          var handledNodeCount = 0;

          for (var i = 0; i < nodeArray.length; i++) {
            var node = nodeArray[i];
            if (this.positionedNodes[node.id] === undefined) {
              var pos = this.options.hierarchical.nodeSpacing * handledNodeCount;
              // we get the X or Y values we need and store them in pos and previousPos. The get and set make sure we get X or Y
              if (handledNodeCount > 0) {
                pos = this._getPositionForHierarchy(nodeArray[i - 1]) + this.options.hierarchical.nodeSpacing;
              }
              this._setPositionForHierarchy(node, pos, level);
              this._validataPositionAndContinue(node, level, pos);

              handledNodeCount++;
            }
          }
        }
      }
    }

    /**
     * This is a recursively called function to enumerate the branches from the largest hubs and place the nodes
     * on a X position that ensures there will be no overlap.
     *
     * @param parentId
     * @param parentLevel
     * @private
     */

  }, {
    key: '_placeBranchNodes',
    value: function _placeBranchNodes(parentId, parentLevel) {
      // if this is not a parent, cancel the placing. This can happen with multiple parents to one child.
      if (this.hierarchicalChildrenReference[parentId] === undefined) {
        return;
      }

      // get a list of childNodes
      var childNodes = [];
      for (var i = 0; i < this.hierarchicalChildrenReference[parentId].length; i++) {
        childNodes.push(this.body.nodes[this.hierarchicalChildrenReference[parentId][i]]);
      }

      // use the positions to order the nodes.
      this._sortNodeArray(childNodes);

      // position the childNodes
      for (var _i6 = 0; _i6 < childNodes.length; _i6++) {
        var childNode = childNodes[_i6];
        var childNodeLevel = this.hierarchicalLevels[childNode.id];
        // check if the child node is below the parent node and if it has already been positioned.
        if (childNodeLevel > parentLevel && this.positionedNodes[childNode.id] === undefined) {
          // get the amount of space required for this node. If parent the width is based on the amount of children.
          var pos = void 0;

          // we get the X or Y values we need and store them in pos and previousPos. The get and set make sure we get X or Y
          if (_i6 === 0) {
            pos = this._getPositionForHierarchy(this.body.nodes[parentId]);
          } else {
            pos = this._getPositionForHierarchy(childNodes[_i6 - 1]) + this.options.hierarchical.nodeSpacing;
          }
          this._setPositionForHierarchy(childNode, pos, childNodeLevel);
          this._validataPositionAndContinue(childNode, childNodeLevel, pos);
        } else {
          return;
        }
      }

      // center the parent nodes.
      var minPos = 1e9;
      var maxPos = -1e9;
      for (var _i7 = 0; _i7 < childNodes.length; _i7++) {
        var childNodeId = childNodes[_i7].id;
        minPos = Math.min(minPos, this._getPositionForHierarchy(this.body.nodes[childNodeId]));
        maxPos = Math.max(maxPos, this._getPositionForHierarchy(this.body.nodes[childNodeId]));
      }
      this._setPositionForHierarchy(this.body.nodes[parentId], 0.5 * (minPos + maxPos), parentLevel);
    }

    /**
     * This method checks for overlap and if required shifts the branch. It also keeps records of positioned nodes.
     * Finally it will call _placeBranchNodes to place the branch nodes.
     * @param node
     * @param level
     * @param pos
     * @private
     */

  }, {
    key: '_validataPositionAndContinue',
    value: function _validataPositionAndContinue(node, level, pos) {
      // if overlap has been detected, we shift the branch
      if (this.lastNodeOnLevel[level] !== undefined) {
        var previousPos = this._getPositionForHierarchy(this.body.nodes[this.lastNodeOnLevel[level]]);
        if (pos - previousPos < this.options.hierarchical.nodeSpacing) {
          var diff = previousPos + this.options.hierarchical.nodeSpacing - pos;
          var sharedParent = this._findCommonParent(this.lastNodeOnLevel[level], node.id);
          this._shiftBlock(sharedParent.withChild, diff);
        }
      }

      // store change in position.
      this.lastNodeOnLevel[level] = node.id;

      this.positionedNodes[node.id] = true;

      this._placeBranchNodes(node.id, level);
    }

    /**
     * Receives an array with node indices and returns an array with the actual node references. Used for sorting based on
     * node properties.
     * @param idArray
     */

  }, {
    key: '_indexArrayToNodes',
    value: function _indexArrayToNodes(idArray) {
      var array = [];
      for (var i = 0; i < idArray.length; i++) {
        array.push(this.body.nodes[idArray[i]]);
      }
      return array;
    }

    /**
     * This function get the distribution of levels based on hubsize
     *
     * @returns {Object}
     * @private
     */

  }, {
    key: '_getDistribution',
    value: function _getDistribution() {
      var distribution = {};
      var nodeId = void 0,
          node = void 0;

      // we fix Y because the hierarchy is vertical, we fix X so we do not give a node an x position for a second time.
      // the fix of X is removed after the x value has been set.
      for (nodeId in this.body.nodes) {
        if (this.body.nodes.hasOwnProperty(nodeId)) {
          node = this.body.nodes[nodeId];
          var level = this.hierarchicalLevels[nodeId] === undefined ? 0 : this.hierarchicalLevels[nodeId];
          if (this.options.hierarchical.direction === 'UD' || this.options.hierarchical.direction === 'DU') {
            node.y = this.options.hierarchical.levelSeparation * level;
            node.options.fixed.y = true;
          } else {
            node.x = this.options.hierarchical.levelSeparation * level;
            node.options.fixed.x = true;
          }
          if (distribution[level] === undefined) {
            distribution[level] = {};
          }
          distribution[level][nodeId] = node;
        }
      }
      return distribution;
    }

    /**
     * Get the hubsize from all remaining unlevelled nodes.
     *
     * @returns {number}
     * @private
     */

  }, {
    key: '_getHubSize',
    value: function _getHubSize() {
      var hubSize = 0;
      for (var nodeId in this.body.nodes) {
        if (this.body.nodes.hasOwnProperty(nodeId)) {
          var node = this.body.nodes[nodeId];
          if (this.hierarchicalLevels[nodeId] === undefined) {
            hubSize = node.edges.length < hubSize ? hubSize : node.edges.length;
          }
        }
      }
      return hubSize;
    }

    /**
     * this function allocates nodes in levels based on the recursive branching from the largest hubs.
     *
     * @param hubsize
     * @private
     */

  }, {
    key: '_determineLevelsByHubsize',
    value: function _determineLevelsByHubsize() {
      var _this3 = this;

      var hubSize = 1;

      var levelDownstream = function levelDownstream(nodeA, nodeB) {
        if (_this3.hierarchicalLevels[nodeB.id] === undefined) {
          // set initial level
          if (_this3.hierarchicalLevels[nodeA.id] === undefined) {
            _this3.hierarchicalLevels[nodeA.id] = 0;
          }
          // set level
          _this3.hierarchicalLevels[nodeB.id] = _this3.hierarchicalLevels[nodeA.id] + 1;
        }
      };

      while (hubSize > 0) {
        // determine hubs
        hubSize = this._getHubSize();
        if (hubSize === 0) break;

        for (var nodeId in this.body.nodes) {
          if (this.body.nodes.hasOwnProperty(nodeId)) {
            var node = this.body.nodes[nodeId];
            if (node.edges.length === hubSize) {
              this._crawlNetwork(levelDownstream, nodeId);
            }
          }
        }
      }
    }

    /**
     * TODO: release feature
     * @private
     */

  }, {
    key: '_determineLevelsCustomCallback',
    value: function _determineLevelsCustomCallback() {
      var _this4 = this;

      var minLevel = 100000;

      // TODO: this should come from options.
      var customCallback = function customCallback(nodeA, nodeB, edge) {};

      var levelByDirection = function levelByDirection(nodeA, nodeB, edge) {
        var levelA = _this4.hierarchicalLevels[nodeA.id];
        // set initial level
        if (levelA === undefined) {
          _this4.hierarchicalLevels[nodeA.id] = minLevel;
        }

        var diff = customCallback(_NetworkUtil2.default.cloneOptions(nodeA, 'node'), _NetworkUtil2.default.cloneOptions(nodeB, 'node'), _NetworkUtil2.default.cloneOptions(edge, 'edge'));

        _this4.hierarchicalLevels[nodeB.id] = _this4.hierarchicalLevels[nodeA.id] + diff;
      };

      this._crawlNetwork(levelByDirection);
      this._setMinLevelToZero();
    }

    /**
     * this function allocates nodes in levels based on the direction of the edges
     *
     * @param hubsize
     * @private
     */

  }, {
    key: '_determineLevelsDirected',
    value: function _determineLevelsDirected() {
      var _this5 = this;

      var minLevel = 10000;
      var levelByDirection = function levelByDirection(nodeA, nodeB, edge) {
        var levelA = _this5.hierarchicalLevels[nodeA.id];
        // set initial level
        if (levelA === undefined) {
          _this5.hierarchicalLevels[nodeA.id] = minLevel;
        }
        if (edge.toId == nodeB.id) {
          _this5.hierarchicalLevels[nodeB.id] = _this5.hierarchicalLevels[nodeA.id] + 1;
        } else {
          _this5.hierarchicalLevels[nodeB.id] = _this5.hierarchicalLevels[nodeA.id] - 1;
        }
      };
      this._crawlNetwork(levelByDirection);
      this._setMinLevelToZero();
    }

    /**
     * Small util method to set the minimum levels of the nodes to zero.
     * @private
     */

  }, {
    key: '_setMinLevelToZero',
    value: function _setMinLevelToZero() {
      var minLevel = 1e9;
      // get the minimum level
      for (var nodeId in this.body.nodes) {
        if (this.body.nodes.hasOwnProperty(nodeId)) {
          if (this.hierarchicalLevels[nodeId] !== undefined) {
            minLevel = Math.min(this.hierarchicalLevels[nodeId], minLevel);
          }
        }
      }

      // subtract the minimum from the set so we have a range starting from 0
      for (var _nodeId2 in this.body.nodes) {
        if (this.body.nodes.hasOwnProperty(_nodeId2)) {
          if (this.hierarchicalLevels[_nodeId2] !== undefined) {
            this.hierarchicalLevels[_nodeId2] -= minLevel;
          }
        }
      }
    }

    /**
     * Update the bookkeeping of parent and child.
     * @private
     */

  }, {
    key: '_generateMap',
    value: function _generateMap() {
      var _this6 = this;

      var fillInRelations = function fillInRelations(parentNode, childNode) {
        if (_this6.hierarchicalLevels[childNode.id] > _this6.hierarchicalLevels[parentNode.id]) {
          var parentNodeId = parentNode.id;
          var childNodeId = childNode.id;
          if (_this6.hierarchicalChildrenReference[parentNodeId] === undefined) {
            _this6.hierarchicalChildrenReference[parentNodeId] = [];
          }
          _this6.hierarchicalChildrenReference[parentNodeId].push(childNodeId);
          if (_this6.hierarchicalParentReference[childNodeId] === undefined) {
            _this6.hierarchicalParentReference[childNodeId] = [];
          }
          _this6.hierarchicalParentReference[childNodeId].push(parentNodeId);
        }
      };

      this._crawlNetwork(fillInRelations);
    }

    /**
     * Crawl over the entire network and use a callback on each node couple that is connected to each other.
     * @param callback          | will receive nodeA nodeB and the connecting edge. A and B are unique.
     * @param startingNodeId
     * @private
     */

  }, {
    key: '_crawlNetwork',
    value: function _crawlNetwork() {
      var _this7 = this;

      var callback = arguments.length <= 0 || arguments[0] === undefined ? function () {} : arguments[0];
      var startingNodeId = arguments[1];

      var progress = {};
      var treeIndex = 0;

      var crawler = function crawler(node, tree) {
        if (progress[node.id] === undefined) {

          if (_this7.hierarchicalTrees[node.id] === undefined) {
            _this7.hierarchicalTrees[node.id] = tree;
            _this7.treeIndex = Math.max(tree, _this7.treeIndex);
          }

          progress[node.id] = true;
          var childNode = void 0;
          for (var i = 0; i < node.edges.length; i++) {
            if (node.edges[i].connected === true) {
              if (node.edges[i].toId === node.id) {
                childNode = node.edges[i].from;
              } else {
                childNode = node.edges[i].to;
              }

              if (node.id !== childNode.id) {
                callback(node, childNode, node.edges[i]);
                crawler(childNode, tree);
              }
            }
          }
        }
      };

      // we can crawl from a specific node or over all nodes.
      if (startingNodeId === undefined) {
        for (var i = 0; i < this.body.nodeIndices.length; i++) {
          var node = this.body.nodes[this.body.nodeIndices[i]];
          if (progress[node.id] === undefined) {
            crawler(node, treeIndex);
            treeIndex += 1;
          }
        }
      } else {
        var _node = this.body.nodes[startingNodeId];
        if (_node === undefined) {
          console.error("Node not found:", startingNodeId);
          return;
        }
        crawler(_node);
      }
    }

    /**
     * Shift a branch a certain distance
     * @param parentId
     * @param diff
     * @private
     */

  }, {
    key: '_shiftBlock',
    value: function _shiftBlock(parentId, diff) {
      if (this.options.hierarchical.direction === 'UD' || this.options.hierarchical.direction === 'DU') {
        this.body.nodes[parentId].x += diff;
      } else {
        this.body.nodes[parentId].y += diff;
      }
      if (this.hierarchicalChildrenReference[parentId] !== undefined) {
        for (var i = 0; i < this.hierarchicalChildrenReference[parentId].length; i++) {
          this._shiftBlock(this.hierarchicalChildrenReference[parentId][i], diff);
        }
      }
    }

    /**
     * Find a common parent between branches.
     * @param childA
     * @param childB
     * @returns {{foundParent, withChild}}
     * @private
     */

  }, {
    key: '_findCommonParent',
    value: function _findCommonParent(childA, childB) {
      var _this8 = this;

      var parents = {};
      var iterateParents = function iterateParents(parents, child) {
        if (_this8.hierarchicalParentReference[child] !== undefined) {
          for (var i = 0; i < _this8.hierarchicalParentReference[child].length; i++) {
            var parent = _this8.hierarchicalParentReference[child][i];
            parents[parent] = true;
            iterateParents(parents, parent);
          }
        }
      };
      var findParent = function findParent(parents, child) {
        if (_this8.hierarchicalParentReference[child] !== undefined) {
          for (var i = 0; i < _this8.hierarchicalParentReference[child].length; i++) {
            var parent = _this8.hierarchicalParentReference[child][i];
            if (parents[parent] !== undefined) {
              return { foundParent: parent, withChild: child };
            }
            var branch = findParent(parents, parent);
            if (branch.foundParent !== null) {
              return branch;
            }
          }
        }
        return { foundParent: null, withChild: child };
      };

      iterateParents(parents, childA);
      return findParent(parents, childB);
    }

    /**
     * Abstract the getting of the position so we won't have to repeat the check for direction all the time
     * @param node
     * @param position
     * @param level
     * @private
     */

  }, {
    key: '_setPositionForHierarchy',
    value: function _setPositionForHierarchy(node, position, level) {
      var doNotUpdate = arguments.length <= 3 || arguments[3] === undefined ? false : arguments[3];

      //console.log('_setPositionForHierarchy',node.id, position)
      if (doNotUpdate !== true) {
        if (this.distributionOrdering[level] === undefined) {
          this.distributionOrdering[level] = [];
          this.distributionOrderingPresence[level] = {};
        }

        if (this.distributionOrderingPresence[level][node.id] === undefined) {
          this.distributionOrdering[level].push(node);
          this.distributionIndex[node.id] = this.distributionOrdering[level].length - 1;
        }
        this.distributionOrderingPresence[level][node.id] = true;
      }

      if (this.options.hierarchical.direction === 'UD' || this.options.hierarchical.direction === 'DU') {
        node.x = position;
      } else {
        node.y = position;
      }
    }

    /**
     * Abstract the getting of the position of a node so we do not have to repeat the direction check all the time.
     * @param node
     * @returns {number|*}
     * @private
     */

  }, {
    key: '_getPositionForHierarchy',
    value: function _getPositionForHierarchy(node) {
      if (this.options.hierarchical.direction === 'UD' || this.options.hierarchical.direction === 'DU') {
        return node.x;
      } else {
        return node.y;
      }
    }

    /**
     * Use the x or y value to sort the array, allowing users to specify order.
     * @param nodeArray
     * @private
     */

  }, {
    key: '_sortNodeArray',
    value: function _sortNodeArray(nodeArray) {
      if (nodeArray.length > 1) {
        if (this.options.hierarchical.direction === 'UD' || this.options.hierarchical.direction === 'DU') {
          nodeArray.sort(function (a, b) {
            return a.x - b.x;
          });
        } else {
          nodeArray.sort(function (a, b) {
            return a.y - b.y;
          });
        }
      }
    }
  }]);

  return LayoutEngine;
}();

exports.default = LayoutEngine;