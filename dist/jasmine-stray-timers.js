/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export realSetTimeout */
/* unused harmony export realSetInterval */
/* harmony export (immutable) */ __webpack_exports__["b"] = install;
/* harmony export (immutable) */ __webpack_exports__["d"] = uninstall;
/* harmony export (immutable) */ __webpack_exports__["c"] = setupTimerDetection;
/* harmony export (immutable) */ __webpack_exports__["a"] = detectStrayTimers;
function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var realSetTimeout = window.setTimeout;
var realClearTimeout = window.clearTimeout;
var realSetInterval = window.setInterval;
var realClearInterval = window.clearInterval; // export real timers for testing


var runningTimeouts = [];
var runningIntervals = [];
/**
 * Mark a timer as executed inside the test constraints
 *
 * @param {Number} timerId
 */

function removeTimeout(timerId) {
  runningTimeouts = runningTimeouts.filter(function (_ref) {
    var id = _ref.id;
    return id !== timerId;
  });
}
/**
 * Overridden setTimeout function that detects when it executes outside a testing constraint (`it`)
 *
 * @param {Function} fn
 * @param {Array<*>} timerArgs
 * @returns {Number}
 */


function localSetTimeout(fn) {
  if (typeof fn === 'string') {
    throw new Error('String function arguments for "setTimeout" cannot be executed.');
  }

  var timerId = void 0; // eslint-disable-line prefer-const

  var timerFn = function timerFn() {
    removeTimeout(timerId);

    for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    return fn.apply(this, args);
  };

  for (var _len = arguments.length, timerArgs = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    timerArgs[_key - 1] = arguments[_key];
  }

  timerId = realSetTimeout.apply(this, [timerFn].concat(timerArgs)); // must throw the error for PhantomJS to generate the stack trace

  var err = void 0;

  try {
    throw new Error('Stray "setTimeout" call was executed outside the test constraints');
  } catch (e) {
    err = e;
  }

  runningTimeouts.push({
    id: timerId,
    err: err
  });
  return timerId;
}
/**
 * Overridden clearTimeout function that removes the check for a stray setTimeout
 *
 * @param {Number} timerId
 * @returns {undefined}
 */


function localClearTimeout(timerId) {
  removeTimeout(timerId);
  return realClearTimeout.apply(this, arguments);
}
/**
 * Mark an interval as cleared inside the test constraints
 *
 * @param {Number} timerId
 */


function removeInterval(timerId) {
  runningIntervals = runningIntervals.filter(function (_ref2) {
    var id = _ref2.id;
    return id !== timerId;
  });
}
/**
 * Overridden setInterval function that detects when it executes outside a testing constraint (`it`)
 *
 * @returns {Number}
 */


function localSetInterval() {
  var timerId = realSetInterval.apply(this, arguments); // must throw the error for PhantomJS to generate the stack trace

  var err = void 0;

  try {
    throw new Error('Stray "setInterval" call was executed outside the test constraints');
  } catch (e) {
    err = e;
  }

  runningIntervals.push({
    id: timerId,
    err: err
  });
  return timerId;
}
/**
 * Overridden clearInterval function that removes the check for a stray setInterval
 *
 * @param {Number} timerId
 * @returns {undefined}
 */


function localClearInterval(timerId) {
  // intervals only get removed when clearInterval is called
  removeInterval(timerId);
  return realClearInterval.apply(this, arguments);
}
/**
 * Override the timer functions with the tested functions
 */


function install() {
  var map = {
    setTimeout: localSetTimeout,
    clearTimeout: localClearTimeout,
    setInterval: localSetInterval,
    clearInterval: localClearInterval
  };
  Object.keys(map).forEach(function (fn) {
    var descriptor = Object.getOwnPropertyDescriptor(window, fn);
    descriptor.value = map[fn];
    Object.defineProperty(window, fn, descriptor);
  });
}
/**
 * Restore the original timer functions
 */

