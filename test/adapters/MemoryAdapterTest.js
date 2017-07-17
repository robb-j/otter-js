const assert = require('assert')
const assExt = require('../assertExtension')
const MemoryAdapter = require('../../lib/adapters/MemoryAdapter')
const Otter = require('../../lib/Otter')

class TestModel extends Otter.Types.Model {
  static attributes() { return { name: String } }
}

describe('MemoryAdapter', function() {
  
  let testAdapter, TestOtter
  
  beforeEach(async function() {
    testAdapter = new MemoryAdapter()
    
    TestOtter = await Otter.extend().use(o => {
      o.addAdapter(testAdapter)
      o.addModel(TestModel)
    }).start()
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
    it('should add default processors', function() {
      assert(Object.keys(testAdapter.processors).length > 0)
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
  
  describe('#processQuery', function() {
    
    beforeEach(async function() {
      await testAdapter.create('TestModel', [
        { name: 'Geoff' },
        { name: 'Bob' }
      ])
    })
    
    it('should match all by default', function() {
      let q = new Otter.Types.Query('TestModel')
      testAdapter.validateModelQuery(q)
      let res = testAdapter.processQuery(q)
      assert.equal(res.length, 2)
    })
    it('should match records', function() {
      let q = new Otter.Types.Query('TestModel', { name: 'Bob' })
      testAdapter.validateModelQuery(q)
      let res = testAdapter.processQuery(q)
      assert.equal(res[0].name, 'Bob')
    })
    it('should cut of after limit', function() {
      let q = new Otter.Types.Query('TestModel', {}, { limit: 1 })
      let res = testAdapter.processQuery(q)
      assert.equal(res.length, 1)
    })
  })
  
  describe('#evaluateExpr', function() {
    
    it('should throw for invalid expressions', function() {
      assert.throws(() => {
        let expr = { type: 'invalid', expr: {} }
        testAdapter.evaluateExpr(expr, {})
      }, /Unsupported expression/)
    })
    it('should process the expression', function() {
      let expr = { type: 'value', expr: 7 }
      let val = testAdapter.evaluateExpr(expr, 7)
      assert.equal(val, true)
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
  
  describe('#create', function() {
    it('should create a new model', async function() {
      
      let values = [
        { name: 'Geoff' }
      ]
      
      await testAdapter.create('TestModel', values)
      
      assert(testAdapter.store['TestModel'][1])
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
    it('should fail if an unknown Models', async function() {
      
      let error = await assExt.getAsyncError(() => {
        return testAdapter.create('AnotherModel', [ { name: 'Geoff' } ])
      })
      
      assert(error)
      assert(/unknown Model/.test(error.message))
    })
    it('should fail for unknown values', async function() {
      
      let error = await assExt.getAsyncError(() => {
        return testAdapter.create('TestModel', [ { age: 7 } ])
      })
      
      assert(error)
      assExt.assertRegex(/unknown Attribute/, error.message)
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
    
    it('should fail if the model is not registered', async function() {
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
    it('should fail for invalid queries', async function() {
      let error = await assExt.getAsyncError(() => {
        return testAdapter.find('TestModel', { age: 7 })
      })
      assert(error)
      assExt.assertRegex(/unknown Attribute/, error.message)
    })
  })
  
  describe('#update', function() {
    
    beforeEach(async function() {
      await testAdapter.create('TestModel', [
        { name: 'Geoff' },
        { name: 'Terrance' }
      ])
    })
    
    it('should fail if the model is not registered', async function() {
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
    it('should fail for unknown queries', async function() {
      let error = await assExt.getAsyncError(() => {
        return testAdapter.update('TestModel', { age: 7 }, { name: 'Terry' })
      })
      assert(error)
      assExt.assertRegex(/unknown Attribute/, error.message)
    })
    it('should fail for unknown values', async function() {
      let error = await assExt.getAsyncError(() => {
        return testAdapter.update('TestModel', 1, { age: 7 })
      })
      assert(error)
      assExt.assertRegex(/unknown Attribute/, error.message)
    })
  })
  
  describe('#destroy', function() {
    
    beforeEach(async function() {
      await testAdapter.create('TestModel', [
        { name: 'Geoff' },
        { name: 'Terrance' }
      ])
    })
    
    it('should fail if the model is not registered', async function() {
      assert(await assExt.getAsyncError(async () => {
        await testAdapter.destroy('InvalidModel', {})
      }))
    })
    it('should remove the value', async function() {
      await testAdapter.destroy('TestModel', 1)
      let models = await testAdapter.find('TestModel', {})
      assert.equal(models.length, 1)
    })
    it('should return the number of models deleted', async function() {
      let count = await testAdapter.destroy('TestModel')
      assert.equal(count, 2)
    })
    it('should fail for unknown queries', async function() {
      let error = await assExt.getAsyncError(() => {
        return testAdapter.destroy('TestModel', { age: 7 })
      })
      assert(error)
      assExt.assertRegex(/unknown Attribute/, error.message)
    })
  })
  
})
