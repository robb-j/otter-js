const expect = require('chai').expect
const logicalExpr = require('../../../lib/expressions/logical')
const NumberAttribute = require('../../../lib/attributes/NumberAttribute')

describe('LogicalExpression', function() {
  
  let attr
  beforeEach(async function() {
    attr = new NumberAttribute('name', 'ModelName')
  })
  
  it('should fail if not an object', function() {
    let result = logicalExpr('not an object', attr)
    expect(result).to.equal(false)
  })
  it('should fail if not 1 key-pair', function() {
    let result = logicalExpr({}, attr)
    expect(result).to.equal(false)
  })
  it('should fail with inocrrect operators', function() {
    let result = logicalExpr({a: 'b'}, attr)
    expect(result).to.equal(false)
  })
  it('should fail if nested expressions fail', function() {
    let that = { validateExpr() { return null } }
    let expr = { 'and': [ 7 ] }
    let result = logicalExpr.bind(that)(expr, attr)
    expect(result).to.equal(false)
  })
  it('should pass with correct operator and nested', function() {
    let that = { validateExpr() { return {} } }
    let expr = { 'and': [ 7, 14 ] }
    let result = logicalExpr.bind(that)(expr, attr)
    expect(result).to.equal(true)
  })
})
