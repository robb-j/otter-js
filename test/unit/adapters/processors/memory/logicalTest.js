const expect = require('chai').expect
const logical = require('../../../../../lib/adapters/processors/memory/logical')
const MemoryAdapter = require('../../../../../lib/adapters/MemoryAdapter')

describe('LogicalMemoryProcessor', function() {
  
  let adapter, boundLogical
  
  beforeEach(async function() {
    adapter = new MemoryAdapter()
    boundLogical = logical.bind(adapter)
    await adapter.setup()
  })
  
  it('should default to false', function() {
    let result = logical({}, {})
    expect(result).to.equal(false)
  })
  
  describe('"and" operator', function() {
    it('should succeed if all subExprs succeed', function() {
      let exprA = { type: 'comparison', expr: { '>': 5 } }
      let exprB = { type: 'comparison', expr: { '<': 10 } }
      let expr = { 'and': [ exprA, exprB ] }
      let result = boundLogical(expr, 7)
      expect(result).to.equal(true)
    })
    it('should fail if any subExprs fail', function() {
      let exprA = { type: 'comparison', expr: { '>': 5 } }
      let exprB = { type: 'comparison', expr: { '<': 10 } }
      let expr = { 'and': [ exprA, exprB ] }
      let result = boundLogical(expr, 11)
      expect(result).to.equal(false)
    })
  })
  
  describe('"or" operator', function() {
    it('should succeed if any subExprs succeed', function() {
      let exprA = { type: 'comparison', expr: { '>': 5 } }
      let exprB = { type: 'comparison', expr: { '<': 10 } }
      let expr = { 'or': [ exprA, exprB ] }
      let result = boundLogical(expr, 11)
      expect(result).to.equal(true)
    })
    it('should fail if all subExprs fail', function() {
      let exprA = { type: 'comparison', expr: { '>': 15 } }
      let exprB = { type: 'comparison', expr: { '<': 10 } }
      let expr = { 'or': [ exprA, exprB ] }
      let result = boundLogical(expr, 11)
      expect(result).to.equal(false)
    })
  })
})
