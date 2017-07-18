const assert = require('assert')
const equalProc = require('../../../../lib/adapters/processors/memory/equality')

describe('EqualityMemoryProcessor', function() {
  it('should fail if unequal', function() {
    let expr = 9
    assert.equal(equalProc(expr, 7), false)
  })
  it('should pass if equal', function() {
    let expr = 7
    assert.equal(equalProc(expr, 7), true)
  })
})
