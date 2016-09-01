"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Created by Alex on 10-Aug-15.
 */

var FloydWarshall = function () {
  function FloydWarshall() {
    _classCallCheck(this, FloydWarshall);
  }

  _createClass(FloydWarshall, [{
    key: "getDistances",
    value: function getDistances(body, nodesArray, edgesArray) {
      var D_matrix = {};
      var edges = body.edges;

      // prepare matrix with large numbers
      for (var i = 0; i < nodesArray.length; i++) {
        D_matrix[nodesArray[i]] = {};
        D_matrix[nodesArray[i]] = {};
        for (var j = 0; j < nodesArray.length; j++) {
          D_matrix[nodesArray[i]][nodesArray[j]] = i == j ? 0 : 1e9;
          D_matrix[nodesArray[i]][nodesArray[j]] = i == j ? 0 : 1e9;
        }
      }

      // put the weights for the edges in. This assumes unidirectionality.
      for (var _i = 0; _i < edgesArray.length; _i++) {
        var edge = edges[edgesArray[_i]];
        // edge has to be connected if it counts to the distances. If it is connected to inner clusters it will crash so we also check if it is in the D_matrix
        if (edge.connected === true && D_matrix[edge.fromId] !== undefined && D_matrix[edge.toId] !== undefined) {
          D_matrix[edge.fromId][edge.toId] = 1;
          D_matrix[edge.toId][edge.fromId] = 1;
        }
      }

      var nodeCount = nodesArray.length;

      // Adapted FloydWarshall based on unidirectionality to greatly reduce complexity.
      for (var k = 0; k < nodeCount; k++) {
        for (var _i2 = 0; _i2 < nodeCount - 1; _i2++) {
          for (var _j = _i2 + 1; _j < nodeCount; _j++) {
            D_matrix[nodesArray[_i2]][nodesArray[_j]] = Math.min(D_matrix[nodesArray[_i2]][nodesArray[_j]], D_matrix[nodesArray[_i2]][nodesArray[k]] + D_matrix[nodesArray[k]][nodesArray[_j]]);
            D_matrix[nodesArray[_j]][nodesArray[_i2]] = D_matrix[nodesArray[_i2]][nodesArray[_j]];
          }
        }
      }

      return D_matrix;
    }
  }]);

  return FloydWarshall;
}();

exports.default = FloydWarshall;