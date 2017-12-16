const expect = require('chai').expect
const MemoryAdapter = require('../../../lib/adapters/MemoryAdapter')
const Otter = require('../../../lib')

const { makeModel, asyncError } = require('../../utils')


describe('MemoryAdapter', function() {
  
  let testAdapter, TestModel
  
  beforeEach(async function() {
    testAdapter = new MemoryAdapter()
    TestModel = makeModel('TestModel', { name: String })
    
    await Otter.extend().use(o => {
      o.addAdapter(testAdapter)
      o.addModel(TestModel)
    }).start()
  })
  
  describe('#setup', function() {
    it('should create a store', async function() {
      expect(testAdapter.store).to.exist
    })
    it('should create store keys for each model', async function() {
      expect(testAdapter.store.TestModel).to.exist
    })
    it('should create id counts', async function() {
      expect(testAdapter.counters).to.exist
    })
    it('should add default processors', function() {
      let processorKeys = Object.keys(testAdapter.processors)
      expect(processorKeys).to.have.lengthOf.greaterThan(0)
    })
  })
  
  describe('#teardown', function() {
    it('should destroy the store', async function() {
      await testAdapter.teardown()
      expect(testAdapter.store).to.equal(null)
    })
  })
  
  describe('#supportsAttribute', function() {
    it('should support all attributes', function() {
      expect(testAdapter.supportsAttribute(null)).to.equal(true)
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
      let q = new Otter.Types.Query(TestModel)
      testAdapter.validateModelQuery(q)
      let res = testAdapter.processQuery(q)
      expect(res).to.have.lengthOf(2)
    })
    it('should match records', function() {
      let q = new Otter.Types.Query(TestModel, { name: 'Bob' })
      testAdapter.validateModelQuery(q)
      let res = testAdapter.processQuery(q)
      expect(res[0]).to.have.property('name', 'Bob')
    })
    it('should cut of after limit', function() {
      let q = new Otter.Types.Query(TestModel, {}, { limit: 1 })
      let res = testAdapter.processQuery(q)
      expect(res).to.have.lengthOf(1)
    })
  })
  
  describe('#evaluateExpr', function() {
    
    it('should throw for invalid expressions', async function() {
      let expr = { type: 'invalid', expr: {} }
      let error = await asyncError(() => testAdapter.evaluateExpr(expr, {}))
      expect(error.code).to.equal('adapter.unsupportedExpr')
    })
    it('should process the expression', function() {
      let expr = { type: 'equality', expr: 7 }
      let value = testAdapter.evaluateExpr(expr, 7)
      expect(value).equal(true)
    })
  })
  
  describe('#checkModelName', function() {
    it('should throw an error for an unknown model', async function() {
      let error = await asyncError(() => {
        return testAdapter.checkModelName('InvalidModel', {})
      })
      expect(error).matches(/unknown Model/)
    })
    it('should not throw an error for a known model', async function() {
      await testAdapter.checkModelName('TestModel', {})
    })
  })
  
  describe('#create', function() {
    it('should create a new model', async function() {
      let values = [
        { name: 'Geoff' }
      ]
      await testAdapter.create('TestModel', values)
      expect(testAdapter.store.TestModel).to.have.property('1')
    })
    it('should return the values of the new models', async function() {
      let records = await testAdapter.create('TestModel', [
        { name: 'Geoff' },
        { name: 'Tom' },
        { name: 'Bob' }
      ])
      
      expect(records).to.have.lengthOf(3)
      expect(records[0]).to.have.property('name', 'Geoff')
    })
    it('should add created and updated dates', async function() {
      let values = [ { name: 'Geoff' } ]
      let records = await testAdapter.create('TestModel', values)
      
      expect(records[0]).to.have.property('createdAt')
      expect(records[0]).to.have.property('updatedAt')
    })
    it('should fail if an unknown Models', async function() {
      let error = await asyncError(() => {
        return testAdapter.create('AnotherModel', [ { name: 'Geoff' } ])
      })
      expect(error).matches(/unknown Model/)
    })
    it('should fail for unknown values', async function() {
      let error = await asyncError(() => {
        return testAdapter.create('TestModel', [ { age: 7 } ])
      })
      expect(error).matches(/unknown Attribute/)
    })
    it('should fail for unknown models', async function() {
      let error = await asyncError(() => {
        return testAdapter.create('InvalidModel')
      })
      expect(error).matches(/unknown Model/)
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
      let error = await asyncError(() => {
        return testAdapter.find('InvalidModel', {})
      })
      expect(error).matches(/Cannot query unknown Model/)
    })
    it('should process a raw query', async function() {
      let res = await testAdapter.find('TestModel', { name: 'Terrance' })
      expect(res).to.be.lengthOf(1)
    })
    it('should return all values if no query is passed', async function() {
      let res = await testAdapter.find('TestModel')
      expect(res).to.be.lengthOf(3)
    })
    it('should fail for invalid queries', async function() {
      let error = await asyncError(() => {
        return testAdapter.find('TestModel', { age: 7 })
      })
      expect(error).matches(/unknown Attribute/)
    })
  })
  
  describe('#update', function() {
    
    let models
    beforeEach(async function() {
      models = await testAdapter.create('TestModel', [
        { name: 'Geoff' },
        { name: 'Terrance' }
      ])
    })
    
    it('should fail if the model is not registered', async function() {
      let error = await asyncError(() => {
        return testAdapter.update('InvalidModel', {})
      })
      expect(error).matches(/Cannot query unknown Model/)
    })
    it('should update values which match the query', async function() {
      await testAdapter.update('TestModel', '1', { name: 'Terry' })
      let models = await testAdapter.find('TestModel', '1')
      expect(models[0]).to.have.property('name').that.equals('Terry')
    })
    it('should return updated record count', async function() {
      let n = await testAdapter.update('TestModel', '1', { name: 'Terry' })
      expect(n).to.equal(1)
    })
    it('should fail for unknown queries', async function() {
      let error = await asyncError(() => {
        return testAdapter.update('TestModel', { age: 7 }, { name: 'Terry' })
      })
      expect(error).matches(/unknown Attribute/)
    })
    it('should fail for unknown values', async function() {
      let error = await asyncError(() => {
        return testAdapter.update('TestModel', '1', { age: 7 })
      })
      expect(error).matches(/unknown Attribute/)
    })
    it('should update the updatedAt', async function() {
      let before = models[0].updatedAt
      await new Promise(resolve => setTimeout(resolve, 10))
      await testAdapter.update('TestModel', models[0].id, { name: 'Tim' })
      let after = (await testAdapter.find('TestModel', models[0].id))[0].updatedAt
      
      expect(after).to.not.deep.equal(before)
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
      let error = await asyncError(() => {
        return testAdapter.destroy('InvalidModel', {})
      })
      expect(error).matches(/unknown Model/)
    })
    it('should remove the value', async function() {
      await testAdapter.destroy('TestModel', '1')
      let models = await testAdapter.find('TestModel', {})
      expect(models).to.have.lengthOf(1)
    })
    it('should return the number of models deleted', async function() {
      let count = await testAdapter.destroy('TestModel')
      expect(count).to.equal(2)
    })
    it('should fail for unknown queries', async function() {
      let error = await asyncError(() => {
        return testAdapter.destroy('TestModel', { age: 7 })
      })
      expect(error).matches(/unknown Attribute/)
    })
  })
  
})
