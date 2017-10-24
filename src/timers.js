const realSetTimeout = window.setTimeout;
const realClearTimeout = window.clearTimeout;
const realSetInterval = window.setInterval;
const realClearInterval = window.clearInterval;

// export real timers for testing
export { realSetTimeout, realSetInterval };

let runningTimeouts = [];
let runningIntervals = [];

/**
 * Mark a timer as executed inside the test constraints
 *
 * @param {Number} timerId
 */
function removeTimeout(timerId) {
  runningTimeouts = runningTimeouts.filter(({ id }) => id !== timerId);
}

/**
 * Overridden setTimeout function that detects when it executes outside a testing constraint (`it`)
 *
 * @param {Function} fn
 * @param {Array<*>} timerArgs
 * @returns {Number}
 */
function localSetTimeout(fn, ...timerArgs) {
  if (typeof fn === 'string') {
    throw new Error('String function arguments for "setTimeout" cannot be executed.');
  }

  let timerId; // eslint-disable-line prefer-const
  const timerFn = function(...args) {
    removeTimeout(timerId);
    return fn.apply(this, args);
  };
  timerId = realSetTimeout.apply(this, [timerFn, ...timerArgs]);
  // must throw the error for PhantomJS to generate the stack trace
  let err;
  try {
    throw new Error('Stray "setTimeout" call was executed outside the test constraints');
  }
  catch (e) {
    err = e;
  }
  runningTimeouts.push({
    id: timerId,
    err,
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
  runningIntervals = runningIntervals.filter(({ id }) => id !== timerId);
}

/**
 * Overridden setInterval function that detects when it executes outside a testing constraint (`it`)
 *
 * @returns {Number}
 */
function localSetInterval() {
  const timerId = realSetInterval.apply(this, arguments);
  // must throw the error for PhantomJS to generate the stack trace
  let err;
  try {
    throw new Error('Stray "setInterval" call was executed outside the test constraints');
  }
  catch (e) {
    err = e;
  }
  runningIntervals.push({
    id: timerId,
    err,
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
export function install() {
  const map = {
    setTimeout: localSetTimeout,
    clearTimeout: localClearTimeout,
    setInterval: localSetInterval,
    clearInterval: localClearInterval,
  };
  Object.keys(map).forEach((fn) => {
    const descriptor = Object.getOwnPropertyDescriptor(window, fn);
    descriptor.value = map[fn];
    Object.defineProperty(window, fn, descriptor);
  });
}

/**
 * Restore the original timer functions
 */
export function uninstall() {
  const map = {
    setTimeout: realSetTimeout,
    clearTimeout: realClearTimeout,
    setInterval: realSetInterval,
    clearInterval: realClearInterval,
  };
  Object.keys(map).forEach((fn) => {
    const descriptor = Object.getOwnPropertyDescriptor(window, fn);
    descriptor.value = map[fn];
    Object.defineProperty(window, fn, descriptor);
  });
}

/**
 * Set up jasmine instance variable for ignoring promises
 */
export function setupTimerDetection() {
  this._ignoreStrayTimers = () => {
    this.__strayTimersIgnored = true;
  };

  this._onlyWarnStrayTimers = () => {
    this.__onlyWarnStrayTimers = true;
  };
}

/**
 * Detect any stray timers used in beforeEach, afterEach
 *
 * @throws {Error}
 */
export function detectStrayTimers() {
  // clear out the timers first
  // use the real one so we don't accidentally remove it from `strayTimers`
  runningTimeouts.forEach(({ id }) => realClearTimeout(id));
  runningIntervals.forEach(({ id }) => realClearInterval(id));

  // find stray timers from prior tests
  const strayTimers = [...runningTimeouts, ...runningIntervals];

  // reset timer cache for next test
  runningTimeouts = [];
  runningIntervals = [];

  if (this.__strayTimersIgnored) {
    return;
  }

  if (strayTimers.length > 0) {
    const firstStrayTimer = strayTimers.shift();
    if (this.__onlyWarnStrayTimers) {
      console.warn(firstStrayTimer.err.message);
      return;
    }
    throw firstStrayTimer.err;
  }
}
