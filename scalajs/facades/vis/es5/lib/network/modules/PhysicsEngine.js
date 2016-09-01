'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _BarnesHutSolver = require('./components/physics/BarnesHutSolver');

var _BarnesHutSolver2 = _interopRequireDefault(_BarnesHutSolver);

var _RepulsionSolver = require('./components/physics/RepulsionSolver');

var _RepulsionSolver2 = _interopRequireDefault(_RepulsionSolver);

var _HierarchicalRepulsionSolver = require('./components/physics/HierarchicalRepulsionSolver');

var _HierarchicalRepulsionSolver2 = _interopRequireDefault(_HierarchicalRepulsionSolver);

var _SpringSolver = require('./components/physics/SpringSolver');

var _SpringSolver2 = _interopRequireDefault(_SpringSolver);

var _HierarchicalSpringSolver = require('./components/physics/HierarchicalSpringSolver');

var _HierarchicalSpringSolver2 = _interopRequireDefault(_HierarchicalSpringSolver);

var _CentralGravitySolver = require('./components/physics/CentralGravitySolver');

var _CentralGravitySolver2 = _interopRequireDefault(_CentralGravitySolver);

var _FA2BasedRepulsionSolver = require('./components/physics/FA2BasedRepulsionSolver');

var _FA2BasedRepulsionSolver2 = _interopRequireDefault(_FA2BasedRepulsionSolver);

var _FA2BasedCentralGravitySolver = require('./components/physics/FA2BasedCentralGravitySolver');

var _FA2BasedCentralGravitySolver2 = _interopRequireDefault(_FA2BasedCentralGravitySolver);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var util = require('../../util');

