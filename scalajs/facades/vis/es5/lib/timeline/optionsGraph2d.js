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
var date = 'date';
var object = 'object'; // should only be in a __type__ property
var dom = 'dom';
var moment = 'moment';
var any = 'any';

var allOptions = {
  configure: {
    enabled: { boolean: boolean },
    filter: { boolean: boolean, 'function': 'function' },
    container: { dom: dom },
    __type__: { object: object, boolean: boolean, 'function': 'function' }
  },

  //globals :
  yAxisOrientation: { string: ['left', 'right'] },
  defaultGroup: { string: string },
  sort: { boolean: boolean },
  sampling: { boolean: boolean },
  stack: { boolean: boolean },
  graphHeight: { string: string, number: number },
  shaded: {
    enabled: { boolean: boolean },
    orientation: { string: ['bottom', 'top', 'zero', 'group'] }, // top, bottom, zero, group
    groupId: { object: object },
    __type__: { boolean: boolean, object: object }
  },
  style: { string: ['line', 'bar', 'points'] }, // line, bar
  barChart: {
    width: { number: number },
    minWidth: { number: number },
    sideBySide: { boolean: boolean },
    align: { string: ['left', 'center', 'right'] },
    __type__: { object: object }
  },
  interpolation: {
    enabled: { boolean: boolean },
    parametrization: { string: ['centripetal', 'chordal', 'uniform'] }, // uniform (alpha = 0.0), chordal (alpha = 1.0), centripetal (alpha = 0.5)
    alpha: { number: number },
    __type__: { object: object, boolean: boolean }
  },
  drawPoints: {
    enabled: { boolean: boolean },
    onRender: { 'function': 'function' },
    size: { number: number },
    style: { string: ['square', 'circle'] }, // square, circle
    __type__: { object: object, boolean: boolean, 'function': 'function' }
  },
  dataAxis: {
    showMinorLabels: { boolean: boolean },
    showMajorLabels: { boolean: boolean },
    icons: { boolean: boolean },
    width: { string: string, number: number },
    visible: { boolean: boolean },
    alignZeros: { boolean: boolean },
    left: {
      range: { min: { number: number }, max: { number: number }, __type__: { object: object } },
      format: { 'function': 'function' },
      title: { text: { string: string, number: number }, style: { string: string }, __type__: { object: object } },
      __type__: { object: object }
    },
    right: {
      range: { min: { number: number }, max: { number: number }, __type__: { object: object } },
      format: { 'function': 'function' },
      title: { text: { string: string, number: number }, style: { string: string }, __type__: { object: object } },
      __type__: { object: object }
    },
    __type__: { object: object }
  },
  legend: {
    enabled: { boolean: boolean },
    icons: { boolean: boolean },
    left: {
      visible: { boolean: boolean },
      position: { string: ['top-right', 'bottom-right', 'top-left', 'bottom-left'] },
      __type__: { object: object }
    },
    right: {
      visible: { boolean: boolean },
      position: { string: ['top-right', 'bottom-right', 'top-left', 'bottom-left'] },
      __type__: { object: object }
    },
    __type__: { object: object, boolean: boolean }
  },
  groups: {
    visibility: { any: any },
    __type__: { object: object }
  },

  autoResize: { boolean: boolean },
  throttleRedraw: { number: number },
  clickToUse: { boolean: boolean },
  end: { number: number, date: date, string: string, moment: moment },
  format: {
    minorLabels: {
      millisecond: { string: string, 'undefined': 'undefined' },
      second: { string: string, 'undefined': 'undefined' },
      minute: { string: string, 'undefined': 'undefined' },
      hour: { string: string, 'undefined': 'undefined' },
      weekday: { string: string, 'undefined': 'undefined' },
      day: { string: string, 'undefined': 'undefined' },
      month: { string: string, 'undefined': 'undefined' },
      year: { string: string, 'undefined': 'undefined' },
      __type__: { object: object }
    },
    majorLabels: {
      millisecond: { string: string, 'undefined': 'undefined' },
      second: { string: string, 'undefined': 'undefined' },
      minute: { string: string, 'undefined': 'undefined' },
      hour: { string: string, 'undefined': 'undefined' },
      weekday: { string: string, 'undefined': 'undefined' },
      day: { string: string, 'undefined': 'undefined' },
      month: { string: string, 'undefined': 'undefined' },
      year: { string: string, 'undefined': 'undefined' },
      __type__: { object: object }
    },
    __type__: { object: object }
  },
  moment: { 'function': 'function' },
  height: { string: string, number: number },
  hiddenDates: {
    start: { date: date, number: number, string: string, moment: moment },
    end: { date: date, number: number, string: string, moment: moment },
    repeat: { string: string },
    __type__: { object: object, array: array }
  },
  locale: { string: string },
  locales: {
    __any__: { any: any },
    __type__: { object: object }
  },
  max: { date: date, number: number, string: string, moment: moment },
  maxHeight: { number: number, string: string },
  maxMinorChars: { number: number },
  min: { date: date, number: number, string: string, moment: moment },
  minHeight: { number: number, string: string },
  moveable: { boolean: boolean },
  multiselect: { boolean: boolean },
  orientation: { string: string },
  showCurrentTime: { boolean: boolean },
  showMajorLabels: { boolean: boolean },
  showMinorLabels: { boolean: boolean },
  start: { date: date, number: number, string: string, moment: moment },
  timeAxis: {
    scale: { string: string, 'undefined': 'undefined' },
    step: { number: number, 'undefined': 'undefined' },
    __type__: { object: object }
  },
  width: { string: string, number: number },
  zoomable: { boolean: boolean },
  zoomKey: { string: ['ctrlKey', 'altKey', 'metaKey', ''] },
  zoomMax: { number: number },
  zoomMin: { number: number },
  zIndex: { number: number },
  __type__: { object: object }
};

