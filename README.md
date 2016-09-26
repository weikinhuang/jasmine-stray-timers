# jasmine-stray-timers [![Build Status](https://travis-ci.org/behance/jasmine-stray-timers.svg?branch=master)](https://travis-ci.org/behance/jasmine-stray-timers)

Jasmine test helper for detecting `setTimeout` and `setInterval` usage outside of test boundaries.

> Requires [`jasmine`](https://github.com/jasmine/jasmine).

## Install

```
$ npm install --save-dev jasmine-stray-timers
```

## Usage

In `karma`:

```javascript
// karma.conf.js
module.exports = function(config) {
  config.set({
    frameworks: ['jasmine'],

    files: [
      // ...,
      require.resolve('jasmine-stray-timers'),
      // ...
    ],
  });
};
```

## Output

If test code executed a timer and didn't wait for it to resolve before ending the test, it will throw an error.

```javascript
// src.js
export function foo(a) {
  setTimeout(function() {
    // do something async
  }, 100);
  return a + 1;
}

export function bar() {
  return foo(1);
}
```

```javascript
// test.js
import './src';

describe('foo', function() {
  it('bar', function() {
    expect(bar()).toEqual(2);
  });
});
```

```text
PhantomJS 2.1.1 (Mac OS X 0.0.0) foo bar FAILED
       Error: Stray "setTimeout" call was executed outside the test constraints (line 68)
       localSetTimeout
       foo
       bar
       loaded@http://localhost:9876/context.js:151:17
PhantomJS 2.1.1 (Mac OS X 0.0.0): Executed 1 of 1 (1 FAILED) (skipped 10) ERROR (0.005 secs / 0.001 secs)
```

## Caveat

Due to the nature of how async javascript execution works, if a timer is set up within another async operation (eg. `Promise`), this library
cannot reliably determine the exact test that triggered the timer.

In this case, the error will be triggered in an subsequent test in which the async operation resolved.

```javascript
// src.js
export function foo(a) {
  window.fetch('some url')
    .then(function() {
      setTimeout(function() {
        // do something async
      }, 100);
    });
  return a + 1;
}
```

```javascript
// test.js
import './src';

describe('foo', function() {
  it('test 1', function() {
    expect(foo(1)).toEqual(2);
  });

  it('test 2', function() {
    expect(2).toEqual(2);
  });
});
```

## License

[Apache-2.0](/LICENSE)
