const assert = require('assert')
const inListExpr = require('../../lib/expressions/inList')

describe('InListExpression', function() {
  
  it('should fail if not an array', function() {
    let value = inListExpr('not an array', 'string')
    assert.equal(value, false)
  })
  
  it('should fail with incorrect typed array', function() {
    let value = inListExpr(['a', 7], 'string')
    assert.equal(value, false)
  })
  
  it('should pass with correct array', function() {
    let value = inListExpr(['a', 'b', 'c'], 'string')
    assert.equal(value, true)
  })
})
