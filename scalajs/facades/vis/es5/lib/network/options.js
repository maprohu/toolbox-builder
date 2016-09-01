'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * This object contains all possible options. It will check if the types are correct, if required if the option is one
 * of the allowed values.
 *
 * __any__ means that the name of the property does not matter.
 * __type__ is a required field for all objects and contains the allowed types of all objects
 */
var string = 'string';
var boolean = 'boolean';
var number = 'number';
var array = 'array';
var object = 'object'; // should only be in a __type__ property
var dom = 'dom';
var any = 'any';

var allOptions = {
  configure: {
    enabled: { boolean: boolean },
    filter: { boolean: boolean, string: string, array: array, 'function': 'function' },
    container: { dom: dom },
    showButton: { boolean: boolean },
    __type__: { object: object, boolean: boolean, string: string, array: array, 'function': 'function' }
  },
  edges: {
    arrows: {
      to: { enabled: { boolean: boolean }, scaleFactor: { number: number }, __type__: { object: object, boolean: boolean } },
      middle: { enabled: { boolean: boolean }, scaleFactor: { number: number }, __type__: { object: object, boolean: boolean } },
      from: { enabled: { boolean: boolean }, scaleFactor: { number: number }, __type__: { object: object, boolean: boolean } },
      __type__: { string: ['from', 'to', 'middle'], object: object }
    },
    arrowStrikethrough: { boolean: boolean },
    color: {
      color: { string: string },
      highlight: { string: string },
      hover: { string: string },
      inherit: { string: ['from', 'to', 'both'], boolean: boolean },
      opacity: { number: number },
      __type__: { object: object, string: string }
    },
    dashes: { boolean: boolean, array: array },
    font: {
      color: { string: string },
      size: { number: number }, // px
      face: { string: string },
      background: { string: string },
      strokeWidth: { number: number }, // px
      strokeColor: { string: string },
      align: { string: ['horizontal', 'top', 'middle', 'bottom'] },
      __type__: { object: object, string: string }
    },
    hidden: { boolean: boolean },
    hoverWidth: { 'function': 'function', number: number },
    label: { string: string, 'undefined': 'undefined' },
    labelHighlightBold: { boolean: boolean },
    length: { number: number, 'undefined': 'undefined' },
    physics: { boolean: boolean },
    scaling: {
      min: { number: number },
      max: { number: number },
      label: {
        enabled: { boolean: boolean },
        min: { number: number },
        max: { number: number },
        maxVisible: { number: number },
        drawThreshold: { number: number },
        __type__: { object: object, boolean: boolean }
      },
      customScalingFunction: { 'function': 'function' },
      __type__: { object: object }
    },
    selectionWidth: { 'function': 'function', number: number },
    selfReferenceSize: { number: number },
    shadow: {
      enabled: { boolean: boolean },
      color: { string: string },
      size: { number: number },
      x: { number: number },
      y: { number: number },
      __type__: { object: object, boolean: boolean }
    },
    smooth: {
      enabled: { boolean: boolean },
      type: { string: ['dynamic', 'continuous', 'discrete', 'diagonalCross', 'straightCross', 'horizontal', 'vertical', 'curvedCW', 'curvedCCW', 'cubicBezier'] },
      roundness: { number: number },
      forceDirection: { string: ['horizontal', 'vertical', 'none'], boolean: boolean },
      __type__: { object: object, boolean: boolean }
    },
    title: { string: string, 'undefined': 'undefined' },
    width: { number: number },
    value: { number: number, 'undefined': 'undefined' },
    __type__: { object: object }
  },
  groups: {
    useDefaultGroups: { boolean: boolean },
    __any__: 'get from nodes, will be overwritten below',
    __type__: { object: object }
  },
  interaction: {
    dragNodes: { boolean: boolean },
    dragView: { boolean: boolean },
    hideEdgesOnDrag: { boolean: boolean },
    hideNodesOnDrag: { boolean: boolean },
    hover: { boolean: boolean },
    keyboard: {
      enabled: { boolean: boolean },
      speed: { x: { number: number }, y: { number: number }, zoom: { number: number }, __type__: { object: object } },
      bindToWindow: { boolean: boolean },
      __type__: { object: object, boolean: boolean }
    },
    multiselect: { boolean: boolean },
    navigationButtons: { boolean: boolean },
    selectable: { boolean: boolean },
    selectConnectedEdges: { boolean: boolean },
    hoverConnectedEdges: { boolean: boolean },
    tooltipDelay: { number: number },
    zoomView: { boolean: boolean },
    __type__: { object: object }
  },
  layout: {
    randomSeed: { 'undefined': 'undefined', number: number },
    improvedLayout: { boolean: boolean },
    hierarchical: {
      enabled: { boolean: boolean },
      levelSeparation: { number: number },
      nodeSpacing: { number: number },
      treeSpacing: { number: number },
      blockShifting: { boolean: boolean },
      edgeMinimization: { boolean: boolean },
      parentCentralization: { boolean: boolean },
      direction: { string: ['UD', 'DU', 'LR', 'RL'] }, // UD, DU, LR, RL
      sortMethod: { string: ['hubsize', 'directed'] }, // hubsize, directed
      __type__: { object: object, boolean: boolean }
    },
    __type__: { object: object }
  },
  manipulation: {
    enabled: { boolean: boolean },
    initiallyActive: { boolean: boolean },
    addNode: { boolean: boolean, 'function': 'function' },
    addEdge: { boolean: boolean, 'function': 'function' },
    editNode: { 'function': 'function' },
    editEdge: { boolean: boolean, 'function': 'function' },
    deleteNode: { boolean: boolean, 'function': 'function' },
    deleteEdge: { boolean: boolean, 'function': 'function' },
    controlNodeStyle: 'get from nodes, will be overwritten below',
    __type__: { object: object, boolean: boolean }
  },
  nodes: {
    borderWidth: { number: number },
    borderWidthSelected: { number: number, 'undefined': 'undefined' },
    brokenImage: { string: string, 'undefined': 'undefined' },
    color: {
      border: { string: string },
      background: { string: string },
      highlight: {
        border: { string: string },
        background: { string: string },
        __type__: { object: object, string: string }
      },
      hover: {
        border: { string: string },
        background: { string: string },
        __type__: { object: object, string: string }
      },
      __type__: { object: object, string: string }
    },
    fixed: {
      x: { boolean: boolean },
      y: { boolean: boolean },
      __type__: { object: object, boolean: boolean }
    },
    font: {
      align: { string: string },
      color: { string: string },
      size: { number: number }, // px
      face: { string: string },
      background: { string: string },
      strokeWidth: { number: number }, // px
      strokeColor: { string: string },
      __type__: { object: object, string: string }
    },
    group: { string: string, number: number, 'undefined': 'undefined' },
    hidden: { boolean: boolean },
    icon: {
      face: { string: string },
      code: { string: string }, //'\uf007',
      size: { number: number }, //50,
      color: { string: string },
      __type__: { object: object }
    },
    id: { string: string, number: number },
    image: { string: string, 'undefined': 'undefined' }, // --> URL
    label: { string: string, 'undefined': 'undefined' },
    labelHighlightBold: { boolean: boolean },
    level: { number: number, 'undefined': 'undefined' },
    mass: { number: number },
    physics: { boolean: boolean },
    scaling: {
      min: { number: number },
      max: { number: number },
      label: {
        enabled: { boolean: boolean },
        min: { number: number },
        max: { number: number },
        maxVisible: { number: number },
        drawThreshold: { number: number },
        __type__: { object: object, boolean: boolean }
      },
      customScalingFunction: { 'function': 'function' },
      __type__: { object: object }
    },
    shadow: {
      enabled: { boolean: boolean },
      color: { string: string },
      size: { number: number },
      x: { number: number },
      y: { number: number },
      __type__: { object: object, boolean: boolean }
    },
    shape: { string: ['ellipse', 'circle', 'database', 'box', 'text', 'image', 'circularImage', 'diamond', 'dot', 'star', 'triangle', 'triangleDown', 'square', 'icon'] },
    shapeProperties: {
      borderDashes: { boolean: boolean, array: array },
      borderRadius: { number: number },
      interpolation: { boolean: boolean },
      useImageSize: { boolean: boolean },
      useBorderWithImage: { boolean: boolean },
      __type__: { object: object }
    },
    size: { number: number },
    title: { string: string, 'undefined': 'undefined' },
    value: { number: number, 'undefined': 'undefined' },
    x: { number: number },
    y: { number: number },
    __type__: { object: object }
  },
  physics: {
    enabled: { boolean: boolean },
    barnesHut: {
      gravitationalConstant: { number: number },
      centralGravity: { number: number },
      springLength: { number: number },
      springConstant: { number: number },
      damping: { number: number },
      avoidOverlap: { number: number },
      __type__: { object: object }
    },
    forceAtlas2Based: {
      gravitationalConstant: { number: number },
      centralGravity: { number: number },
      springLength: { number: number },
      springConstant: { number: number },
      damping: { number: number },
      avoidOverlap: { number: number },
      __type__: { object: object }
    },
    repulsion: {
      centralGravity: { number: number },
      springLength: { number: number },
      springConstant: { number: number },
      nodeDistance: { number: number },
      damping: { number: number },
      __type__: { object: object }
    },
    hierarchicalRepulsion: {
      centralGravity: { number: number },
      springLength: { number: number },
      springConstant: { number: number },
      nodeDistance: { number: number },
      damping: { number: number },
      __type__: { object: object }
    },
    maxVelocity: { number: number },
    minVelocity: { number: number }, // px/s
    solver: { string: ['barnesHut', 'repulsion', 'hierarchicalRepulsion', 'forceAtlas2Based'] },
    stabilization: {
      enabled: { boolean: boolean },
      iterations: { number: number }, // maximum number of iteration to stabilize
      updateInterval: { number: number },
      onlyDynamicEdges: { boolean: boolean },
      fit: { boolean: boolean },
      __type__: { object: object, boolean: boolean }
    },
    timestep: { number: number },
    adaptiveTimestep: { boolean: boolean },
    __type__: { object: object, boolean: boolean }
  },

  //globals :
  autoResize: { boolean: boolean },
  clickToUse: { boolean: boolean },
  locale: { string: string },
  locales: {
    __any__: { any: any },
    __type__: { object: object }
  },
  height: { string: string },
  width: { string: string },
  __type__: { object: object }
};

