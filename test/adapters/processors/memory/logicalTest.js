const assert = require('assert')
const logical = require('../../../../lib/adapters/processors/memory/logical')
const MemoryAdapter = require('../../../../lib/adapters/MemoryAdapter')

describe('LogicalMemoryProcessor', function() {
  
  let adapter
  
  beforeEach(async function() {
    adapter = new MemoryAdapter()
    await adapter.setup()
  })
  
  it('should default to false', function() {
    assert.equal(logical({}, {}), false)
  })
  
  describe('"and" operator', function() {
    it('should succeed if all subExprs succeed', function() {
      let exprA = { type: 'comparison', expr: { '>': 5 } }
      let exprB = { type: 'comparison', expr: { '<': 10 } }
      let expr = { 'and': [ exprA, exprB ] }
      let value = 7
      assert.equal(logical.bind(adapter)(expr, value), true)
    })
    it('should fail if any subExprs fail', function() {
      let exprA = { type: 'comparison', expr: { '>': 5 } }
      let exprB = { type: 'comparison', expr: { '<': 10 } }
      let expr = { 'and': [ exprA, exprB ] }
      let value = 11
      assert.equal(logical.bind(adapter)(expr, value), false)
    })
  })
  
  describe('"or" operator', function() {
    it('should succeed if any subExprs succeed', function() {
      let exprA = { type: 'comparison', expr: { '>': 5 } }
      let exprB = { type: 'comparison', expr: { '<': 10 } }
      let expr = { 'or': [ exprA, exprB ] }
      let value = 11
      assert.equal(logical.bind(adapter)(expr, value), true)
    })
    it('should fail if all subExprs fail', function() {
      let exprA = { type: 'comparison', expr: { '>': 15 } }
      let exprB = { type: 'comparison', expr: { '<': 10 } }
      let expr = { 'or': [ exprA, exprB ] }
      let value = 11
      assert.equal(logical.bind(adapter)(expr, value), false)
    })
  })
})
