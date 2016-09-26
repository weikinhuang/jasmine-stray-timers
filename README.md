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

If test code executed a timer and didn't wait for it to resolve before ending the test. It will throw an error.

Due to the nature of how async timer execution works, if a timer is set up within an `Promise`, this
cannot reliably determine the exact test that triggered the timer.

```javascript
// src.js
export function foo(a) {
  setTimeout(function() {}, 100);
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

## License

[Apache-2.0](/LICENSE)
