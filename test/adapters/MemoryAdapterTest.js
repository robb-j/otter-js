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
    
    it('should return the values of the new models', async function() {
      
      let values = [
        { name: 'Geoff' },
        { name: 'Tom' },
        { name: 'Bob' }
      ]
      
      let records = await testAdapter.create('TestModel', values)
      
      assert.equal(records.length, 3)
      assert.equal(records[0].name, 'Geoff')
    })
    
    it('should add created and updated dates', async function() {
      
      let values = [ { name: 'Geoff' } ]
      
      let records = await testAdapter.create('TestModel', values)
      
      assert(records[0].createdAt)
      assert(records[0].updatedAt)
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
  
  
  describe('#processComparison', function() {
    
    it('should processes equality', function() {
      let matched = testAdapter.processComparison('a', { a: 7 }, 7)
      assert.equal(matched, true)
    })
    
    it('should not ignore type', function() {
      let matched = testAdapter.processComparison('a', { a: 7 }, '7')
      assert.equal(matched, false)
    })
    
    it('should not ignore type', function() {
      let matched = testAdapter.processComparison('a', { a: 7 }, '7')
      assert.equal(matched, false)
    })
    
    it('should perform set includes', function() {
      let matched = testAdapter.processComparison('a', {a: 7}, [7, 1])
      assert.equal(matched, true)
    })
  })
  
  
  describe('#processQuery', function() {
    
    beforeEach(async function() {
      await testAdapter.create('TestModel', [
        { name: 'Geoff' },
        { name: 'Bob' }
      ])
    })
    
    it('should match all by default', function() {
      let q = new Otter.Types.Query('TestModel')
      let res = testAdapter.processQuery(q)
      assert.equal(res.length, 2)
    })
    
    it('should match records', function() {
      let q = new Otter.Types.Query('TestModel', { name: 'Bob' })
      let res = testAdapter.processQuery(q)
      assert.equal(res[0].name, 'Bob')
    })
    
    it('should cut of after limit', function() {
      let q = new Otter.Types.Query('TestModel', { limit: 1 })
      let res = testAdapter.processQuery(q)
      assert.equal(res.length, 1)
    })
  })
  
  
  describe('#checkModelName', function() {
    
    it('should throw an error for an unknown model', async function() {
      let error = await assExt.getAsyncError(async () => {
        await testAdapter.checkModelName('InvalidModel', {})
      })
      assert.equal(/Cannot query unknown Model/.test(error.message), true)
    })
    
    it('should not throw an error for a known model', async function() {
      let error = await assExt.getAsyncError(async () => {
        await testAdapter.checkModelName('TestModel', {})
      })
      assert.equal(error, null)
    })
  })
  
  
  describe('#find', function() {
    
    beforeEach(async function() {
      await testAdapter.create('TestModel', [
        { name: 'Tom' },
        { name: 'Geoff' },
        { name: 'Terrance' }
      ])
    })
    
    it('should fail if the model does not exist', async function() {
      assert(await assExt.getAsyncError(async () => {
        await testAdapter.find('InvalidModel', {})
      }))
    })
    
    it('should process a raw query', async function() {
      let res = await testAdapter.find('TestModel', { name: 'Terrance' })
      assert.equal(res.length, 1)
    })
    
    it('should return all values if no query is passed', async function() {
      let res = await testAdapter.find('TestModel')
      assert.equal(res.length, 3)
    })
  })
  
  
  describe('#update', function() {
    
    beforeEach(async function() {
      await testAdapter.create('TestModel', [
        { name: 'Geoff' },
        { name: 'Terrance' }
      ])
    })
    
    it('should fail if the model does not exist', async function() {
      assert(await assExt.getAsyncError(async () => {
        await testAdapter.update('InvalidModel', {})
      }))
    })
    
    it('should update values which match the query', async function() {
      await testAdapter.update('TestModel', 1, { name: 'Terry' })
      let models = await testAdapter.find('TestModel', 1)
      assert.equal(models[0].name, 'Terry')
    })
    
    it('should return updated values', async function() {
      let models = await testAdapter.update('TestModel', 1, { name: 'Terry' })
      assert.equal(models.length, 1)
    })
  })
  
  
  describe('#update', function() {
    
    beforeEach(async function() {
      await testAdapter.create('TestModel', [
        { name: 'Geoff' },
        { name: 'Terrance' }
      ])
    })
    
    it('should fail if the model does not exist', async function() {
      assert(await assExt.getAsyncError(async () => {
        await testAdapter.destroy('InvalidModel', {})
      }))
    })
    
    it('should remove the value', async function() {
      await testAdapter.destroy('TestModel', 0)
      let models = await testAdapter.find('TestModel', {})
      assert.equal(models.length, 1)
    })
  })
  
})