function uninstall() {
  var map = {
    setTimeout: realSetTimeout,
    clearTimeout: realClearTimeout,
    setInterval: realSetInterval,
    clearInterval: realClearInterval
  };
  Object.keys(map).forEach(function (fn) {
    var descriptor = Object.getOwnPropertyDescriptor(window, fn);
    descriptor.value = map[fn];
    Object.defineProperty(window, fn, descriptor);
  });
}
/**
 * Set up jasmine instance variable for ignoring promises
 */

function setupTimerDetection() {
  var _this = this;

  this._ignoreStrayTimers = function () {
    _this.__strayTimersIgnored = true;
  };

  this._onlyWarnOnStrayTimers = function () {
    _this.__onlyWarnOnStrayTimers = true;
  };
}
/**
 * Detect any stray timers used in beforeEach, afterEach
 *
 * @throws {Error}
 */

function detectStrayTimers() {
  // clear out the timers first
  // use the real one so we don't accidentally remove it from `strayTimers`
  runningTimeouts.forEach(function (_ref3) {
    var id = _ref3.id;
    return realClearTimeout(id);
  });
  runningIntervals.forEach(function (_ref4) {
    var id = _ref4.id;
    return realClearInterval(id);
  }); // find stray timers from prior tests

  var strayTimers = [].concat(_toConsumableArray(runningTimeouts), _toConsumableArray(runningIntervals)); // reset timer cache for next test

  runningTimeouts = [];
  runningIntervals = [];

  if (this.__strayTimersIgnored) {
    return;
  }

  if (strayTimers.length > 0) {
    var firstStrayTimer = strayTimers.shift();

    if (this.__onlyWarnOnStrayTimers) {
      console.warn(firstStrayTimer.err.message);
      return;
    }

    throw firstStrayTimer.err;
  }
}

/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__timers__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__jasmineClock__ = __webpack_require__(2);
/* eslint-env jasmine */

 // jasmine clock relies on having access to the original timer functions

jasmine.clock = Object(__WEBPACK_IMPORTED_MODULE_1__jasmineClock__["a" /* overrideJasmineClock */])(jasmine.clock); // install timers

beforeAll(__WEBPACK_IMPORTED_MODULE_0__timers__["b" /* install */]);
afterAll(__WEBPACK_IMPORTED_MODULE_0__timers__["d" /* uninstall */]);
beforeEach(__WEBPACK_IMPORTED_MODULE_0__timers__["c" /* setupTimerDetection */]);
beforeEach(__WEBPACK_IMPORTED_MODULE_0__timers__["a" /* detectStrayTimers */]);
afterEach(__WEBPACK_IMPORTED_MODULE_0__timers__["a" /* detectStrayTimers */]);

/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = overrideJasmineClock;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__timers__ = __webpack_require__(0);

var realJasmineClock = void 0;
/**
 * Override the jasmine clock so that we install and uninstall the internal timers
 * jasmine clock relies on having access to the original timer functions
 *
 * @param {Function} originalJasmineClock
 * @return {Function}
 */

function overrideJasmineClock(originalJasmineClock) {
  if (realJasmineClock && realJasmineClock !== originalJasmineClock) {
    return originalJasmineClock;
  }

  realJasmineClock = originalJasmineClock;
  return function () {
    var clock = originalJasmineClock();
    var originalInstall = clock.install;
    var originalUninstall = clock.uninstall;

    clock.install = function () {
      Object(__WEBPACK_IMPORTED_MODULE_0__timers__["d" /* uninstall */])();
      return originalInstall.apply(this, arguments);
    };

    clock.uninstall = function () {
      var ret = originalUninstall.apply(this, arguments);
      Object(__WEBPACK_IMPORTED_MODULE_0__timers__["b" /* install */])();
      return ret;
    };

    return clock;
  };
}

