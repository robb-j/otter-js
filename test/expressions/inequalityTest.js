const expect = require('chai').expect
const assert = require('assert')
const notExpr = require('../../lib/expressions/inequality')

describe('InequalityExpression', function() {
  it('should fail if not an object', function() {
    let value = notExpr('not an object', 'string')
    assert.equal(value, false)
  })
  it('should fail with no keys', function() {
    let value = notExpr({}, 'string')
    assert.equal(value, false)
  })
  it('should fail without "!" key', function() {
    let value = notExpr({a: 'b'}, 'string')
    assert.equal(value, false)
  })
  it('should fail with incorrect comparison type', function() {
    let value = notExpr({'!': 7}, 'string')
    assert.equal(value, false)
  })
  it('should pass with "!" and a string', function() {
    let value = notExpr({'!': 'geoff'}, 'string')
    assert.equal(value, true)
  })
})
