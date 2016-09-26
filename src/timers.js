const realSetTimeout = window.setTimeout;
const realClearTimeout = window.clearTimeout;
const realSetInterval = window.setInterval;
const realClearInterval = window.clearInterval;

// export real timers for testing
export { realSetTimeout, realSetInterval };

var runningTimeouts = [];
var runningIntervals = [];

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

  let timerId;
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
    err
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
  let timerId = realSetInterval.apply(this, arguments);
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
    err
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
  window.setTimeout = localSetTimeout;
  window.clearTimeout = localClearTimeout;
  window.setInterval = localSetInterval;
  window.clearInterval = localClearInterval;
}

/**
 * Restore the original timer functions
 */
export function uninstall() {
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

  if (strayTimers.length > 0) {
    let firstStrayTimer = strayTimers.shift();
    throw firstStrayTimer.err;
  }
}
