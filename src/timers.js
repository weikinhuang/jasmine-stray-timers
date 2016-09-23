(function(global) {
  const realSetTimeout = global.setTimeout;
  const realClearTimeout = global.clearTimeout;
  const realSetInterval = global.setInterval;
  const realClearInterval = global.clearInterval;

  var runningTimeouts = [];
  var runningIntervals = [];

  function removeTimeout(timerId) {
    runningTimeouts = runningTimeouts.filter(({ id }) => id !== timerId);
  }

  function localSetTimeout(fn, ...timerArgs) {
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

  function localClearTimeout(timerId) {
    removeTimeout(timerId);
    return realClearTimeout.apply(this, arguments);
  }

  function removeInterval(timerId) {
    runningIntervals = runningIntervals.filter(({ id }) => id !== timerId);
  }

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

  function localClearInterval(timerId) {
    // intervals only get removed when clearInterval is called
    removeInterval(timerId);
    return realClearInterval.apply(this, arguments);
  }

  function install() {
    window.setTimeout = localSetTimeout;
    window.clearTimeout = localClearTimeout;
    window.setInterval = localSetInterval;
    window.clearInterval = localClearInterval;
  }

  function uninstall() {
    window.setTimeout = realSetTimeout;
    window.clearTimeout = realClearTimeout;
    window.setInterval = realSetInterval;
    window.clearInterval = realClearInterval;
  }

  // install timers
  beforeAll(function() {
    install();
  });

  afterAll(function() {
    uninstall();
  });

  beforeEach(function() {
    // find stray timers from prior tests
    const strayTimers = [...runningTimeouts, ...runningIntervals];

    // reset timer cache for next test
    runningTimeouts = [];
    runningIntervals = [];

    if (strayTimers.length > 0) {
      let firstStrayTimer = strayTimers.shift();
      throw firstStrayTimer.err;
    }
  });

  afterEach(function() {
    // find stray timers from current tests
    const strayTimers = [...runningTimeouts, ...runningIntervals];

    // reset timer cache for next test
    runningTimeouts = [];
    runningIntervals = [];

    if (strayTimers.length > 0) {
      let firstStrayTimer = strayTimers.shift();
      throw firstStrayTimer.err;
    }
  });

  // jasmine clock relies on having access to the original timer functions
  const originalJasmineClock = jasmine.clock;
  jasmine.clock = function() {
    const clock = originalJasmineClock();
    const originalInstall = clock.install;
    const originalUninstall = clock.uninstall;
    clock.install = function() {
      uninstall();
      return originalInstall.apply(this, arguments);
    };
    clock.uninstall = function() {
      const ret = originalUninstall.apply(this, arguments);
      install();
      return ret;
    };
    return clock;
  };
}(window));
