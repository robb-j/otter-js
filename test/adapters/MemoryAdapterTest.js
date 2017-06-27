const assert = require('assert')
const MemoryAdapter = require('../../lib/adapters/MemoryAdapter')

describe('MemoryAdapter', function() {
  
  let testAdapter
  
  beforeEach(function() {
    testAdapter = new MemoryAdapter()
  })
  
  describe('#setup', function() {
    it('should create a store', function() {
      testAdapter.setup()
      assert(testAdapter.store)
    })
  })
  
  describe('#teardown', function() {
    it('should destroy the store', function() {
      testAdapter.setup()
      testAdapter.teardown()
      assert.equal(testAdapter.store, null)
    })
  })
  
  describe('#supportsAttribute', function() {
    it('should support all attributes', function() {
      assert(testAdapter.supportsAttribute())
    })
  })
  
})
