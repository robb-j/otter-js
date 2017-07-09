const assert = require('assert')
const inList = require('../../../../lib/adapters/processors/memory/inList')

describe('InListMemoryProcessor', function() {
  it('should fail if not in list', function() {
    let expr = [ 1, 2, 3, 7 ]
    let value = 5
    assert.equal(inList(expr, value), false)
  })
  it('should pass if in list', function() {
    let expr = [ 1, 3, 7 ]
    let value = 7
    assert.equal(inList(expr, value), true)
  })
})
