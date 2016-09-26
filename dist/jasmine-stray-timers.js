/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.l = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// identity function for calling harmory imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };

/******/ 	// define getter function for harmory exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		Object.defineProperty(exports, name, {
/******/ 			configurable: false,
/******/ 			enumerable: true,
/******/ 			get: getter
/******/ 		});
/******/ 	};

/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};

/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 2);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports) {

"use strict";
eval("'use strict';\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports.install = install;\nexports.uninstall = uninstall;\nexports.detectStrayTimers = detectStrayTimers;\n\nfunction _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }\n\nvar realSetTimeout = window.setTimeout;\nvar realClearTimeout = window.clearTimeout;\nvar realSetInterval = window.setInterval;\nvar realClearInterval = window.clearInterval;\n\n// export real timers for testing\nexports.realSetTimeout = realSetTimeout;\nexports.realSetInterval = realSetInterval;\n\n\nvar runningTimeouts = [];\nvar runningIntervals = [];\n\n/**\n * Mark a timer as executed inside the test constraints\n *\n * @param {Number} timerId\n */\nfunction removeTimeout(timerId) {\n  runningTimeouts = runningTimeouts.filter(function (_ref) {\n    var id = _ref.id;\n    return id !== timerId;\n  });\n}\n\n/**\n * Overridden setTimeout function that detects when it executes outside a testing constraint (`it`)\n *\n * @param {Function} fn\n * @param {Array<*>} timerArgs\n * @returns {Number}\n */\nfunction localSetTimeout(fn) {\n  if (typeof fn === 'string') {\n    throw new Error('String function arguments for \"setTimeout\" cannot be executed.');\n  }\n\n  var timerId = void 0;\n  var timerFn = function timerFn() {\n    removeTimeout(timerId);\n\n    for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {\n      args[_key2] = arguments[_key2];\n    }\n\n    return fn.apply(this, args);\n  };\n\n  for (var _len = arguments.length, timerArgs = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {\n    timerArgs[_key - 1] = arguments[_key];\n  }\n\n  timerId = realSetTimeout.apply(this, [timerFn].concat(timerArgs));\n  // must throw the error for PhantomJS to generate the stack trace\n  var err = void 0;\n  try {\n    throw new Error('Stray \"setTimeout\" call was executed outside the test constraints');\n  } catch (e) {\n    err = e;\n  }\n  runningTimeouts.push({\n    id: timerId,\n    err: err\n  });\n  return timerId;\n}\n\n/**\n * Overridden clearTimeout function that removes the check for a stray setTimeout\n *\n * @param {Number} timerId\n * @returns {undefined}\n */\nfunction localClearTimeout(timerId) {\n  removeTimeout(timerId);\n  return realClearTimeout.apply(this, arguments);\n}\n\n/**\n * Mark an interval as cleared inside the test constraints\n *\n * @param {Number} timerId\n */\nfunction removeInterval(timerId) {\n  runningIntervals = runningIntervals.filter(function (_ref2) {\n    var id = _ref2.id;\n    return id !== timerId;\n  });\n}\n\n/**\n * Overridden setInterval function that detects when it executes outside a testing constraint (`it`)\n *\n * @returns {Number}\n */\nfunction localSetInterval() {\n  var timerId = realSetInterval.apply(this, arguments);\n  // must throw the error for PhantomJS to generate the stack trace\n  var err = void 0;\n  try {\n    throw new Error('Stray \"setInterval\" call was executed outside the test constraints');\n  } catch (e) {\n    err = e;\n  }\n  runningIntervals.push({\n    id: timerId,\n    err: err\n  });\n  return timerId;\n}\n\n/**\n * Overridden clearInterval function that removes the check for a stray setInterval\n *\n * @param {Number} timerId\n * @returns {undefined}\n */\nfunction localClearInterval(timerId) {\n  // intervals only get removed when clearInterval is called\n  removeInterval(timerId);\n  return realClearInterval.apply(this, arguments);\n}\n\n/**\n * Override the timer functions with the tested functions\n */\nfunction install() {\n  window.setTimeout = localSetTimeout;\n  window.clearTimeout = localClearTimeout;\n  window.setInterval = localSetInterval;\n  window.clearInterval = localClearInterval;\n}\n\n/**\n * Restore the original timer functions\n */\nfunction uninstall() {\n  window.setTimeout = realSetTimeout;\n  window.clearTimeout = realClearTimeout;\n  window.setInterval = realSetInterval;\n  window.clearInterval = realClearInterval;\n}\n\n/**\n * Detect any stray timers used in beforeEach, afterEach\n *\n * @throws {Error}\n */\nfunction detectStrayTimers() {\n  // clear out the timers first\n  // use the real one so we don't accidentally remove it from `strayTimers`\n  runningTimeouts.forEach(function (_ref3) {\n    var id = _ref3.id;\n    return realClearTimeout(id);\n  });\n  runningIntervals.forEach(function (_ref4) {\n    var id = _ref4.id;\n    return realClearInterval(id);\n  });\n\n  // find stray timers from prior tests\n  var strayTimers = [].concat(_toConsumableArray(runningTimeouts), _toConsumableArray(runningIntervals));\n\n  // reset timer cache for next test\n  runningTimeouts = [];\n  runningIntervals = [];\n\n  if (strayTimers.length > 0) {\n    var firstStrayTimer = strayTimers.shift();\n    throw firstStrayTimer.err;\n  }\n}\n\n//////////////////\n// WEBPACK FOOTER\n// ./src/timers.js\n// module id = 0\n// module chunks = 0\n\n//# sourceURL=webpack:///./src/timers.js?");

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
eval("'use strict';\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports.overrideJasmineClock = overrideJasmineClock;\n\nvar _timers = __webpack_require__(0);\n\nvar realJasmineClock = void 0;\n\n/**\n * Override the jasmine clock so that we install and uninstall the internal timers\n * jasmine clock relies on having access to the original timer functions\n *\n * @param {Function} originalJasmineClock\n * @return {Function}\n */\nfunction overrideJasmineClock(originalJasmineClock) {\n  if (realJasmineClock && realJasmineClock !== originalJasmineClock) {\n    return originalJasmineClock;\n  }\n  realJasmineClock = originalJasmineClock;\n  return function () {\n    var clock = originalJasmineClock();\n    var originalInstall = clock.install;\n    var originalUninstall = clock.uninstall;\n    clock.install = function () {\n      (0, _timers.uninstall)();\n      return originalInstall.apply(this, arguments);\n    };\n    clock.uninstall = function () {\n      var ret = originalUninstall.apply(this, arguments);\n      (0, _timers.install)();\n      return ret;\n    };\n    return clock;\n  };\n}\n\n//////////////////\n// WEBPACK FOOTER\n// ./src/jasmineClock.js\n// module id = 1\n// module chunks = 0\n\n//# sourceURL=webpack:///./src/jasmineClock.js?");

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
eval("'use strict';\n\nvar _timers = __webpack_require__(0);\n\nvar _jasmineClock = __webpack_require__(1);\n\n// jasmine clock relies on having access to the original timer functions\n/* eslint-env jasmine */\n\njasmine.clock = (0, _jasmineClock.overrideJasmineClock)(jasmine.clock);\n\n// install timers\nbeforeAll(_timers.install);\n\nafterAll(_timers.uninstall);\n\nbeforeEach(_timers.detectStrayTimers);\n\nafterEach(_timers.detectStrayTimers);\n\n//////////////////\n// WEBPACK FOOTER\n// ./src/index.js\n// module id = 2\n// module chunks = 0\n\n//# sourceURL=webpack:///./src/index.js?");

/***/ }
/******/ ]);