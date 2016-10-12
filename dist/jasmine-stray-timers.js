/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
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
/******/ 	// identity function for calling harmory imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmory exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		Object.defineProperty(exports, name, {
/******/ 			configurable: false,
/******/ 			enumerable: true,
/******/ 			get: getter
/******/ 		});
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
/******/ 	return __webpack_require__(__webpack_require__.s = 2);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports) {

"use strict";
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.install = install;
exports.uninstall = uninstall;
exports.detectStrayTimers = detectStrayTimers;

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var realSetTimeout = window.setTimeout;
var realClearTimeout = window.clearTimeout;
var realSetInterval = window.setInterval;
var realClearInterval = window.clearInterval;

// export real timers for testing
exports.realSetTimeout = realSetTimeout;
exports.realSetInterval = realSetInterval;


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

  var timerId = void 0;
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

  timerId = realSetTimeout.apply(this, [timerFn].concat(timerArgs));
  // must throw the error for PhantomJS to generate the stack trace
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
  var timerId = realSetInterval.apply(this, arguments);
  // must throw the error for PhantomJS to generate the stack trace
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
  window.setTimeout = localSetTimeout;
  window.clearTimeout = localClearTimeout;
  window.setInterval = localSetInterval;
  window.clearInterval = localClearInterval;
}

/**
 * Restore the original timer functions
 */
function uninstall() {
  window.setTimeout = realSetTimeout;
  window.clearTimeout = realClearTimeout;
  window.setInterval = realSetInterval;
  window.clearInterval = realClearInterval;
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
  });

  // find stray timers from prior tests
  var strayTimers = [].concat(_toConsumableArray(runningTimeouts), _toConsumableArray(runningIntervals));

  // reset timer cache for next test
  runningTimeouts = [];
  runningIntervals = [];

  if (strayTimers.length > 0) {
    var firstStrayTimer = strayTimers.shift();
    throw firstStrayTimer.err;
  }
}

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.overrideJasmineClock = overrideJasmineClock;

var _timers = __webpack_require__(0);

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
      (0, _timers.uninstall)();
      return originalInstall.apply(this, arguments);
    };
    clock.uninstall = function () {
      var ret = originalUninstall.apply(this, arguments);
      (0, _timers.install)();
      return ret;
    };
    return clock;
  };
}

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
'use strict';

var _timers = __webpack_require__(0);

var _jasmineClock = __webpack_require__(1);

// jasmine clock relies on having access to the original timer functions
/* eslint-env jasmine */

jasmine.clock = (0, _jasmineClock.overrideJasmineClock)(jasmine.clock);

// install timers
beforeAll(_timers.install);

afterAll(_timers.uninstall);

beforeEach(_timers.detectStrayTimers);

afterEach(_timers.detectStrayTimers);

