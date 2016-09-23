import { install, uninstall } from './timers';

let realJasmineClock;

/**
 * Override the jasmine clock so that we install and uninstall the internal timers
 * jasmine clock relies on having access to the original timer functions
 *
 * @param {Function} originalJasmineClock
 * @return {Function}
 */
export function overrideJasmineClock(originalJasmineClock) {
  if (realJasmineClock && realJasmineClock !== originalJasmineClock) {
    return originalJasmineClock;
  }
  realJasmineClock = originalJasmineClock;
  return function() {
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
}