var PhysicsEngine = function () {
  function PhysicsEngine(body) {
    _classCallCheck(this, PhysicsEngine);

    this.body = body;
    this.physicsBody = { physicsNodeIndices: [], physicsEdgeIndices: [], forces: {}, velocities: {} };

    this.physicsEnabled = true;
    this.simulationInterval = 1000 / 60;
    this.requiresTimeout = true;
    this.previousStates = {};
    this.referenceState = {};
    this.freezeCache = {};
    this.renderTimer = undefined;

    // parameters for the adaptive timestep
    this.adaptiveTimestep = false;
    this.adaptiveTimestepEnabled = false;
    this.adaptiveCounter = 0;
    this.adaptiveInterval = 3;

    this.stabilized = false;
    this.startedStabilization = false;
    this.stabilizationIterations = 0;
    this.ready = false; // will be set to true if the stabilize

    // default options
    this.options = {};
    this.defaultOptions = {
      enabled: true,
      barnesHut: {
        theta: 0.5,
        gravitationalConstant: -2000,
        centralGravity: 0.3,
        springLength: 95,
        springConstant: 0.04,
        damping: 0.09,
        avoidOverlap: 0
      },
      forceAtlas2Based: {
        theta: 0.5,
        gravitationalConstant: -50,
        centralGravity: 0.01,
        springConstant: 0.08,
        springLength: 100,
        damping: 0.4,
        avoidOverlap: 0
      },
      repulsion: {
        centralGravity: 0.2,
        springLength: 200,
        springConstant: 0.05,
        nodeDistance: 100,
        damping: 0.09,
        avoidOverlap: 0
      },
      hierarchicalRepulsion: {
        centralGravity: 0.0,
        springLength: 100,
        springConstant: 0.01,
        nodeDistance: 120,
        damping: 0.09
      },
      maxVelocity: 50,
      minVelocity: 0.75, // px/s
      solver: 'barnesHut',
      stabilization: {
        enabled: true,
        iterations: 1000, // maximum number of iteration to stabilize
        updateInterval: 50,
        onlyDynamicEdges: false,
        fit: true
      },
      timestep: 0.5,
      adaptiveTimestep: true
    };
    util.extend(this.options, this.defaultOptions);
    this.timestep = 0.5;
    this.layoutFailed = false;

    this.bindEventListeners();
  }

  _createClass(PhysicsEngine, [{
    key: 'bindEventListeners',
    value: function bindEventListeners() {
      var _this = this;

      this.body.emitter.on('initPhysics', function () {
        _this.initPhysics();
      });
      this.body.emitter.on('_layoutFailed', function () {
        _this.layoutFailed = true;
      });
      this.body.emitter.on('resetPhysics', function () {
        _this.stopSimulation();_this.ready = false;
      });
      this.body.emitter.on('disablePhysics', function () {
        _this.physicsEnabled = false;_this.stopSimulation();
      });
      this.body.emitter.on('restorePhysics', function () {
        _this.setOptions(_this.options);
        if (_this.ready === true) {
          _this.startSimulation();
        }
      });
      this.body.emitter.on('startSimulation', function () {
        if (_this.ready === true) {
          _this.startSimulation();
        }
      });
      this.body.emitter.on('stopSimulation', function () {
        _this.stopSimulation();
      });
      this.body.emitter.on('destroy', function () {
        _this.stopSimulation(false);
        _this.body.emitter.off();
      });
      // this event will trigger a rebuilding of the cache everything. Used when nodes or edges have been added or removed.
      this.body.emitter.on("_dataChanged", function () {
        // update shortcut lists
        _this.updatePhysicsData();
      });

      // debug: show forces
      // this.body.emitter.on("afterDrawing", (ctx) => {this._drawForces(ctx);});
    }

    /**
     * set the physics options
     * @param options
     */

  }, {
    key: 'setOptions',
    value: function setOptions(options) {
      if (options !== undefined) {
        if (options === false) {
          this.options.enabled = false;
          this.physicsEnabled = false;
          this.stopSimulation();
        } else {
          this.physicsEnabled = true;
          util.selectiveNotDeepExtend(['stabilization'], this.options, options);
          util.mergeOptions(this.options, options, 'stabilization');

          if (options.enabled === undefined) {
            this.options.enabled = true;
          }

          if (this.options.enabled === false) {
            this.physicsEnabled = false;
            this.stopSimulation();
          }

          // set the timestep
          this.timestep = this.options.timestep;
        }
      }
      this.init();
    }

    /**
     * configure the engine.
     */

  }, {
    key: 'init',
    value: function init() {
      var options;
      if (this.options.solver === 'forceAtlas2Based') {
        options = this.options.forceAtlas2Based;
        this.nodesSolver = new _FA2BasedRepulsionSolver2.default(this.body, this.physicsBody, options);
        this.edgesSolver = new _SpringSolver2.default(this.body, this.physicsBody, options);
        this.gravitySolver = new _FA2BasedCentralGravitySolver2.default(this.body, this.physicsBody, options);
      } else if (this.options.solver === 'repulsion') {
        options = this.options.repulsion;
        this.nodesSolver = new _RepulsionSolver2.default(this.body, this.physicsBody, options);
        this.edgesSolver = new _SpringSolver2.default(this.body, this.physicsBody, options);
        this.gravitySolver = new _CentralGravitySolver2.default(this.body, this.physicsBody, options);
      } else if (this.options.solver === 'hierarchicalRepulsion') {
        options = this.options.hierarchicalRepulsion;
        this.nodesSolver = new _HierarchicalRepulsionSolver2.default(this.body, this.physicsBody, options);
        this.edgesSolver = new _HierarchicalSpringSolver2.default(this.body, this.physicsBody, options);
        this.gravitySolver = new _CentralGravitySolver2.default(this.body, this.physicsBody, options);
      } else {
        // barnesHut
        options = this.options.barnesHut;
        this.nodesSolver = new _BarnesHutSolver2.default(this.body, this.physicsBody, options);
        this.edgesSolver = new _SpringSolver2.default(this.body, this.physicsBody, options);
        this.gravitySolver = new _CentralGravitySolver2.default(this.body, this.physicsBody, options);
      }

      this.modelOptions = options;
    }

    /**
     * initialize the engine
     */

  }, {
    key: 'initPhysics',
    value: function initPhysics() {
      if (this.physicsEnabled === true && this.options.enabled === true) {
        if (this.options.stabilization.enabled === true) {
          this.stabilize();
        } else {
          this.stabilized = false;
          this.ready = true;
          this.body.emitter.emit('fit', {}, this.layoutFailed); // if the layout failed, we use the approximation for the zoom
          this.startSimulation();
        }
      } else {
        this.ready = true;
        this.body.emitter.emit('fit');
      }
    }

    /**
     * Start the simulation
     */

  }, {
    key: 'startSimulation',
    value: function startSimulation() {
      if (this.physicsEnabled === true && this.options.enabled === true) {
        this.stabilized = false;

        // when visible, adaptivity is disabled.
        this.adaptiveTimestep = false;

        // this sets the width of all nodes initially which could be required for the avoidOverlap
        this.body.emitter.emit("_resizeNodes");
        if (this.viewFunction === undefined) {
          this.viewFunction = this.simulationStep.bind(this);
          this.body.emitter.on('initRedraw', this.viewFunction);
          this.body.emitter.emit('_startRendering');
        }
      } else {
        this.body.emitter.emit('_redraw');
      }
    }

    /**
     * Stop the simulation, force stabilization.
     */

  }, {
    key: 'stopSimulation',
    value: function stopSimulation() {
      var emit = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];

      this.stabilized = true;
      if (emit === true) {
        this._emitStabilized();
      }
      if (this.viewFunction !== undefined) {
        this.body.emitter.off('initRedraw', this.viewFunction);
        this.viewFunction = undefined;
        if (emit === true) {
          this.body.emitter.emit('_stopRendering');
        }
      }
    }

    /**
     * The viewFunction inserts this step into each render loop. It calls the physics tick and handles the cleanup at stabilized.
     *
     */

  }, {
    key: 'simulationStep',
    value: function simulationStep() {
      // check if the physics have settled
      var startTime = Date.now();
      this.physicsTick();
      var physicsTime = Date.now() - startTime;

      // run double speed if it is a little graph
      if ((physicsTime < 0.4 * this.simulationInterval || this.runDoubleSpeed === true) && this.stabilized === false) {
        this.physicsTick();

        // this makes sure there is no jitter. The decision is taken once to run it at double speed.
        this.runDoubleSpeed = true;
      }

      if (this.stabilized === true) {
        this.stopSimulation();
      }
    }

    /**
     * trigger the stabilized event.
     * @private
     */

  }, {
    key: '_emitStabilized',
    value: function _emitStabilized() {
      var _this2 = this;

      var amountOfIterations = arguments.length <= 0 || arguments[0] === undefined ? this.stabilizationIterations : arguments[0];

      if (this.stabilizationIterations > 1 || this.startedStabilization === true) {
        setTimeout(function () {
          _this2.body.emitter.emit('stabilized', { iterations: amountOfIterations });
          _this2.startedStabilization = false;
          _this2.stabilizationIterations = 0;
        }, 0);
      }
    }

    /**
     * A single simulation step (or 'tick') in the physics simulation
     *
     * @private
     */

  }, {
    key: 'physicsTick',
    value: function physicsTick() {
      // this is here to ensure that there is no start event when the network is already stable.
      if (this.startedStabilization === false) {
        this.body.emitter.emit('startStabilizing');
        this.startedStabilization = true;
      }

      if (this.stabilized === false) {
        // adaptivity means the timestep adapts to the situation, only applicable for stabilization
        if (this.adaptiveTimestep === true && this.adaptiveTimestepEnabled === true) {
          // this is the factor for increasing the timestep on success.
          var factor = 1.2;

          // we assume the adaptive interval is
          if (this.adaptiveCounter % this.adaptiveInterval === 0) {
            // we leave the timestep stable for "interval" iterations.
            // first the big step and revert. Revert saves the reference state.
            this.timestep = 2 * this.timestep;
            this.calculateForces();
            this.moveNodes();
            this.revert();

            // now the normal step. Since this is the last step, it is the more stable one and we will take this.
            this.timestep = 0.5 * this.timestep;

            // since it's half the step, we do it twice.
            this.calculateForces();
            this.moveNodes();
            this.calculateForces();
            this.moveNodes();

            // we compare the two steps. if it is acceptable we double the step.
            if (this._evaluateStepQuality() === true) {
              this.timestep = factor * this.timestep;
            } else {
              // if not, we decrease the step to a minimum of the options timestep.
              // if the decreased timestep is smaller than the options step, we do not reset the counter
              // we assume that the options timestep is stable enough.
              if (this.timestep / factor < this.options.timestep) {
                this.timestep = this.options.timestep;
              } else {
                // if the timestep was larger than 2 times the option one we check the adaptivity again to ensure
                // that large instabilities do not form.
                this.adaptiveCounter = -1; // check again next iteration
                this.timestep = Math.max(this.options.timestep, this.timestep / factor);
              }
            }
          } else {
            // normal step, keeping timestep constant
            this.calculateForces();
            this.moveNodes();
          }

          // increment the counter
          this.adaptiveCounter += 1;
        } else {
          // case for the static timestep, we reset it to the one in options and take a normal step.
          this.timestep = this.options.timestep;
          this.calculateForces();
          this.moveNodes();
        }

        // determine if the network has stabilzied
        if (this.stabilized === true) {
          this.revert();
        }

        this.stabilizationIterations++;
      }
    }

    /**
     * Nodes and edges can have the physics toggles on or off. A collection of indices is created here so we can skip the check all the time.
     *
     * @private
     */

  }, {
    key: 'updatePhysicsData',
    value: function updatePhysicsData() {
      this.physicsBody.forces = {};
      this.physicsBody.physicsNodeIndices = [];
      this.physicsBody.physicsEdgeIndices = [];
      var nodes = this.body.nodes;
      var edges = this.body.edges;

      // get node indices for physics
      for (var nodeId in nodes) {
        if (nodes.hasOwnProperty(nodeId)) {
          if (nodes[nodeId].options.physics === true) {
            this.physicsBody.physicsNodeIndices.push(nodes[nodeId].id);
          }
        }
      }

      // get edge indices for physics
      for (var edgeId in edges) {
        if (edges.hasOwnProperty(edgeId)) {
          if (edges[edgeId].options.physics === true) {
            this.physicsBody.physicsEdgeIndices.push(edges[edgeId].id);
          }
        }
      }

      // get the velocity and the forces vector
      for (var i = 0; i < this.physicsBody.physicsNodeIndices.length; i++) {
        var _nodeId = this.physicsBody.physicsNodeIndices[i];
        this.physicsBody.forces[_nodeId] = { x: 0, y: 0 };

        // forces can be reset because they are recalculated. Velocities have to persist.
        if (this.physicsBody.velocities[_nodeId] === undefined) {
          this.physicsBody.velocities[_nodeId] = { x: 0, y: 0 };
        }
      }

      // clean deleted nodes from the velocity vector
      for (var _nodeId2 in this.physicsBody.velocities) {
        if (nodes[_nodeId2] === undefined) {
          delete this.physicsBody.velocities[_nodeId2];
        }
      }
    }

    /**
     * Revert the simulation one step. This is done so after stabilization, every new start of the simulation will also say stabilized.
     */

  }, {
    key: 'revert',
    value: function revert() {
      var nodeIds = Object.keys(this.previousStates);
      var nodes = this.body.nodes;
      var velocities = this.physicsBody.velocities;
      this.referenceState = {};

      for (var i = 0; i < nodeIds.length; i++) {
        var nodeId = nodeIds[i];
        if (nodes[nodeId] !== undefined) {
          if (nodes[nodeId].options.physics === true) {
            this.referenceState[nodeId] = {
              positions: { x: nodes[nodeId].x, y: nodes[nodeId].y }
            };
            velocities[nodeId].x = this.previousStates[nodeId].vx;
            velocities[nodeId].y = this.previousStates[nodeId].vy;
            nodes[nodeId].x = this.previousStates[nodeId].x;
            nodes[nodeId].y = this.previousStates[nodeId].y;
          }
        } else {
          delete this.previousStates[nodeId];
        }
      }
    }

    /**
     * This compares the reference state to the current state
     */

  }, {
    key: '_evaluateStepQuality',
    value: function _evaluateStepQuality() {
      var dx = void 0,
          dy = void 0,
          dpos = void 0;
      var nodes = this.body.nodes;
      var reference = this.referenceState;
      var posThreshold = 0.3;

      for (var nodeId in this.referenceState) {
        if (this.referenceState.hasOwnProperty(nodeId) && nodes[nodeId] !== undefined) {
          dx = nodes[nodeId].x - reference[nodeId].positions.x;
          dy = nodes[nodeId].y - reference[nodeId].positions.y;

          dpos = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));

          if (dpos > posThreshold) {
            return false;
          }
        }
      }
      return true;
    }

    /**
     * move the nodes one timestep and check if they are stabilized
     * @returns {boolean}
     */

  }, {
    key: 'moveNodes',
    value: function moveNodes() {
      var nodeIndices = this.physicsBody.physicsNodeIndices;
      var maxVelocity = this.options.maxVelocity ? this.options.maxVelocity : 1e9;
      var maxNodeVelocity = 0;
      var averageNodeVelocity = 0;

      // the velocity threshold (energy in the system) for the adaptivity toggle
      var velocityAdaptiveThreshold = 5;

      for (var i = 0; i < nodeIndices.length; i++) {
        var nodeId = nodeIndices[i];
        var nodeVelocity = this._performStep(nodeId, maxVelocity);
        // stabilized is true if stabilized is true and velocity is smaller than vmin --> all nodes must be stabilized
        maxNodeVelocity = Math.max(maxNodeVelocity, nodeVelocity);
        averageNodeVelocity += nodeVelocity;
      }

      // evaluating the stabilized and adaptiveTimestepEnabled conditions
      this.adaptiveTimestepEnabled = averageNodeVelocity / nodeIndices.length < velocityAdaptiveThreshold;
      this.stabilized = maxNodeVelocity < this.options.minVelocity;
    }

    /**
     * Perform the actual step
     *
     * @param nodeId
     * @param maxVelocity
     * @returns {number}
     * @private
     */

  }, {
    key: '_performStep',
    value: function _performStep(nodeId, maxVelocity) {
      var node = this.body.nodes[nodeId];
      var timestep = this.timestep;
      var forces = this.physicsBody.forces;
      var velocities = this.physicsBody.velocities;

      // store the state so we can revert
      this.previousStates[nodeId] = { x: node.x, y: node.y, vx: velocities[nodeId].x, vy: velocities[nodeId].y };

      if (node.options.fixed.x === false) {
        var dx = this.modelOptions.damping * velocities[nodeId].x; // damping force
        var ax = (forces[nodeId].x - dx) / node.options.mass; // acceleration
        velocities[nodeId].x += ax * timestep; // velocity
        velocities[nodeId].x = Math.abs(velocities[nodeId].x) > maxVelocity ? velocities[nodeId].x > 0 ? maxVelocity : -maxVelocity : velocities[nodeId].x;
        node.x += velocities[nodeId].x * timestep; // position
      } else {
        forces[nodeId].x = 0;
        velocities[nodeId].x = 0;
      }

      if (node.options.fixed.y === false) {
        var dy = this.modelOptions.damping * velocities[nodeId].y; // damping force
        var ay = (forces[nodeId].y - dy) / node.options.mass; // acceleration
        velocities[nodeId].y += ay * timestep; // velocity
        velocities[nodeId].y = Math.abs(velocities[nodeId].y) > maxVelocity ? velocities[nodeId].y > 0 ? maxVelocity : -maxVelocity : velocities[nodeId].y;
        node.y += velocities[nodeId].y * timestep; // position
      } else {
        forces[nodeId].y = 0;
        velocities[nodeId].y = 0;
      }

      var totalVelocity = Math.sqrt(Math.pow(velocities[nodeId].x, 2) + Math.pow(velocities[nodeId].y, 2));
      return totalVelocity;
    }

    /**
     * calculate the forces for one physics iteration.
     */

  }, {
    key: 'calculateForces',
    value: function calculateForces() {
      this.gravitySolver.solve();
      this.nodesSolver.solve();
      this.edgesSolver.solve();
    }

    /**
     * When initializing and stabilizing, we can freeze nodes with a predefined position. This greatly speeds up stabilization
     * because only the supportnodes for the smoothCurves have to settle.
     *
     * @private
     */

  }, {
    key: '_freezeNodes',
    value: function _freezeNodes() {
      var nodes = this.body.nodes;
      for (var id in nodes) {
        if (nodes.hasOwnProperty(id)) {
          if (nodes[id].x && nodes[id].y) {
            this.freezeCache[id] = { x: nodes[id].options.fixed.x, y: nodes[id].options.fixed.y };
            nodes[id].options.fixed.x = true;
            nodes[id].options.fixed.y = true;
          }
        }
      }
    }

    /**
     * Unfreezes the nodes that have been frozen by _freezeDefinedNodes.
     *
     * @private
     */

  }, {
    key: '_restoreFrozenNodes',
    value: function _restoreFrozenNodes() {
      var nodes = this.body.nodes;
      for (var id in nodes) {
        if (nodes.hasOwnProperty(id)) {
          if (this.freezeCache[id] !== undefined) {
            nodes[id].options.fixed.x = this.freezeCache[id].x;
            nodes[id].options.fixed.y = this.freezeCache[id].y;
          }
        }
      }
      this.freezeCache = {};
    }

    /**
     * Find a stable position for all nodes
     */

  }, {
    key: 'stabilize',
    value: function stabilize() {
      var _this3 = this;

      var iterations = arguments.length <= 0 || arguments[0] === undefined ? this.options.stabilization.iterations : arguments[0];

      if (typeof iterations !== 'number') {
        console.log('The stabilize method needs a numeric amount of iterations. Switching to default: ', this.options.stabilization.iterations);
        iterations = this.options.stabilization.iterations;
      }

      if (this.physicsBody.physicsNodeIndices.length === 0) {
        this.ready = true;
        return;
      }

      // enable adaptive timesteps
      this.adaptiveTimestep = true && this.options.adaptiveTimestep;

      // this sets the width of all nodes initially which could be required for the avoidOverlap
      this.body.emitter.emit("_resizeNodes");

      // stop the render loop
      this.stopSimulation();

      // set stabilze to false
      this.stabilized = false;

      // block redraw requests
      this.body.emitter.emit('_blockRedraw');
      this.targetIterations = iterations;

      // start the stabilization
      if (this.options.stabilization.onlyDynamicEdges === true) {
        this._freezeNodes();
      }
      this.stabilizationIterations = 0;

      setTimeout(function () {
        return _this3._stabilizationBatch();
      }, 0);
    }

    /**
     * One batch of stabilization
     * @private
     */

  }, {
    key: '_stabilizationBatch',
    value: function _stabilizationBatch() {
      // this is here to ensure that there is at least one start event.
      if (this.startedStabilization === false) {
        this.body.emitter.emit('startStabilizing');
        this.startedStabilization = true;
      }

      var count = 0;
      while (this.stabilized === false && count < this.options.stabilization.updateInterval && this.stabilizationIterations < this.targetIterations) {
        this.physicsTick();
        count++;
      }

      if (this.stabilized === false && this.stabilizationIterations < this.targetIterations) {
        this.body.emitter.emit('stabilizationProgress', { iterations: this.stabilizationIterations, total: this.targetIterations });
        setTimeout(this._stabilizationBatch.bind(this), 0);
      } else {
        this._finalizeStabilization();
      }
    }

    /**
     * Wrap up the stabilization, fit and emit the events.
     * @private
     */

  }, {
    key: '_finalizeStabilization',
    value: function _finalizeStabilization() {
      this.body.emitter.emit('_allowRedraw');
      if (this.options.stabilization.fit === true) {
        this.body.emitter.emit('fit');
      }

      if (this.options.stabilization.onlyDynamicEdges === true) {
        this._restoreFrozenNodes();
      }

      this.body.emitter.emit('stabilizationIterationsDone');
      this.body.emitter.emit('_requestRedraw');

      if (this.stabilized === true) {
        this._emitStabilized();
      } else {
        this.startSimulation();
      }

      this.ready = true;
    }
  }, {
    key: '_drawForces',
    value: function _drawForces(ctx) {
      for (var i = 0; i < this.physicsBody.physicsNodeIndices.length; i++) {
        var node = this.body.nodes[this.physicsBody.physicsNodeIndices[i]];
        var force = this.physicsBody.forces[this.physicsBody.physicsNodeIndices[i]];
        var factor = 20;
        var colorFactor = 0.03;
        var forceSize = Math.sqrt(Math.pow(force.x, 2) + Math.pow(force.x, 2));

        var size = Math.min(Math.max(5, forceSize), 15);
        var arrowSize = 3 * size;

        var color = util.HSVToHex((180 - Math.min(1, Math.max(0, colorFactor * forceSize)) * 180) / 360, 1, 1);

        ctx.lineWidth = size;
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(node.x, node.y);
        ctx.lineTo(node.x + factor * force.x, node.y + factor * force.y);
        ctx.stroke();

        var angle = Math.atan2(force.y, force.x);
        ctx.fillStyle = color;
        ctx.arrow(node.x + factor * force.x + Math.cos(angle) * arrowSize, node.y + factor * force.y + Math.sin(angle) * arrowSize, angle, arrowSize);
        ctx.fill();
      }
    }
  }]);

  return PhysicsEngine;
}();

exports.default = PhysicsEngine;