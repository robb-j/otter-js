const assert = require('assert')
const not = require('../../../../lib/adapters/processors/memory/not')

describe('NotMemoryProcessor', function() {
  it('should fail if equal', function() {
    let expr = { '!': 7 }
    let value = 7
    assert.equal(not(expr, value), false)
  })
  it('should pass if not equal', function() {
    let expr = { '!': 7 }
    let value = 9
    assert.equal(not(expr, value), true)
  })
})
