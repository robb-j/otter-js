const expect = require('chai').expect
const inListExpr = require('../../../lib/expressions/inList')
const StringAttribute = require('../../../lib/attributes/StringAttribute')

describe('InListExpression', function() {
  
  let attr
  beforeEach(async function() {
    attr = new StringAttribute('name', 'ModelName')
  })
  
  it('should fail if not an array', function() {
    let result = inListExpr('not an array', attr)
    expect(result).to.equal(false)
  })
  
  it('should fail with incorrect typed array', function() {
    let result = inListExpr(['a', 7], attr)
    expect(result).to.equal(false)
  })
  
  it('should pass with correct array', function() {
    let result = inListExpr(['a', 'b', 'c'], attr)
    expect(result).to.equal(true)
  })
})
