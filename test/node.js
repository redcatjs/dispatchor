/* eslint-env mocha */

import * as dispatchorAPI from '../src/index'
import test from './test'
describe('Dispatchor', function () {
  test.bind(this)(dispatchorAPI)
})
