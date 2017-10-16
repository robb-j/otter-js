const expect = require('chai').expect
const logicalExpr = require('../../../lib/expressions/logical')

describe('LogicalExpression', function() {
  it('should fail if not an object', function() {
    let value = logicalExpr('not an object', 'string')
    expect(value).to.equal(false)
  })
  it('should fail if not 1 key-pair', function() {
    let value = logicalExpr({}, 'string')
    expect(value).to.equal(false)
  })
  it('should fail with inocrrect operators', function() {
    let value = logicalExpr({a: 'b'}, 'string')
    expect(value).to.equal(false)
  })
  it('should fail if nested expressions fail', function() {
    let that = { validateExpr() { return null } }
    let expr = { 'and': [ 7 ] }
    let value = logicalExpr.bind(that)(expr, 'string')
    expect(value).to.equal(false)
  })
  it('should pass with correct operator and nested', function() {
    let that = { validateExpr() { return {} } }
    let expr = { 'and': [ 7, 14 ] }
    let value = logicalExpr.bind(that)(expr, 'string')
    expect(value).to.equal(true)
  })
})
