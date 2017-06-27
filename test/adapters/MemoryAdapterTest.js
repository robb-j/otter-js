const assert = require('assert')
const assExt = require('../assertExtension')
const MemoryAdapter = require('../../lib/adapters/MemoryAdapter')
const Otter = require('../../lib/Otter')

class TestModel extends Otter.Types.Model {
  static attributes() { return { name: String } }
}

describe('MemoryAdapter', function() {
  
  let testAdapter
  
  beforeEach(async function() {
    testAdapter = new MemoryAdapter()
    testAdapter._models = { TestModel }
    await testAdapter.setup(null)
  })
  
  describe('#setup', function() {
    
    it('should create a store', async function() {
      assert(testAdapter.store)
    })
    
    it('should create store keys for each model', async function() {
      
      assert(testAdapter.store.TestModel)
    })
    
    it('should create id counts', async function() {
      assert(testAdapter.counters)
    })
  })
  
  describe('#teardown', function() {
    it('should destroy the store', async function() {
      await testAdapter.teardown()
      assert.equal(testAdapter.store, null)
    })
  })
  
  describe('#supportsAttribute', function() {
    it('should support all attributes', function() {
      assert(testAdapter.supportsAttribute(null))
    })
  })
  
  
  
  
  describe('#create', function() {
    
    it('should create a new model', async function() {
      
      let values = [
        { name: 'Geoff' }
      ]
      
      await testAdapter.create('TestModel', values)
      
      assert(testAdapter.store['TestModel'][0])
    })
    
    it('should return the id of the new models', async function() {
      
      let values = [
        { name: 'Geoff' },
        { name: 'Tom' },
        { name: 'Bob' }
      ]
      
      let ids = await testAdapter.create('TestModel', values)
      
      assert.deepEqual(ids, [0, 1, 2])
    })
    
    it('should nest values using dot notation', async function() {
      
      let values = {
        createdAt: new Date(),
        updatedAt: new Date(),
        name: 'Geoff',
        clothes: { torso: 'Red Shirt', legs: 'Jeans' }
      }
      
      await testAdapter.create('TestModel', [values])
      
      let record = testAdapter.store['TestModel'][0]
      
      assert.equal(record['clothes.torso'], 'Red Shirt')
      assert.equal(record['clothes.legs'], 'Jeans')
    })
    
    it('should fail if an unknown type is passed', async function() {
      
      let error = await assExt.getAsyncError(async () => {
        await testAdapter.create('AnotherModel')
      })
      
      assert(/Cannot create unknown Model/.test(error.message))
    })
  })
  
})
