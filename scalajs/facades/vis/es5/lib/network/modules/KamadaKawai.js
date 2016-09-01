"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); // distance finding algorithm


var _FloydWarshall = require("./components/algorithms/FloydWarshall.js");

var _FloydWarshall2 = _interopRequireDefault(_FloydWarshall);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * KamadaKawai positions the nodes initially based on
 *
 * "AN ALGORITHM FOR DRAWING GENERAL UNDIRECTED GRAPHS"
 * -- Tomihisa KAMADA and Satoru KAWAI in 1989
 *
 * Possible optimizations in the distance calculation can be implemented.
 */
var KamadaKawai = function () {
  function KamadaKawai(body, edgeLength, edgeStrength) {
    _classCallCheck(this, KamadaKawai);

    this.body = body;
    this.springLength = edgeLength;
    this.springConstant = edgeStrength;
    this.distanceSolver = new _FloydWarshall2.default();
  }

  /**
   * Not sure if needed but can be used to update the spring length and spring constant
   * @param options
   */


  _createClass(KamadaKawai, [{
    key: "setOptions",
    value: function setOptions(options) {
      if (options) {
        if (options.springLength) {
          this.springLength = options.springLength;
        }
        if (options.springConstant) {
          this.springConstant = options.springConstant;
        }
      }
    }

    /**
     * Position the system
     * @param nodesArray
     * @param edgesArray
     */

  }, {
    key: "solve",
    value: function solve(nodesArray, edgesArray) {
      var ignoreClusters = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

      // get distance matrix
      var D_matrix = this.distanceSolver.getDistances(this.body, nodesArray, edgesArray); // distance matrix

      // get the L Matrix
      this._createL_matrix(D_matrix);

      // get the K Matrix
      this._createK_matrix(D_matrix);

      // calculate positions
      var threshold = 0.01;
      var innerThreshold = 1;
      var iterations = 0;
      var maxIterations = Math.max(1000, Math.min(10 * this.body.nodeIndices.length, 6000));
      var maxInnerIterations = 5;

      var maxEnergy = 1e9;
      var highE_nodeId = 0,
          dE_dx = 0,
          dE_dy = 0,
          delta_m = 0,
          subIterations = 0;

      while (maxEnergy > threshold && iterations < maxIterations) {
        iterations += 1;

        var _getHighestEnergyNode2 = this._getHighestEnergyNode(ignoreClusters);

        var _getHighestEnergyNode3 = _slicedToArray(_getHighestEnergyNode2, 4);

        highE_nodeId = _getHighestEnergyNode3[0];
        maxEnergy = _getHighestEnergyNode3[1];
        dE_dx = _getHighestEnergyNode3[2];
        dE_dy = _getHighestEnergyNode3[3];

        delta_m = maxEnergy;
        subIterations = 0;
        while (delta_m > innerThreshold && subIterations < maxInnerIterations) {
          subIterations += 1;
          this._moveNode(highE_nodeId, dE_dx, dE_dy);

          var _getEnergy2 = this._getEnergy(highE_nodeId);

          var _getEnergy3 = _slicedToArray(_getEnergy2, 3);

          delta_m = _getEnergy3[0];
          dE_dx = _getEnergy3[1];
          dE_dy = _getEnergy3[2];
        }
      }
    }

    /**
     * get the node with the highest energy
     * @returns {*[]}
     * @private
     */

  }, {
    key: "_getHighestEnergyNode",
    value: function _getHighestEnergyNode(ignoreClusters) {
      var nodesArray = this.body.nodeIndices;
      var nodes = this.body.nodes;
      var maxEnergy = 0;
      var maxEnergyNodeId = nodesArray[0];
      var dE_dx_max = 0,
          dE_dy_max = 0;

      for (var nodeIdx = 0; nodeIdx < nodesArray.length; nodeIdx++) {
        var m = nodesArray[nodeIdx];
        // by not evaluating nodes with predefined positions we should only move nodes that have no positions.
        if (nodes[m].predefinedPosition === false || nodes[m].isCluster === true && ignoreClusters === true || nodes[m].options.fixed.x === true || nodes[m].options.fixed.y === true) {
          var _getEnergy4 = this._getEnergy(m);

          var _getEnergy5 = _slicedToArray(_getEnergy4, 3);

          var delta_m = _getEnergy5[0];
          var dE_dx = _getEnergy5[1];
          var dE_dy = _getEnergy5[2];

          if (maxEnergy < delta_m) {
            maxEnergy = delta_m;
            maxEnergyNodeId = m;
            dE_dx_max = dE_dx;
            dE_dy_max = dE_dy;
          }
        }
      }

      return [maxEnergyNodeId, maxEnergy, dE_dx_max, dE_dy_max];
    }

    /**
     * calculate the energy of a single node
     * @param m
     * @returns {*[]}
     * @private
     */

  }, {
    key: "_getEnergy",
    value: function _getEnergy(m) {
      var nodesArray = this.body.nodeIndices;
      var nodes = this.body.nodes;

      var x_m = nodes[m].x;
      var y_m = nodes[m].y;
      var dE_dx = 0;
      var dE_dy = 0;
      for (var iIdx = 0; iIdx < nodesArray.length; iIdx++) {
        var i = nodesArray[iIdx];
        if (i !== m) {
          var x_i = nodes[i].x;
          var y_i = nodes[i].y;
          var denominator = 1.0 / Math.sqrt(Math.pow(x_m - x_i, 2) + Math.pow(y_m - y_i, 2));
          dE_dx += this.K_matrix[m][i] * (x_m - x_i - this.L_matrix[m][i] * (x_m - x_i) * denominator);
          dE_dy += this.K_matrix[m][i] * (y_m - y_i - this.L_matrix[m][i] * (y_m - y_i) * denominator);
        }
      }

      var delta_m = Math.sqrt(Math.pow(dE_dx, 2) + Math.pow(dE_dy, 2));
      return [delta_m, dE_dx, dE_dy];
    }

    /**
     * move the node based on it's energy
     * the dx and dy are calculated from the linear system proposed by Kamada and Kawai
     * @param m
     * @param dE_dx
     * @param dE_dy
     * @private
     */

  }, {
    key: "_moveNode",
    value: function _moveNode(m, dE_dx, dE_dy) {
      var nodesArray = this.body.nodeIndices;
      var nodes = this.body.nodes;
      var d2E_dx2 = 0;
      var d2E_dxdy = 0;
      var d2E_dy2 = 0;

      var x_m = nodes[m].x;
      var y_m = nodes[m].y;
      for (var iIdx = 0; iIdx < nodesArray.length; iIdx++) {
        var i = nodesArray[iIdx];
        if (i !== m) {
          var x_i = nodes[i].x;
          var y_i = nodes[i].y;
          var denominator = 1.0 / Math.pow(Math.pow(x_m - x_i, 2) + Math.pow(y_m - y_i, 2), 1.5);
          d2E_dx2 += this.K_matrix[m][i] * (1 - this.L_matrix[m][i] * Math.pow(y_m - y_i, 2) * denominator);
          d2E_dxdy += this.K_matrix[m][i] * (this.L_matrix[m][i] * (x_m - x_i) * (y_m - y_i) * denominator);
          d2E_dy2 += this.K_matrix[m][i] * (1 - this.L_matrix[m][i] * Math.pow(x_m - x_i, 2) * denominator);
        }
      }
      // make the variable names easier to make the solving of the linear system easier to read
      var A = d2E_dx2,
          B = d2E_dxdy,
          C = dE_dx,
          D = d2E_dy2,
          E = dE_dy;

      // solve the linear system for dx and dy
      var dy = (C / A + E / B) / (B / A - D / B);
      var dx = -(B * dy + C) / A;

      // move the node
      nodes[m].x += dx;
      nodes[m].y += dy;
    }

    /**
     * Create the L matrix: edge length times shortest path
     * @param D_matrix
     * @private
     */

  }, {
    key: "_createL_matrix",
    value: function _createL_matrix(D_matrix) {
      var nodesArray = this.body.nodeIndices;
      var edgeLength = this.springLength;

      this.L_matrix = [];
      for (var i = 0; i < nodesArray.length; i++) {
        this.L_matrix[nodesArray[i]] = {};
        for (var j = 0; j < nodesArray.length; j++) {
          this.L_matrix[nodesArray[i]][nodesArray[j]] = edgeLength * D_matrix[nodesArray[i]][nodesArray[j]];
        }
      }
    }

    /**
     * Create the K matrix: spring constants times shortest path
     * @param D_matrix
     * @private
     */

  }, {
    key: "_createK_matrix",
    value: function _createK_matrix(D_matrix) {
      var nodesArray = this.body.nodeIndices;
      var edgeStrength = this.springConstant;

      this.K_matrix = [];
      for (var i = 0; i < nodesArray.length; i++) {
        this.K_matrix[nodesArray[i]] = {};
        for (var j = 0; j < nodesArray.length; j++) {
          this.K_matrix[nodesArray[i]][nodesArray[j]] = edgeStrength * Math.pow(D_matrix[nodesArray[i]][nodesArray[j]], -2);
        }
      }
    }
  }]);

  return KamadaKawai;
}();

exports.default = KamadaKawai;