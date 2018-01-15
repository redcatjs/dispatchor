/* eslint-env mocha */

import * as dispatchorAPI from '../browser'
import test from './test'
describe('Dispatchor', function () {
  test.bind(this)(dispatchorAPI)
})
