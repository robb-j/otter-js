const expect = require('chai').expect
const notExpr = require('../../lib/expressions/inequality')

describe('InequalityExpression', function() {
  it('should fail if not an object', function() {
    let value = notExpr('not an object', 'string')
    expect(value).to.equal(false)
  })
  it('should fail with no keys', function() {
    let value = notExpr({}, 'string')
    expect(value).to.equal(false)
  })
  it('should fail without "!" key', function() {
    let value = notExpr({a: 'b'}, 'string')
    expect(value).to.equal(false)
  })
  it('should fail with incorrect comparison type', function() {
    let value = notExpr({'!': 7}, 'string')
    expect(value).to.equal(false)
  })
  it('should pass with "!" and a string', function() {
    let value = notExpr({'!': 'geoff'}, 'string')
    expect(value).to.equal(true)
  })
})
