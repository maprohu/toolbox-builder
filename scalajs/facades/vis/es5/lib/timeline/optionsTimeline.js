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
  align: { string: string },
  rtl: { boolean: boolean, 'undefined': 'undefined' },
  autoResize: { boolean: boolean },
  throttleRedraw: { number: number },
  clickToUse: { boolean: boolean },
  dataAttributes: { string: string, array: array },
  editable: {
    add: { boolean: boolean, 'undefined': 'undefined' },
    remove: { boolean: boolean, 'undefined': 'undefined' },
    updateGroup: { boolean: boolean, 'undefined': 'undefined' },
    updateTime: { boolean: boolean, 'undefined': 'undefined' },
    __type__: { boolean: boolean, object: object }
  },
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
  groupOrder: { string: string, 'function': 'function' },
  groupEditable: {
    add: { boolean: boolean, 'undefined': 'undefined' },
    remove: { boolean: boolean, 'undefined': 'undefined' },
    order: { boolean: boolean, 'undefined': 'undefined' },
    __type__: { boolean: boolean, object: object }
  },
  groupOrderSwap: { 'function': 'function' },
  height: { string: string, number: number },
  hiddenDates: {
    start: { date: date, number: number, string: string, moment: moment },
    end: { date: date, number: number, string: string, moment: moment },
    repeat: { string: string },
    __type__: { object: object, array: array }
  },
  itemsAlwaysDraggable: { boolean: boolean },
  locale: { string: string },
  locales: {
    __any__: { any: any },
    __type__: { object: object }
  },
  margin: {
    axis: { number: number },
    item: {
      horizontal: { number: number, 'undefined': 'undefined' },
      vertical: { number: number, 'undefined': 'undefined' },
      __type__: { object: object, number: number }
    },
    __type__: { object: object, number: number }
  },
  max: { date: date, number: number, string: string, moment: moment },
  maxHeight: { number: number, string: string },
  maxMinorChars: { number: number },
  min: { date: date, number: number, string: string, moment: moment },
  minHeight: { number: number, string: string },
  moveable: { boolean: boolean },
  multiselect: { boolean: boolean },
  multiselectPerGroup: { boolean: boolean },
  onAdd: { 'function': 'function' },
  onUpdate: { 'function': 'function' },
  onMove: { 'function': 'function' },
  onMoving: { 'function': 'function' },
  onRemove: { 'function': 'function' },
  onAddGroup: { 'function': 'function' },
  onMoveGroup: { 'function': 'function' },
  onRemoveGroup: { 'function': 'function' },
  order: { 'function': 'function' },
  orientation: {
    axis: { string: string, 'undefined': 'undefined' },
    item: { string: string, 'undefined': 'undefined' },
    __type__: { string: string, object: object }
  },
  selectable: { boolean: boolean },
  showCurrentTime: { boolean: boolean },
  showMajorLabels: { boolean: boolean },
  showMinorLabels: { boolean: boolean },
  stack: { boolean: boolean },
  snap: { 'function': 'function', 'null': 'null' },
  start: { date: date, number: number, string: string, moment: moment },
  template: { 'function': 'function' },
  groupTemplate: { 'function': 'function' },
  timeAxis: {
    scale: { string: string, 'undefined': 'undefined' },
    step: { number: number, 'undefined': 'undefined' },
    __type__: { object: object }
  },
  type: { string: string },
  width: { string: string, number: number },
  zoomable: { boolean: boolean },
  zoomKey: { string: ['ctrlKey', 'altKey', 'metaKey', ''] },
  zoomMax: { number: number },
  zoomMin: { number: number },

  __type__: { object: object }
};

var configureOptions = {
  global: {
    align: ['center', 'left', 'right'],
    direction: false,
    autoResize: true,
    throttleRedraw: [10, 0, 1000, 10],
    clickToUse: false,
    // dataAttributes: ['all'], // FIXME: can be 'all' or string[]
    editable: {
      add: false,
      remove: false,
      updateGroup: false,
      updateTime: false
    },
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

    //groupOrder: {string, 'function': 'function'},
    groupsDraggable: false,
    height: '',
    //hiddenDates: {object, array},
    locale: '',
    margin: {
      axis: [20, 0, 100, 1],
      item: {
        horizontal: [10, 0, 100, 1],
        vertical: [10, 0, 100, 1]
      }
    },
    max: '',
    maxHeight: '',
    maxMinorChars: [7, 0, 20, 1],
    min: '',
    minHeight: '',
    moveable: false,
    multiselect: false,
    multiselectPerGroup: false,
    //onAdd: {'function': 'function'},
    //onUpdate: {'function': 'function'},
    //onMove: {'function': 'function'},
    //onMoving: {'function': 'function'},
    //onRename: {'function': 'function'},
    //order: {'function': 'function'},
    orientation: {
      axis: ['both', 'bottom', 'top'],
      item: ['bottom', 'top']
    },
    selectable: true,
    showCurrentTime: false,
    showMajorLabels: true,
    showMinorLabels: true,
    stack: true,
    //snap: {'function': 'function', nada},
    start: '',
    //template: {'function': 'function'},
    //timeAxis: {
    //  scale: ['millisecond', 'second', 'minute', 'hour', 'weekday', 'day', 'month', 'year'],
    //  step: [1, 1, 10, 1]
    //},
    type: ['box', 'point', 'range', 'background'],
    width: '100%',
    zoomable: true,
    zoomKey: ['ctrlKey', 'altKey', 'metaKey', ''],
    zoomMax: [315360000000000, 10, 315360000000000, 1],
    zoomMin: [10, 10, 315360000000000, 1]
  }
};

exports.allOptions = allOptions;
exports.configureOptions = configureOptions;