/***/ })
/******/ ]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgYjYxZWVhOTU0OGZkNjY5NjhlMWEiLCJ3ZWJwYWNrOi8vLy4vc3JjL3RpbWVycy5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2phc21pbmVDbG9jay5qcyJdLCJuYW1lcyI6WyJyZWFsU2V0VGltZW91dCIsIndpbmRvdyIsInNldFRpbWVvdXQiLCJyZWFsQ2xlYXJUaW1lb3V0IiwiY2xlYXJUaW1lb3V0IiwicmVhbFNldEludGVydmFsIiwic2V0SW50ZXJ2YWwiLCJyZWFsQ2xlYXJJbnRlcnZhbCIsImNsZWFySW50ZXJ2YWwiLCJydW5uaW5nVGltZW91dHMiLCJydW5uaW5nSW50ZXJ2YWxzIiwicmVtb3ZlVGltZW91dCIsInRpbWVySWQiLCJmaWx0ZXIiLCJpZCIsImxvY2FsU2V0VGltZW91dCIsImZuIiwiRXJyb3IiLCJ0aW1lckZuIiwiYXJncyIsImFwcGx5IiwidGltZXJBcmdzIiwiZXJyIiwiZSIsInB1c2giLCJsb2NhbENsZWFyVGltZW91dCIsImFyZ3VtZW50cyIsInJlbW92ZUludGVydmFsIiwibG9jYWxTZXRJbnRlcnZhbCIsImxvY2FsQ2xlYXJJbnRlcnZhbCIsImluc3RhbGwiLCJtYXAiLCJPYmplY3QiLCJrZXlzIiwiZm9yRWFjaCIsImRlc2NyaXB0b3IiLCJnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IiLCJ2YWx1ZSIsImRlZmluZVByb3BlcnR5IiwidW5pbnN0YWxsIiwic2V0dXBUaW1lckRldGVjdGlvbiIsIl9pZ25vcmVTdHJheVRpbWVycyIsIl9fc3RyYXlUaW1lcnNJZ25vcmVkIiwiX29ubHlXYXJuT25TdHJheVRpbWVycyIsIl9fb25seVdhcm5PblN0cmF5VGltZXJzIiwiZGV0ZWN0U3RyYXlUaW1lcnMiLCJzdHJheVRpbWVycyIsImxlbmd0aCIsImZpcnN0U3RyYXlUaW1lciIsInNoaWZ0IiwiY29uc29sZSIsIndhcm4iLCJtZXNzYWdlIiwiamFzbWluZSIsImNsb2NrIiwib3ZlcnJpZGVKYXNtaW5lQ2xvY2siLCJiZWZvcmVBbGwiLCJhZnRlckFsbCIsImJlZm9yZUVhY2giLCJhZnRlckVhY2giLCJyZWFsSmFzbWluZUNsb2NrIiwib3JpZ2luYWxKYXNtaW5lQ2xvY2siLCJvcmlnaW5hbEluc3RhbGwiLCJvcmlnaW5hbFVuaW5zdGFsbCIsInJldCJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFLO0FBQ0w7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBMkIsMEJBQTBCLEVBQUU7QUFDdkQseUNBQWlDLGVBQWU7QUFDaEQ7QUFDQTtBQUNBOztBQUVBO0FBQ0EsOERBQXNELCtEQUErRDs7QUFFckg7QUFDQTs7QUFFQTtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7O0FDN0RBLElBQU1BLGlCQUFpQkMsT0FBT0MsVUFBOUI7QUFDQSxJQUFNQyxtQkFBbUJGLE9BQU9HLFlBQWhDO0FBQ0EsSUFBTUMsa0JBQWtCSixPQUFPSyxXQUEvQjtBQUNBLElBQU1DLG9CQUFvQk4sT0FBT08sYUFBakMsQyxDQUVBOztBQUNBO0FBRUEsSUFBSUMsa0JBQWtCLEVBQXRCO0FBQ0EsSUFBSUMsbUJBQW1CLEVBQXZCO0FBRUE7Ozs7OztBQUtBLFNBQVNDLGFBQVQsQ0FBdUJDLE9BQXZCLEVBQWdDO0FBQzlCSCxvQkFBa0JBLGdCQUFnQkksTUFBaEIsQ0FBdUI7QUFBQSxRQUFHQyxFQUFILFFBQUdBLEVBQUg7QUFBQSxXQUFZQSxPQUFPRixPQUFuQjtBQUFBLEdBQXZCLENBQWxCO0FBQ0Q7QUFFRDs7Ozs7Ozs7O0FBT0EsU0FBU0csZUFBVCxDQUF5QkMsRUFBekIsRUFB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dGltZXJzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7XG4gXHRcdFx0XHRjb25maWd1cmFibGU6IGZhbHNlLFxuIFx0XHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcbiBcdFx0XHRcdGdldDogZ2V0dGVyXG4gXHRcdFx0fSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gMSk7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gd2VicGFjay9ib290c3RyYXAgYjYxZWVhOTU0OGZkNjY5NjhlMWEiLCJjb25zdCByZWFsU2V0VGltZW91dCA9IHdpbmRvdy5zZXRUaW1lb3V0O1xuY29uc3QgcmVhbENsZWFyVGltZW91dCA9IHdpbmRvdy5jbGVhclRpbWVvdXQ7XG5jb25zdCByZWFsU2V0SW50ZXJ2YWwgPSB3aW5kb3cuc2V0SW50ZXJ2YWw7XG5jb25zdCByZWFsQ2xlYXJJbnRlcnZhbCA9IHdpbmRvdy5jbGVhckludGVydmFsO1xuXG4vLyBleHBvcnQgcmVhbCB0aW1lcnMgZm9yIHRlc3RpbmdcbmV4cG9ydCB7IHJlYWxTZXRUaW1lb3V0LCByZWFsU2V0SW50ZXJ2YWwgfTtcblxubGV0IHJ1bm5pbmdUaW1lb3V0cyA9IFtdO1xubGV0IHJ1bm5pbmdJbnRlcnZhbHMgPSBbXTtcblxuLyoqXG4gKiBNYXJrIGEgdGltZXIgYXMgZXhlY3V0ZWQgaW5zaWRlIHRoZSB0ZXN0IGNvbnN0cmFpbnRzXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IHRpbWVySWRcbiAqL1xuZnVuY3Rpb24gcmVtb3ZlVGltZW91dCh0aW1lcklkKSB7XG4gIHJ1bm5pbmdUaW1lb3V0cyA9IHJ1bm5pbmdUaW1lb3V0cy5maWx0ZXIoKHsgaWQgfSkgPT4gaWQgIT09IHRpbWVySWQpO1xufVxuXG4vKipcbiAqIE92ZXJyaWRkZW4gc2V0VGltZW91dCBmdW5jdGlvbiB0aGF0IGRldGVjdHMgd2hlbiBpdCBleGVjdXRlcyBvdXRzaWRlIGEgdGVzdGluZyBjb25zdHJhaW50IChgaXRgKVxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcGFyYW0ge0FycmF5PCo+fSB0aW1lckFyZ3NcbiAqIEByZXR1cm5zIHtOdW1iZXJ9XG4gKi9cbmZ1bmN0aW9uIGxvY2FsU2V0VGltZW91dChmbiwgLi4udGltZXJBcmdzKSB7XG4gIGlmICh0eXBlb2YgZm4gPT09ICdzdHJpbmcnKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdTdHJpbmcgZnVuY3Rpb24gYXJndW1lbnRzIGZvciBcInNldFRpbWVvdXRcIiBjYW5ub3QgYmUgZXhlY3V0ZWQuJyk7XG4gIH1cblxuICBsZXQgdGltZXJJZDsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBwcmVmZXItY29uc3RcbiAgY29uc3QgdGltZXJGbiA9IGZ1bmN0aW9uKC4uLmFyZ3MpIHtcbiAgICByZW1vdmVUaW1lb3V0KHRpbWVySWQpO1xuICAgIHJldHVybiBmbi5hcHBseSh0aGlzLCBhcmdzKTtcbiAgfTtcbiAgdGltZXJJZCA9IHJlYWxTZXRUaW1lb3V0LmFwcGx5KHRoaXMsIFt0aW1lckZuLCAuLi50aW1lckFyZ3NdKTtcbiAgLy8gbXVzdCB0aHJvdyB0aGUgZXJyb3IgZm9yIFBoYW50b21KUyB0byBnZW5lcmF0ZSB0aGUgc3RhY2sgdHJhY2VcbiAgbGV0IGVycjtcbiAgdHJ5IHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1N0cmF5IFwic2V0VGltZW91dFwiIGNhbGwgd2FzIGV4ZWN1dGVkIG91dHNpZGUgdGhlIHRlc3QgY29uc3RyYWludHMnKTtcbiAgfVxuICBjYXRjaCAoZSkge1xuICAgIGVyciA9IGU7XG4gIH1cbiAgcnVubmluZ1RpbWVvdXRzLnB1c2goe1xuICAgIGlkOiB0aW1lcklkLFxuICAgIGVycixcbiAgfSk7XG4gIHJldHVybiB0aW1lcklkO1xufVxuXG4vKipcbiAqIE92ZXJyaWRkZW4gY2xlYXJUaW1lb3V0IGZ1bmN0aW9uIHRoYXQgcmVtb3ZlcyB0aGUgY2hlY2sgZm9yIGEgc3RyYXkgc2V0VGltZW91dFxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSB0aW1lcklkXG4gKiBAcmV0dXJucyB7dW5kZWZpbmVkfVxuICovXG5mdW5jdGlvbiBsb2NhbENsZWFyVGltZW91dCh0aW1lcklkKSB7XG4gIHJlbW92ZVRpbWVvdXQodGltZXJJZCk7XG4gIHJldHVybiByZWFsQ2xlYXJUaW1lb3V0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG59XG5cbi8qKlxuICogTWFyayBhbiBpbnRlcnZhbCBhcyBjbGVhcmVkIGluc2lkZSB0aGUgdGVzdCBjb25zdHJhaW50c1xuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSB0aW1lcklkXG4gKi9cbmZ1bmN0aW9uIHJlbW92ZUludGVydmFsKHRpbWVySWQpIHtcbiAgcnVubmluZ0ludGVydmFscyA9IHJ1bm5pbmdJbnRlcnZhbHMuZmlsdGVyKCh7IGlkIH0pID0+IGlkICE9PSB0aW1lcklkKTtcbn1cblxuLyoqXG4gKiBPdmVycmlkZGVuIHNldEludGVydmFsIGZ1bmN0aW9uIHRoYXQgZGV0ZWN0cyB3aGVuIGl0IGV4ZWN1dGVzIG91dHNpZGUgYSB0ZXN0aW5nIGNvbnN0cmFpbnQgKGBpdGApXG4gKlxuICogQHJldHVybnMge051bWJlcn1cbiAqL1xuZnVuY3Rpb24gbG9jYWxTZXRJbnRlcnZhbCgpIHtcbiAgY29uc3QgdGltZXJJZCA9IHJlYWxTZXRJbnRlcnZhbC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAvLyBtdXN0IHRocm93IHRoZSBlcnJvciBmb3IgUGhhbnRvbUpTIHRvIGdlbmVyYXRlIHRoZSBzdGFjayB0cmFjZVxuICBsZXQgZXJyO1xuICB0cnkge1xuICAgIHRocm93IG5ldyBFcnJvcignU3RyYXkgXCJzZXRJbnRlcnZhbFwiIGNhbGwgd2FzIGV4ZWN1dGVkIG91dHNpZGUgdGhlIHRlc3QgY29uc3RyYWludHMnKTtcbiAgfVxuICBjYXRjaCAoZSkge1xuICAgIGVyciA9IGU7XG4gIH1cbiAgcnVubmluZ0ludGVydmFscy5wdXNoKHtcbiAgICBpZDogdGltZXJJZCxcbiAgICBlcnIsXG4gIH0pO1xuICByZXR1cm4gdGltZXJJZDtcbn1cblxuLyoqXG4gKiBPdmVycmlkZGVuIGNsZWFySW50ZXJ2YWwgZnVuY3Rpb24gdGhhdCByZW1vdmVzIHRoZSBjaGVjayBmb3IgYSBzdHJheSBzZXRJbnRlcnZhbFxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSB0aW1lcklkXG4gKiBAcmV0dXJucyB7dW5kZWZpbmVkfVxuICovXG5mdW5jdGlvbiBsb2NhbENsZWFySW50ZXJ2YWwodGltZXJJZCkge1xuICAvLyBpbnRlcnZhbHMgb25seSBnZXQgcmVtb3ZlZCB3aGVuIGNsZWFySW50ZXJ2YWwgaXMgY2FsbGVkXG4gIHJlbW92ZUludGVydmFsKHRpbWVySWQpO1xuICByZXR1cm4gcmVhbENsZWFySW50ZXJ2YWwuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn1cblxuLyoqXG4gKiBPdmVycmlkZSB0aGUgdGltZXIgZnVuY3Rpb25zIHdpdGggdGhlIHRlc3RlZCBmdW5jdGlvbnNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGluc3RhbGwoKSB7XG4gIGNvbnN0IG1hcCA9IHtcbiAgICBzZXRUaW1lb3V0OiBsb2NhbFNldFRpbWVvdXQsXG4gICAgY2xlYXJUaW1lb3V0OiBsb2NhbENsZWFyVGltZW91dCxcbiAgICBzZXRJbnRlcnZhbDogbG9jYWxTZXRJbnRlcnZhbCxcbiAgICBjbGVhckludGVydmFsOiBsb2NhbENsZWFySW50ZXJ2YWwsXG4gIH07XG4gIE9iamVjdC5rZXlzKG1hcCkuZm9yRWFjaCgoZm4pID0+IHtcbiAgICBjb25zdCBkZXNjcmlwdG9yID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih3aW5kb3csIGZuKTtcbiAgICBkZXNjcmlwdG9yLnZhbHVlID0gbWFwW2ZuXTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkod2luZG93LCBmbiwgZGVzY3JpcHRvcik7XG4gIH0pO1xufVxuXG4vKipcbiAqIFJlc3RvcmUgdGhlIG9yaWdpbmFsIHRpbWVyIGZ1bmN0aW9uc1xuICovXG5leHBvcnQgZnVuY3Rpb24gdW5pbnN0YWxsKCkge1xuICBjb25zdCBtYXAgPSB7XG4gICAgc2V0VGltZW91dDogcmVhbFNldFRpbWVvdXQsXG4gICAgY2xlYXJUaW1lb3V0OiByZWFsQ2xlYXJUaW1lb3V0LFxuICAgIHNldEludGVydmFsOiByZWFsU2V0SW50ZXJ2YWwsXG4gICAgY2xlYXJJbnRlcnZhbDogcmVhbENsZWFySW50ZXJ2YWwsXG4gIH07XG4gIE9iamVjdC5rZXlzKG1hcCkuZm9yRWFjaCgoZm4pID0+IHtcbiAgICBjb25zdCBkZXNjcmlwdG9yID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih3aW5kb3csIGZuKTtcbiAgICBkZXNjcmlwdG9yLnZhbHVlID0gbWFwW2ZuXTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkod2luZG93LCBmbiwgZGVzY3JpcHRvcik7XG4gIH0pO1xufVxuXG4vKipcbiAqIFNldCB1cCBqYXNtaW5lIGluc3RhbmNlIHZhcmlhYmxlIGZvciBpZ25vcmluZyBwcm9taXNlc1xuICovXG5leHBvcnQgZnVuY3Rpb24gc2V0dXBUaW1lckRldGVjdGlvbigpIHtcbiAgdGhpcy5faWdub3JlU3RyYXlUaW1lcnMgPSAoKSA9PiB7XG4gICAgdGhpcy5fX3N0cmF5VGltZXJzSWdub3JlZCA9IHRydWU7XG4gIH07XG5cbiAgdGhpcy5fb25seVdhcm5PblN0cmF5VGltZXJzID0gKCkgPT4ge1xuICAgIHRoaXMuX19vbmx5V2Fybk9uU3RyYXlUaW1lcnMgPSB0cnVlO1xuICB9O1xufVxuXG4vKipcbiAqIERldGVjdCBhbnkgc3RyYXkgdGltZXJzIHVzZWQgaW4gYmVmb3JlRWFjaCwgYWZ0ZXJFYWNoXG4gKlxuICogQHRocm93cyB7RXJyb3J9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkZXRlY3RTdHJheVRpbWVycygpIHtcbiAgLy8gY2xlYXIgb3V0IHRoZSB0aW1lcnMgZmlyc3RcbiAgLy8gdXNlIHRoZSByZWFsIG9uZSBzbyB3ZSBkb24ndCBhY2NpZGVudGFsbHkgcmVtb3ZlIGl0IGZyb20gYHN0cmF5VGltZXJzYFxuICBydW5uaW5nVGltZW91dHMuZm9yRWFjaCgoeyBpZCB9KSA9PiByZWFsQ2xlYXJUaW1lb3V0KGlkKSk7XG4gIHJ1bm5pbmdJbnRlcnZhbHMuZm9yRWFjaCgoeyBpZCB9KSA9PiByZWFsQ2xlYXJJbnRlcnZhbChpZCkpO1xuXG4gIC8vIGZpbmQgc3RyYXkgdGltZXJzIGZyb20gcHJpb3IgdGVzdHNcbiAgY29uc3Qgc3RyYXlUaW1lcnMgPSBbLi4ucnVubmluZ1RpbWVvdXRzLCAuLi5ydW5uaW5nSW50ZXJ2YWxzXTtcblxuICAvLyByZXNldCB0aW1lciBjYWNoZSBmb3IgbmV4dCB0ZXN0XG4gIHJ1bm5pbmdUaW1lb3V0cyA9IFtdO1xuICBydW5uaW5nSW50ZXJ2YWxzID0gW107XG5cbiAgaWYgKHRoaXMuX19zdHJheVRpbWVyc0lnbm9yZWQpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBpZiAoc3RyYXlUaW1lcnMubGVuZ3RoID4gMCkge1xuICAgIGNvbnN0IGZpcnN0U3RyYXlUaW1lciA9IHN0cmF5VGltZXJzLnNoaWZ0KCk7XG4gICAgaWYgKHRoaXMuX19vbmx5V2Fybk9uU3RyYXlUaW1lcnMpIHtcbiAgICAgIGNvbnNvbGUud2FybihmaXJzdFN0cmF5VGltZXIuZXJyLm1lc3NhZ2UpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aHJvdyBmaXJzdFN0cmF5VGltZXIuZXJyO1xuICB9XG59XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvdGltZXJzLmpzIiwiLyogZXNsaW50LWVudiBqYXNtaW5lICovXG5cbmltcG9ydCB7XG4gIGluc3RhbGwsXG4gIHVuaW5zdGFsbCxcbiAgZGV0ZWN0U3RyYXlUaW1lcnMsXG4gIHNldHVwVGltZXJEZXRlY3Rpb24sXG59IGZyb20gJy4vdGltZXJzJztcblxuaW1wb3J0IHsgb3ZlcnJpZGVKYXNtaW5lQ2xvY2sgfSBmcm9tICcuL2phc21pbmVDbG9jayc7XG5cbi8vIGphc21pbmUgY2xvY2sgcmVsaWVzIG9uIGhhdmluZyBhY2Nlc3MgdG8gdGhlIG9yaWdpbmFsIHRpbWVyIGZ1bmN0aW9uc1xuamFzbWluZS5jbG9jayA9IG92ZXJyaWRlSmFzbWluZUNsb2NrKGphc21pbmUuY2xvY2spO1xuXG4vLyBpbnN0YWxsIHRpbWVyc1xuYmVmb3JlQWxsKGluc3RhbGwpO1xuXG5hZnRlckFsbCh1bmluc3RhbGwpO1xuXG5iZWZvcmVFYWNoKHNldHVwVGltZXJEZXRlY3Rpb24pO1xuXG5iZWZvcmVFYWNoKGRldGVjdFN0cmF5VGltZXJzKTtcblxuYWZ0ZXJFYWNoKGRldGVjdFN0cmF5VGltZXJzKTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9pbmRleC5qcyIsImltcG9ydCB7IGluc3RhbGwsIHVuaW5zdGFsbCB9IGZyb20gJy4vdGltZXJzJztcblxubGV0IHJlYWxKYXNtaW5lQ2xvY2s7XG5cbi8qKlxuICogT3ZlcnJpZGUgdGhlIGphc21pbmUgY2xvY2sgc28gdGhhdCB3ZSBpbnN0YWxsIGFuZCB1bmluc3RhbGwgdGhlIGludGVybmFsIHRpbWVyc1xuICogamFzbWluZSBjbG9jayByZWxpZXMgb24gaGF2aW5nIGFjY2VzcyB0byB0aGUgb3JpZ2luYWwgdGltZXIgZnVuY3Rpb25zXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gb3JpZ2luYWxKYXNtaW5lQ2xvY2tcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICovXG5leHBvcnQgZnVuY3Rpb24gb3ZlcnJpZGVKYXNtaW5lQ2xvY2sob3JpZ2luYWxKYXNtaW5lQ2xvY2spIHtcbiAgaWYgKHJlYWxKYXNtaW5lQ2xvY2sgJiYgcmVhbEphc21pbmVDbG9jayAhPT0gb3JpZ2luYWxKYXNtaW5lQ2xvY2spIHtcbiAgICByZXR1cm4gb3JpZ2luYWxKYXNtaW5lQ2xvY2s7XG4gIH1cbiAgcmVhbEphc21pbmVDbG9jayA9IG9yaWdpbmFsSmFzbWluZUNsb2NrO1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgY29uc3QgY2xvY2sgPSBvcmlnaW5hbEphc21pbmVDbG9jaygpO1xuICAgIGNvbnN0IG9yaWdpbmFsSW5zdGFsbCA9IGNsb2NrLmluc3RhbGw7XG4gICAgY29uc3Qgb3JpZ2luYWxVbmluc3RhbGwgPSBjbG9jay51bmluc3RhbGw7XG4gICAgY2xvY2suaW5zdGFsbCA9IGZ1bmN0aW9uKCkge1xuICAgICAgdW5pbnN0YWxsKCk7XG4gICAgICByZXR1cm4gb3JpZ2luYWxJbnN0YWxsLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfTtcbiAgICBjbG9jay51bmluc3RhbGwgPSBmdW5jdGlvbigpIHtcbiAgICAgIGNvbnN0IHJldCA9IG9yaWdpbmFsVW5pbnN0YWxsLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICBpbnN0YWxsKCk7XG4gICAgICByZXR1cm4gcmV0O1xuICAgIH07XG4gICAgcmV0dXJuIGNsb2NrO1xuICB9O1xufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL2phc21pbmVDbG9jay5qcyJdLCJzb3VyY2VSb290IjoiIn0=