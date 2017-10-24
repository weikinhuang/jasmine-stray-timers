/* eslint-env jasmine */

import {
  install,
  uninstall,
  detectStrayTimers,
} from './timers';

import { overrideJasmineClock } from './jasmineClock';

// jasmine clock relies on having access to the original timer functions
jasmine.clock = overrideJasmineClock(jasmine.clock);

// install timers
beforeAll(install);

afterAll(uninstall);

beforeEach(detectStrayTimers);

afterEach(detectStrayTimers);
