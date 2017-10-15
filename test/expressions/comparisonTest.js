const expect = require('chai').expect
const notExpr = require('../../lib/expressions/comparison')

describe('ComparisonExpression', function() {
  it('should fail if not an object', function() {
    let value = notExpr('not an object', 'number')
    expect(value).to.equal(false)
  })
  it('should fail if not checking numbers', function() {
    let value = notExpr({'<': 5}, 'string')
    expect(value).to.equal(false)
  })
  it('should fail with no keys', function() {
    let value = notExpr({}, 'number')
    expect(value).to.equal(false)
  })
  it('should fail with incorect operator', function() {
    let value = notExpr({a: 'b'}, 'string')
    expect(value).to.equal(false)
  })
  it('should fail with incorrect comparison type', function() {
    let value = notExpr({'<': 7}, 'string')
    expect(value).to.equal(false)
  })
  it('should pass with correct operator and type', function() {
    let value = notExpr({'<': 100}, 'number')
    expect(value).to.equal(true)
  })
})
