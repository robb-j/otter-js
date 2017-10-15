const expect = require('chai').expect
const inListExpr = require('../../lib/expressions/inList')

describe('InListExpression', function() {
  
  it('should fail if not an array', function() {
    let value = inListExpr('not an array', 'string')
    expect(value).to.equal(false)
  })
  
  it('should fail with incorrect typed array', function() {
    let value = inListExpr(['a', 7], 'string')
    expect(value).to.equal(false)
  })
  
  it('should pass with correct array', function() {
    let value = inListExpr(['a', 'b', 'c'], 'string')
    expect(value).to.equal(true)
  })
})
