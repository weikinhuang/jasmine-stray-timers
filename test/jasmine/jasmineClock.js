import { overrideJasmineClock } from '../../src/jasmineClock';
import { realSetTimeout } from '../../src/timers';

describe('jasmineClock', function() {
  beforeAll(function() {
    // jasmine clock relies on having access to the original timer functions
    jasmine.clock = overrideJasmineClock(jasmine.clock);
  });

  beforeEach(function() {
    jasmine.clock().install();
  });

  afterEach(function() {
    jasmine.clock().uninstall();
  });

  it('#overrideJasmineClock should work as intended with jasmine.clock', function(done) {
    const spy = jasmine.createSpy('timeout callback');
    setTimeout(spy, 15);

    expect(spy).not.toHaveBeenCalled();
    jasmine.clock().tick(16);
    expect(spy).toHaveBeenCalled();

    // to make sure we don't throw in the test
    realSetTimeout(done, 25);
  });

  it('#overrideJasmineClock should work as intended and not throw due to jasmine.clock', function(done) {
    const spy = jasmine.createSpy('timeout callback');
    setTimeout(spy, 25);

    expect(spy).not.toHaveBeenCalled();

    // to make sure we don't throw in the test
    realSetTimeout(done, 1);
  });
});
