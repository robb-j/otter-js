const expect = require('chai').expect
const compExpr = require('../../../lib/expressions/comparison')
const NumberAttribute = require('../../../lib/attributes/NumberAttribute')
const StringAttribute = require('../../../lib/attributes/StringAttribute')

describe('ComparisonExpression', function() {
  
  let numAttr, strAttr
  beforeEach(async function() {
    numAttr = new NumberAttribute('name', 'ModelName')
    strAttr = new StringAttribute('name', 'ModelName')
  })
  
  it('should fail if not an object', function() {
    let result = compExpr('not an object', numAttr)
    expect(result).to.equal(false)
  })
  it('should fail if not checking numbers', function() {
    let result = compExpr({'<': 5}, strAttr)
    expect(result).to.equal(false)
  })
  it('should fail with no keys', function() {
    let result = compExpr({}, numAttr)
    expect(result).to.equal(false)
  })
  it('should fail with incorect operator', function() {
    let result = compExpr({a: 'b'}, numAttr)
    expect(result).to.equal(false)
  })
  it('should pass with correct operator and type', function() {
    let result = compExpr({'<': 100}, numAttr)
    expect(result).to.equal(true)
  })
})
