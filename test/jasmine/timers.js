import {
  install,
  uninstall,
  detectStrayTimers
} from '../../src/timers';

describe('a', function() {
  describe('#detectStrayTimers', function() {
    beforeEach(install);

    afterEach(uninstall);

    it('whatever', function() {
      detectStrayTimers();
      expect(1).toEqual(1);
    });
  });
});