var configureOptions = {
  global: {
    //yAxisOrientation: ['left','right'], // TDOO: enable as soon as Grahp2d doesn't crash when changing this on the fly
    sort: true,
    sampling: true,
    stack: false,
    shaded: {
      enabled: false,
      orientation: ['zero', 'top', 'bottom', 'group'] // zero, top, bottom
    },
    style: ['line', 'bar', 'points'], // line, bar
    barChart: {
      width: [50, 5, 100, 5],
      minWidth: [50, 5, 100, 5],
      sideBySide: false,
      align: ['left', 'center', 'right'] // left, center, right
    },
    interpolation: {
      enabled: true,
      parametrization: ['centripetal', 'chordal', 'uniform'] // uniform (alpha = 0.0), chordal (alpha = 1.0), centripetal (alpha = 0.5)
    },
    drawPoints: {
      enabled: true,
      size: [6, 2, 30, 1],
      style: ['square', 'circle'] // square, circle
    },
    dataAxis: {
      showMinorLabels: true,
      showMajorLabels: true,
      icons: false,
      width: [40, 0, 200, 1],
      visible: true,
      alignZeros: true,
      left: {
        //range: {min:'undefined': 'undefined'ined,max:'undefined': 'undefined'ined},
        //format: function (value) {return value;},
        title: { text: '', style: '' }
      },
      right: {
        //range: {min:'undefined': 'undefined'ined,max:'undefined': 'undefined'ined},
        //format: function (value) {return value;},
        title: { text: '', style: '' }
      }
    },
    legend: {
      enabled: false,
      icons: true,
      left: {
        visible: true,
        position: ['top-right', 'bottom-right', 'top-left', 'bottom-left'] // top/bottom - left,right
      },
      right: {
        visible: true,
        position: ['top-right', 'bottom-right', 'top-left', 'bottom-left'] // top/bottom - left,right
      }
    },

    autoResize: true,
    throttleRedraw: [10, 0, 1000, 10],
    clickToUse: false,
    end: '',
    format: {
      minorLabels: {
        millisecond: 'SSS',
        second: 's',
        minute: 'HH:mm',
        hour: 'HH:mm',
        weekday: 'ddd D',
        day: 'D',
        month: 'MMM',
        year: 'YYYY'
      },
      majorLabels: {
        millisecond: 'HH:mm:ss',
        second: 'D MMMM HH:mm',
        minute: 'ddd D MMMM',
        hour: 'ddd D MMMM',
        weekday: 'MMMM YYYY',
        day: 'MMMM YYYY',
        month: 'YYYY',
        year: ''
      }
    },

    height: '',
    locale: '',
    max: '',
    maxHeight: '',
    maxMinorChars: [7, 0, 20, 1],
    min: '',
    minHeight: '',
    moveable: true,
    orientation: ['both', 'bottom', 'top'],
    showCurrentTime: false,
    showMajorLabels: true,
    showMinorLabels: true,
    start: '',
    width: '100%',
    zoomable: true,
    zoomKey: ['ctrlKey', 'altKey', 'metaKey', ''],
    zoomMax: [315360000000000, 10, 315360000000000, 1],
    zoomMin: [10, 10, 315360000000000, 1],
    zIndex: 0
  }
};

exports.allOptions = allOptions;
exports.configureOptions = configureOptions;