const expect = require('chai').expect
const notExpr = require('../../../lib/expressions/inequality')
const StringAttribute = require('../../../lib/attributes/StringAttribute')

describe('InequalityExpression', function() {
  
  let attr
  beforeEach(async function() {
    attr = new StringAttribute('name', 'ModelName')
  })
  
  it('should fail if not an object', function() {
    let result = notExpr('not an object', attr)
    expect(result).to.equal(false)
  })
  it('should fail with no keys', function() {
    let result = notExpr({}, attr)
    expect(result).to.equal(false)
  })
  it('should fail without "!" key', function() {
    let result = notExpr({a: 'b'}, attr)
    expect(result).to.equal(false)
  })
  it('should fail with incorrect comparison type', function() {
    let result = notExpr({'!': 7}, attr)
    expect(result).to.equal(false)
  })
  it('should validate a not expression', function() {
    let result = notExpr({'!': 'geoff'}, attr)
    expect(result).to.equal(true)
  })
})
