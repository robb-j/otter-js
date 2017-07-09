const assert = require('assert')
const value = require('../../../../lib/adapters/processors/memory/value')

describe('ValueMemoryProcessor', function() {
  it('should fail if unequal', function() {
    let expr = 9
    assert.equal(value(expr, 7), false)
  })
  it('should pass if equal', function() {
    let expr = 7
    assert.equal(value(expr, 7), true)
  })
})
