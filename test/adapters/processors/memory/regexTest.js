const assert = require('assert')
const regex = require('../../../../lib/adapters/processors/memory/regex')

describe('RegexMemoryProcessor', function() {
  it('should fail if regex is false', function() {
    let expr = /test/
    let value = 'Test'
    assert.equal(regex(expr, value), false)
  })
  it('should pass if regex is true', function() {
    let expr = /test/i
    let value = 'Test'
    assert.equal(regex(expr, value), true)
  })
})
