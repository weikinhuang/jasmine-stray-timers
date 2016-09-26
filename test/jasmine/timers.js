import {
  install,
  uninstall,
  detectStrayTimers,
  realSetTimeout
} from '../../src/timers';

describe('timers', function() {
  describe('#install', function() {
    afterEach(uninstall);

    it('should replace real timers', function() {
      install();

      expect(setTimeout.toString()).not.toMatch(/\{\s*\[native code\]\s*\}/);
      expect(setInterval.toString()).not.toMatch(/\{\s*\[native code\]\s*\}/);
    });
  });

  describe('#uninstall', function() {
    beforeEach(install);

    it('should replace real timers', function() {
      uninstall();

      expect(setTimeout.toString()).toMatch(/\{\s*\[native code\]\s*\}/);
      expect(setInterval.toString()).toMatch(/\{\s*\[native code\]\s*\}/);
    });
  });

  describe('#detectStrayTimers', function() {
    beforeEach(install);

    afterEach(uninstall);

    describe('setTimeout()', function() {
      it('should throw if string function passed in', function() {
        expect(() => {
          setTimeout('foo', 10);
        }).toThrowError(/String function arguments/);
      });

      it('should throw if timers executed outside of test', function() {
        setTimeout(() => {}, 10);
        expect(() => {
          detectStrayTimers();
        }).toThrowError(/"setTimeout"/);
      });

      it('should not throw if timers executed within test', function(done) {
        const spy = jasmine.createSpy('timeout callback');
        setTimeout(spy, 10);

        realSetTimeout(() => {
          expect(spy).toHaveBeenCalled();
          expect(() => {
            detectStrayTimers();
          }).not.toThrowError(/"setTimeout"/);
          done();
        }, 15);
      });

      it('should not throw if timers cleared within test', function() {
        const spy = jasmine.createSpy('timeout callback');
        const timerId = setTimeout(spy, 10);
        clearTimeout(timerId);

        expect(spy).not.toHaveBeenCalled();
        expect(() => {
          detectStrayTimers();
        }).not.toThrowError(/"setTimeout"/);
      });
    });

    describe('setInterval()', function() {
      it('should throw if timers executed outside of test', function() {
        setInterval(() => {}, 10);
        expect(() => {
          detectStrayTimers();
        }).toThrowError(/"setInterval"/);
      });

      it('should not throw if timers cleared within test', function(done) {
        let timerId;
        const spy = jasmine.createSpy('timeout callback', () => clearInterval(timerId)).and.callThrough();
        timerId = setInterval(spy, 10);

        realSetTimeout(() => {
          expect(spy).toHaveBeenCalled();
          expect(() => {
            detectStrayTimers();
          }).not.toThrowError(/"setInterval"/);
          done();
        }, 15);
      });
    });
  });
});