allOptions.groups.__any__ = allOptions.nodes;
allOptions.manipulation.controlNodeStyle = allOptions.nodes;

var configureOptions = {
  nodes: {
    borderWidth: [1, 0, 10, 1],
    borderWidthSelected: [2, 0, 10, 1],
    color: {
      border: ['color', '#2B7CE9'],
      background: ['color', '#97C2FC'],
      highlight: {
        border: ['color', '#2B7CE9'],
        background: ['color', '#D2E5FF']
      },
      hover: {
        border: ['color', '#2B7CE9'],
        background: ['color', '#D2E5FF']
      }
    },
    fixed: {
      x: false,
      y: false
    },
    font: {
      color: ['color', '#343434'],
      size: [14, 0, 100, 1], // px
      face: ['arial', 'verdana', 'tahoma'],
      background: ['color', 'none'],
      strokeWidth: [0, 0, 50, 1], // px
      strokeColor: ['color', '#ffffff']
    },
    //group: 'string',
    hidden: false,
    labelHighlightBold: true,
    //icon: {
    //  face: 'string',  //'FontAwesome',
    //  code: 'string',  //'\uf007',
    //  size: [50, 0, 200, 1],  //50,
    //  color: ['color','#2B7CE9']   //'#aa00ff'
    //},
    //image: 'string', // --> URL
    physics: true,
    scaling: {
      min: [10, 0, 200, 1],
      max: [30, 0, 200, 1],
      label: {
        enabled: false,
        min: [14, 0, 200, 1],
        max: [30, 0, 200, 1],
        maxVisible: [30, 0, 200, 1],
        drawThreshold: [5, 0, 20, 1]
      }
    },
    shadow: {
      enabled: false,
      color: 'rgba(0,0,0,0.5)',
      size: [10, 0, 20, 1],
      x: [5, -30, 30, 1],
      y: [5, -30, 30, 1]
    },
    shape: ['ellipse', 'box', 'circle', 'database', 'diamond', 'dot', 'square', 'star', 'text', 'triangle', 'triangleDown'],
    shapeProperties: {
      borderDashes: false,
      borderRadius: [6, 0, 20, 1],
      interpolation: true,
      useImageSize: false
    },
    size: [25, 0, 200, 1]
  },
  edges: {
    arrows: {
      to: { enabled: false, scaleFactor: [1, 0, 3, 0.05] }, // boolean / {arrowScaleFactor:1} / {enabled: false, arrowScaleFactor:1}
      middle: { enabled: false, scaleFactor: [1, 0, 3, 0.05] },
      from: { enabled: false, scaleFactor: [1, 0, 3, 0.05] }
    },
    arrowStrikethrough: true,
    color: {
      color: ['color', '#848484'],
      highlight: ['color', '#848484'],
      hover: ['color', '#848484'],
      inherit: ['from', 'to', 'both', true, false],
      opacity: [1, 0, 1, 0.05]
    },
    dashes: false,
    font: {
      color: ['color', '#343434'],
      size: [14, 0, 100, 1], // px
      face: ['arial', 'verdana', 'tahoma'],
      background: ['color', 'none'],
      strokeWidth: [2, 0, 50, 1], // px
      strokeColor: ['color', '#ffffff'],
      align: ['horizontal', 'top', 'middle', 'bottom']
    },
    hidden: false,
    hoverWidth: [1.5, 0, 5, 0.1],
    labelHighlightBold: true,
    physics: true,
    scaling: {
      min: [1, 0, 100, 1],
      max: [15, 0, 100, 1],
      label: {
        enabled: true,
        min: [14, 0, 200, 1],
        max: [30, 0, 200, 1],
        maxVisible: [30, 0, 200, 1],
        drawThreshold: [5, 0, 20, 1]
      }
    },
    selectionWidth: [1.5, 0, 5, 0.1],
    selfReferenceSize: [20, 0, 200, 1],
    shadow: {
      enabled: false,
      color: 'rgba(0,0,0,0.5)',
      size: [10, 0, 20, 1],
      x: [5, -30, 30, 1],
      y: [5, -30, 30, 1]
    },
    smooth: {
      enabled: true,
      type: ['dynamic', 'continuous', 'discrete', 'diagonalCross', 'straightCross', 'horizontal', 'vertical', 'curvedCW', 'curvedCCW', 'cubicBezier'],
      forceDirection: ['horizontal', 'vertical', 'none'],
      roundness: [0.5, 0, 1, 0.05]
    },
    width: [1, 0, 30, 1]
  },
  layout: {
    //randomSeed: [0, 0, 500, 1],
    //improvedLayout: true,
    hierarchical: {
      enabled: false,
      levelSeparation: [150, 20, 500, 5],
      nodeSpacing: [100, 20, 500, 5],
      treeSpacing: [200, 20, 500, 5],
      blockShifting: true,
      edgeMinimization: true,
      parentCentralization: true,
      direction: ['UD', 'DU', 'LR', 'RL'], // UD, DU, LR, RL
      sortMethod: ['hubsize', 'directed'] // hubsize, directed
    }
  },
  interaction: {
    dragNodes: true,
    dragView: true,
    hideEdgesOnDrag: false,
    hideNodesOnDrag: false,
    hover: false,
    keyboard: {
      enabled: false,
      speed: { x: [10, 0, 40, 1], y: [10, 0, 40, 1], zoom: [0.02, 0, 0.1, 0.005] },
      bindToWindow: true
    },
    multiselect: false,
    navigationButtons: false,
    selectable: true,
    selectConnectedEdges: true,
    hoverConnectedEdges: true,
    tooltipDelay: [300, 0, 1000, 25],
    zoomView: true
  },
  manipulation: {
    enabled: false,
    initiallyActive: false
  },
  physics: {
    enabled: true,
    barnesHut: {
      //theta: [0.5, 0.1, 1, 0.05],
      gravitationalConstant: [-2000, -30000, 0, 50],
      centralGravity: [0.3, 0, 10, 0.05],
      springLength: [95, 0, 500, 5],
      springConstant: [0.04, 0, 1.2, 0.005],
      damping: [0.09, 0, 1, 0.01],
      avoidOverlap: [0, 0, 1, 0.01]
    },
    forceAtlas2Based: {
      //theta: [0.5, 0.1, 1, 0.05],
      gravitationalConstant: [-50, -500, 0, 1],
      centralGravity: [0.01, 0, 1, 0.005],
      springLength: [95, 0, 500, 5],
      springConstant: [0.08, 0, 1.2, 0.005],
      damping: [0.4, 0, 1, 0.01],
      avoidOverlap: [0, 0, 1, 0.01]
    },
    repulsion: {
      centralGravity: [0.2, 0, 10, 0.05],
      springLength: [200, 0, 500, 5],
      springConstant: [0.05, 0, 1.2, 0.005],
      nodeDistance: [100, 0, 500, 5],
      damping: [0.09, 0, 1, 0.01]
    },
    hierarchicalRepulsion: {
      centralGravity: [0.2, 0, 10, 0.05],
      springLength: [100, 0, 500, 5],
      springConstant: [0.01, 0, 1.2, 0.005],
      nodeDistance: [120, 0, 500, 5],
      damping: [0.09, 0, 1, 0.01]
    },
    maxVelocity: [50, 0, 150, 1],
    minVelocity: [0.1, 0.01, 0.5, 0.01],
    solver: ['barnesHut', 'forceAtlas2Based', 'repulsion', 'hierarchicalRepulsion'],
    timestep: [0.5, 0.01, 1, 0.01]
  },
  global: {
    locale: ['en', 'nl']
  }
};

exports.allOptions = allOptions;
exports.configureOptions = configureOptions;