/***/ }
/******/ ]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgYzk0YmIyMjM3YjNkYWRhYTdjZjAiLCJ3ZWJwYWNrOi8vLy4vc3JjL3RpbWVycy5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvamFzbWluZUNsb2NrLmpzIiwid2VicGFjazovLy8uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6WyJpbnN0YWxsIiwidW5pbnN0YWxsIiwiZGV0ZWN0U3RyYXlUaW1lcnMiLCJyZWFsU2V0VGltZW91dCIsIndpbmRvdyIsInNldFRpbWVvdXQiLCJyZWFsQ2xlYXJUaW1lb3V0IiwiY2xlYXJUaW1lb3V0IiwicmVhbFNldEludGVydmFsIiwic2V0SW50ZXJ2YWwiLCJyZWFsQ2xlYXJJbnRlcnZhbCIsImNsZWFySW50ZXJ2YWwiLCJydW5uaW5nVGltZW91dHMiLCJydW5uaW5nSW50ZXJ2YWxzIiwicmVtb3ZlVGltZW91dCIsInRpbWVySWQiLCJmaWx0ZXIiLCJpZCIsImxvY2FsU2V0VGltZW91dCIsImZuIiwiRXJyb3IiLCJ0aW1lckZuIiwiYXJncyIsImFwcGx5IiwidGltZXJBcmdzIiwiZXJyIiwiZSIsInB1c2giLCJsb2NhbENsZWFyVGltZW91dCIsImFyZ3VtZW50cyIsInJlbW92ZUludGVydmFsIiwibG9jYWxTZXRJbnRlcnZhbCIsImxvY2FsQ2xlYXJJbnRlcnZhbCIsImZvckVhY2giLCJzdHJheVRpbWVycyIsImxlbmd0aCIsImZpcnN0U3RyYXlUaW1lciIsInNoaWZ0Iiwib3ZlcnJpZGVKYXNtaW5lQ2xvY2siLCJyZWFsSmFzbWluZUNsb2NrIiwib3JpZ2luYWxKYXNtaW5lQ2xvY2siLCJjbG9jayIsIm9yaWdpbmFsSW5zdGFsbCIsIm9yaWdpbmFsVW5pbnN0YWxsIiwicmV0IiwiamFzbWluZSIsImJlZm9yZUFsbCIsImFmdGVyQWxsIiwiYmVmb3JlRWFjaCIsImFmdGVyRWFjaCJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FB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SXFCLFlBQVlDLE1BQVosR0FBcUIsQ0FBekIsRUFBNEI7QUFDMUIsUUFBSUMsa0JBQWtCRixZQUFZRyxLQUFaLEVBQXRCO0FBQ0EsVUFBTUQsZ0JBQWdCWCxHQUF0QjtBQUNEO0FBQ0YsQzs7Ozs7Ozs7Ozs7O1FDMUllYSxvQixHQUFBQSxvQjs7QUFYaEI7O0FBRUEsSUFBSUMseUJBQUo7O0FBRUE7Ozs7Ozs7QUFPTyxTQUFTRCxvQkFBVCxDQUE4QkUsb0JBQTlCLEVBQW9EO0FBQ3pELE1BQUlELG9CQUFvQkEscUJBQXFCQyxvQkFBN0MsRUFBbUU7QUFDakUsV0FBT0Esb0JBQVA7QUFDRDtBQUNERCxxQkFBbUJDLG9CQUFuQjtBQUNBLFNBQU8sWUFBVztBQUNoQixRQUFNQyxRQUFRRCxzQkFBZDtBQUNBLFFBQU1FLGtCQUFrQkQsTUFBTXpDLE9BQTlCO0FBQ0EsUUFBTTJDLG9CQUFvQkYsTUFBTXhDLFNBQWhDO0FBQ0F3QyxVQUFNekMsT0FBTixHQUFnQixZQUFXO0FBQ3pCO0FBQ0EsYUFBTzBDLGdCQUFnQm5CLEtBQWhCLENBQXNCLElBQXRCLEVBQTRCTSxTQUE1QixDQUFQO0FBQ0QsS0FIRDtBQUlBWSxVQUFNeEMsU0FBTixHQUFrQixZQUFXO0FBQzNCLFVBQU0yQyxNQUFNRCxrQkFBa0JwQixLQUFsQixDQUF3QixJQUF4QixFQUE4Qk0sU0FBOUIsQ0FBWjtBQUNBO0FBQ0EsYUFBT2UsR0FBUDtBQUNELEtBSkQ7QUFLQSxXQUFPSCxLQUFQO0FBQ0QsR0FkRDtBQWVELEM7Ozs7Ozs7OztBQzdCRDs7QUFNQTs7QUFFQTtBQVZBOztBQVdBSSxRQUFRSixLQUFSLEdBQWdCLHdDQUFxQkksUUFBUUosS0FBN0IsQ0FBaEI7O0FBRUE7QUFDQUs7O0FBRUFDOztBQUVBQzs7QUFFQUMscUMiLCJmaWxlIjoiamFzbWluZS1zdHJheS10aW1lcnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSlcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcblxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gaWRlbnRpdHkgZnVuY3Rpb24gZm9yIGNhbGxpbmcgaGFybW9yeSBpbXBvcnRzIHdpdGggdGhlIGNvcnJlY3QgY29udGV4dFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5pID0gZnVuY3Rpb24odmFsdWUpIHsgcmV0dXJuIHZhbHVlOyB9O1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb3J5IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwge1xuIFx0XHRcdGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4gXHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcbiBcdFx0XHRnZXQ6IGdldHRlclxuIFx0XHR9KTtcbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gMik7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gd2VicGFjay9ib290c3RyYXAgYzk0YmIyMjM3YjNkYWRhYTdjZjAiLCJjb25zdCByZWFsU2V0VGltZW91dCA9IHdpbmRvdy5zZXRUaW1lb3V0O1xuY29uc3QgcmVhbENsZWFyVGltZW91dCA9IHdpbmRvdy5jbGVhclRpbWVvdXQ7XG5jb25zdCByZWFsU2V0SW50ZXJ2YWwgPSB3aW5kb3cuc2V0SW50ZXJ2YWw7XG5jb25zdCByZWFsQ2xlYXJJbnRlcnZhbCA9IHdpbmRvdy5jbGVhckludGVydmFsO1xuXG4vLyBleHBvcnQgcmVhbCB0aW1lcnMgZm9yIHRlc3RpbmdcbmV4cG9ydCB7IHJlYWxTZXRUaW1lb3V0LCByZWFsU2V0SW50ZXJ2YWwgfTtcblxudmFyIHJ1bm5pbmdUaW1lb3V0cyA9IFtdO1xudmFyIHJ1bm5pbmdJbnRlcnZhbHMgPSBbXTtcblxuLyoqXG4gKiBNYXJrIGEgdGltZXIgYXMgZXhlY3V0ZWQgaW5zaWRlIHRoZSB0ZXN0IGNvbnN0cmFpbnRzXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IHRpbWVySWRcbiAqL1xuZnVuY3Rpb24gcmVtb3ZlVGltZW91dCh0aW1lcklkKSB7XG4gIHJ1bm5pbmdUaW1lb3V0cyA9IHJ1bm5pbmdUaW1lb3V0cy5maWx0ZXIoKHsgaWQgfSkgPT4gaWQgIT09IHRpbWVySWQpO1xufVxuXG4vKipcbiAqIE92ZXJyaWRkZW4gc2V0VGltZW91dCBmdW5jdGlvbiB0aGF0IGRldGVjdHMgd2hlbiBpdCBleGVjdXRlcyBvdXRzaWRlIGEgdGVzdGluZyBjb25zdHJhaW50IChgaXRgKVxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcGFyYW0ge0FycmF5PCo+fSB0aW1lckFyZ3NcbiAqIEByZXR1cm5zIHtOdW1iZXJ9XG4gKi9cbmZ1bmN0aW9uIGxvY2FsU2V0VGltZW91dChmbiwgLi4udGltZXJBcmdzKSB7XG4gIGlmICh0eXBlb2YgZm4gPT09ICdzdHJpbmcnKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdTdHJpbmcgZnVuY3Rpb24gYXJndW1lbnRzIGZvciBcInNldFRpbWVvdXRcIiBjYW5ub3QgYmUgZXhlY3V0ZWQuJyk7XG4gIH1cblxuICBsZXQgdGltZXJJZDtcbiAgY29uc3QgdGltZXJGbiA9IGZ1bmN0aW9uKC4uLmFyZ3MpIHtcbiAgICByZW1vdmVUaW1lb3V0KHRpbWVySWQpO1xuICAgIHJldHVybiBmbi5hcHBseSh0aGlzLCBhcmdzKTtcbiAgfTtcbiAgdGltZXJJZCA9IHJlYWxTZXRUaW1lb3V0LmFwcGx5KHRoaXMsIFt0aW1lckZuLCAuLi50aW1lckFyZ3NdKTtcbiAgLy8gbXVzdCB0aHJvdyB0aGUgZXJyb3IgZm9yIFBoYW50b21KUyB0byBnZW5lcmF0ZSB0aGUgc3RhY2sgdHJhY2VcbiAgbGV0IGVycjtcbiAgdHJ5IHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1N0cmF5IFwic2V0VGltZW91dFwiIGNhbGwgd2FzIGV4ZWN1dGVkIG91dHNpZGUgdGhlIHRlc3QgY29uc3RyYWludHMnKTtcbiAgfVxuICBjYXRjaCAoZSkge1xuICAgIGVyciA9IGU7XG4gIH1cbiAgcnVubmluZ1RpbWVvdXRzLnB1c2goe1xuICAgIGlkOiB0aW1lcklkLFxuICAgIGVyclxuICB9KTtcbiAgcmV0dXJuIHRpbWVySWQ7XG59XG5cbi8qKlxuICogT3ZlcnJpZGRlbiBjbGVhclRpbWVvdXQgZnVuY3Rpb24gdGhhdCByZW1vdmVzIHRoZSBjaGVjayBmb3IgYSBzdHJheSBzZXRUaW1lb3V0XG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IHRpbWVySWRcbiAqIEByZXR1cm5zIHt1bmRlZmluZWR9XG4gKi9cbmZ1bmN0aW9uIGxvY2FsQ2xlYXJUaW1lb3V0KHRpbWVySWQpIHtcbiAgcmVtb3ZlVGltZW91dCh0aW1lcklkKTtcbiAgcmV0dXJuIHJlYWxDbGVhclRpbWVvdXQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn1cblxuLyoqXG4gKiBNYXJrIGFuIGludGVydmFsIGFzIGNsZWFyZWQgaW5zaWRlIHRoZSB0ZXN0IGNvbnN0cmFpbnRzXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IHRpbWVySWRcbiAqL1xuZnVuY3Rpb24gcmVtb3ZlSW50ZXJ2YWwodGltZXJJZCkge1xuICBydW5uaW5nSW50ZXJ2YWxzID0gcnVubmluZ0ludGVydmFscy5maWx0ZXIoKHsgaWQgfSkgPT4gaWQgIT09IHRpbWVySWQpO1xufVxuXG4vKipcbiAqIE92ZXJyaWRkZW4gc2V0SW50ZXJ2YWwgZnVuY3Rpb24gdGhhdCBkZXRlY3RzIHdoZW4gaXQgZXhlY3V0ZXMgb3V0c2lkZSBhIHRlc3RpbmcgY29uc3RyYWludCAoYGl0YClcbiAqXG4gKiBAcmV0dXJucyB7TnVtYmVyfVxuICovXG5mdW5jdGlvbiBsb2NhbFNldEludGVydmFsKCkge1xuICBsZXQgdGltZXJJZCA9IHJlYWxTZXRJbnRlcnZhbC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAvLyBtdXN0IHRocm93IHRoZSBlcnJvciBmb3IgUGhhbnRvbUpTIHRvIGdlbmVyYXRlIHRoZSBzdGFjayB0cmFjZVxuICBsZXQgZXJyO1xuICB0cnkge1xuICAgIHRocm93IG5ldyBFcnJvcignU3RyYXkgXCJzZXRJbnRlcnZhbFwiIGNhbGwgd2FzIGV4ZWN1dGVkIG91dHNpZGUgdGhlIHRlc3QgY29uc3RyYWludHMnKTtcbiAgfVxuICBjYXRjaCAoZSkge1xuICAgIGVyciA9IGU7XG4gIH1cbiAgcnVubmluZ0ludGVydmFscy5wdXNoKHtcbiAgICBpZDogdGltZXJJZCxcbiAgICBlcnJcbiAgfSk7XG4gIHJldHVybiB0aW1lcklkO1xufVxuXG4vKipcbiAqIE92ZXJyaWRkZW4gY2xlYXJJbnRlcnZhbCBmdW5jdGlvbiB0aGF0IHJlbW92ZXMgdGhlIGNoZWNrIGZvciBhIHN0cmF5IHNldEludGVydmFsXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IHRpbWVySWRcbiAqIEByZXR1cm5zIHt1bmRlZmluZWR9XG4gKi9cbmZ1bmN0aW9uIGxvY2FsQ2xlYXJJbnRlcnZhbCh0aW1lcklkKSB7XG4gIC8vIGludGVydmFscyBvbmx5IGdldCByZW1vdmVkIHdoZW4gY2xlYXJJbnRlcnZhbCBpcyBjYWxsZWRcbiAgcmVtb3ZlSW50ZXJ2YWwodGltZXJJZCk7XG4gIHJldHVybiByZWFsQ2xlYXJJbnRlcnZhbC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufVxuXG4vKipcbiAqIE92ZXJyaWRlIHRoZSB0aW1lciBmdW5jdGlvbnMgd2l0aCB0aGUgdGVzdGVkIGZ1bmN0aW9uc1xuICovXG5leHBvcnQgZnVuY3Rpb24gaW5zdGFsbCgpIHtcbiAgd2luZG93LnNldFRpbWVvdXQgPSBsb2NhbFNldFRpbWVvdXQ7XG4gIHdpbmRvdy5jbGVhclRpbWVvdXQgPSBsb2NhbENsZWFyVGltZW91dDtcbiAgd2luZG93LnNldEludGVydmFsID0gbG9jYWxTZXRJbnRlcnZhbDtcbiAgd2luZG93LmNsZWFySW50ZXJ2YWwgPSBsb2NhbENsZWFySW50ZXJ2YWw7XG59XG5cbi8qKlxuICogUmVzdG9yZSB0aGUgb3JpZ2luYWwgdGltZXIgZnVuY3Rpb25zXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1bmluc3RhbGwoKSB7XG4gIHdpbmRvdy5zZXRUaW1lb3V0ID0gcmVhbFNldFRpbWVvdXQ7XG4gIHdpbmRvdy5jbGVhclRpbWVvdXQgPSByZWFsQ2xlYXJUaW1lb3V0O1xuICB3aW5kb3cuc2V0SW50ZXJ2YWwgPSByZWFsU2V0SW50ZXJ2YWw7XG4gIHdpbmRvdy5jbGVhckludGVydmFsID0gcmVhbENsZWFySW50ZXJ2YWw7XG59XG5cbi8qKlxuICogRGV0ZWN0IGFueSBzdHJheSB0aW1lcnMgdXNlZCBpbiBiZWZvcmVFYWNoLCBhZnRlckVhY2hcbiAqXG4gKiBAdGhyb3dzIHtFcnJvcn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRldGVjdFN0cmF5VGltZXJzKCkge1xuICAvLyBjbGVhciBvdXQgdGhlIHRpbWVycyBmaXJzdFxuICAvLyB1c2UgdGhlIHJlYWwgb25lIHNvIHdlIGRvbid0IGFjY2lkZW50YWxseSByZW1vdmUgaXQgZnJvbSBgc3RyYXlUaW1lcnNgXG4gIHJ1bm5pbmdUaW1lb3V0cy5mb3JFYWNoKCh7IGlkIH0pID0+IHJlYWxDbGVhclRpbWVvdXQoaWQpKTtcbiAgcnVubmluZ0ludGVydmFscy5mb3JFYWNoKCh7IGlkIH0pID0+IHJlYWxDbGVhckludGVydmFsKGlkKSk7XG5cbiAgLy8gZmluZCBzdHJheSB0aW1lcnMgZnJvbSBwcmlvciB0ZXN0c1xuICBjb25zdCBzdHJheVRpbWVycyA9IFsuLi5ydW5uaW5nVGltZW91dHMsIC4uLnJ1bm5pbmdJbnRlcnZhbHNdO1xuXG4gIC8vIHJlc2V0IHRpbWVyIGNhY2hlIGZvciBuZXh0IHRlc3RcbiAgcnVubmluZ1RpbWVvdXRzID0gW107XG4gIHJ1bm5pbmdJbnRlcnZhbHMgPSBbXTtcblxuICBpZiAoc3RyYXlUaW1lcnMubGVuZ3RoID4gMCkge1xuICAgIGxldCBmaXJzdFN0cmF5VGltZXIgPSBzdHJheVRpbWVycy5zaGlmdCgpO1xuICAgIHRocm93IGZpcnN0U3RyYXlUaW1lci5lcnI7XG4gIH1cbn1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy90aW1lcnMuanMiLCJpbXBvcnQgeyBpbnN0YWxsLCB1bmluc3RhbGwgfSBmcm9tICcuL3RpbWVycyc7XG5cbmxldCByZWFsSmFzbWluZUNsb2NrO1xuXG4vKipcbiAqIE92ZXJyaWRlIHRoZSBqYXNtaW5lIGNsb2NrIHNvIHRoYXQgd2UgaW5zdGFsbCBhbmQgdW5pbnN0YWxsIHRoZSBpbnRlcm5hbCB0aW1lcnNcbiAqIGphc21pbmUgY2xvY2sgcmVsaWVzIG9uIGhhdmluZyBhY2Nlc3MgdG8gdGhlIG9yaWdpbmFsIHRpbWVyIGZ1bmN0aW9uc1xuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IG9yaWdpbmFsSmFzbWluZUNsb2NrXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG92ZXJyaWRlSmFzbWluZUNsb2NrKG9yaWdpbmFsSmFzbWluZUNsb2NrKSB7XG4gIGlmIChyZWFsSmFzbWluZUNsb2NrICYmIHJlYWxKYXNtaW5lQ2xvY2sgIT09IG9yaWdpbmFsSmFzbWluZUNsb2NrKSB7XG4gICAgcmV0dXJuIG9yaWdpbmFsSmFzbWluZUNsb2NrO1xuICB9XG4gIHJlYWxKYXNtaW5lQ2xvY2sgPSBvcmlnaW5hbEphc21pbmVDbG9jaztcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIGNvbnN0IGNsb2NrID0gb3JpZ2luYWxKYXNtaW5lQ2xvY2soKTtcbiAgICBjb25zdCBvcmlnaW5hbEluc3RhbGwgPSBjbG9jay5pbnN0YWxsO1xuICAgIGNvbnN0IG9yaWdpbmFsVW5pbnN0YWxsID0gY2xvY2sudW5pbnN0YWxsO1xuICAgIGNsb2NrLmluc3RhbGwgPSBmdW5jdGlvbigpIHtcbiAgICAgIHVuaW5zdGFsbCgpO1xuICAgICAgcmV0dXJuIG9yaWdpbmFsSW5zdGFsbC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH07XG4gICAgY2xvY2sudW5pbnN0YWxsID0gZnVuY3Rpb24oKSB7XG4gICAgICBjb25zdCByZXQgPSBvcmlnaW5hbFVuaW5zdGFsbC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgaW5zdGFsbCgpO1xuICAgICAgcmV0dXJuIHJldDtcbiAgICB9O1xuICAgIHJldHVybiBjbG9jaztcbiAgfTtcbn1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9qYXNtaW5lQ2xvY2suanMiLCIvKiBlc2xpbnQtZW52IGphc21pbmUgKi9cblxuaW1wb3J0IHtcbiAgaW5zdGFsbCxcbiAgdW5pbnN0YWxsLFxuICBkZXRlY3RTdHJheVRpbWVyc1xufSBmcm9tICcuL3RpbWVycyc7XG5cbmltcG9ydCB7IG92ZXJyaWRlSmFzbWluZUNsb2NrIH0gZnJvbSAnLi9qYXNtaW5lQ2xvY2snO1xuXG4vLyBqYXNtaW5lIGNsb2NrIHJlbGllcyBvbiBoYXZpbmcgYWNjZXNzIHRvIHRoZSBvcmlnaW5hbCB0aW1lciBmdW5jdGlvbnNcbmphc21pbmUuY2xvY2sgPSBvdmVycmlkZUphc21pbmVDbG9jayhqYXNtaW5lLmNsb2NrKTtcblxuLy8gaW5zdGFsbCB0aW1lcnNcbmJlZm9yZUFsbChpbnN0YWxsKTtcblxuYWZ0ZXJBbGwodW5pbnN0YWxsKTtcblxuYmVmb3JlRWFjaChkZXRlY3RTdHJheVRpbWVycyk7XG5cbmFmdGVyRWFjaChkZXRlY3RTdHJheVRpbWVycyk7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvaW5kZXguanMiXSwic291cmNlUm9vdCI6IiJ9