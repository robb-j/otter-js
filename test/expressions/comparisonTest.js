const assert = require('assert')
const notExpr = require('../../lib/expressions/comparison')

describe('ComparisonExpression', function() {
  it('should fail if not an object', function() {
    let value = notExpr('not an object', 'string')
    assert.equal(value, false)
  })
  it('should fail with no keys', function() {
    let value = notExpr({}, 'string')
    assert.equal(value, false)
  })
  it('should fail with incorect operator', function() {
    let value = notExpr({a: 'b'}, 'string')
    assert.equal(value, false)
  })
  it('should fail with incorrect comparison type', function() {
    let value = notExpr({'<': 7}, 'string')
    assert.equal(value, false)
  })
  it('should pass with correct operator and type', function() {
    let value = notExpr({'<': 100}, 'number')
    assert.equal(value, true)
  })
})
