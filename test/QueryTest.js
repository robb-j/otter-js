const assert = require('assert')
const Otter = require('../lib/Otter')
const { Query } = Otter.Types

describe('Query', function() {
  
  let TestOtter, TestModel
  
  beforeEach(async function() {
    TestOtter = Otter.extend()
    TestModel = class extends Otter.Types.Model {
      static attributes() { return { name: String } }
    }
    TestOtter.use(Otter.Plugins.MemoryConnection)
    TestOtter.addModel(TestModel)
    await TestOtter.start()
  })
  
  
  describe('#constructor', function() {
    
    it('should set the modelName', function() {
      let q = new Query('Model', {})
      assert.equal(q.modelName, 'Model')
    })
    
    it('should initialize properties', function() {
      let q = new Query('Model', {})
      assert.deepEqual(q.where, {})
      assert.equal(q.sort, null)
      assert.equal(q.limit, null)
      assert.equal(q.pluck, null)
    })
    
    it('should have a default value for where', function() {
      let q = new Query('Model')
      assert(q.where)
    })
    
    it('should construct where using string id shorthand', function() {
      let q = new Query('Model', '7')
      assert.equal(q.where.id, '7')
    })
    
    it('should construct where using number id shorthand', function() {
      let q = new Query('Model', 7)
      assert.equal(q.where.id, 7)
    })
    
    it('should construct where using array of ids', function() {
      let q = new Query('Model', ['1', '2'])
      assert.deepEqual(q.where.id, ['1', '2'])
    })
    
    it('should construct where using where shorthand', function() {
      let q = new Query('Model', { a: 100 })
      assert.equal(q.where.a, 100)
    })
    
    it('should deconstruct reserved keys', function() {
      let q = new Query('Model', {
        where: 'a', sort: 'b', limit: 'c', pluck: 'd'
      })
      assert.equal(q.where, 'a')
      assert.equal(q.sort, 'b')
      assert.equal(q.limit, 'c')
      assert.equal(q.pluck, 'd')
    })
    
    it('should fail array shorthand is not strings', function() {
      assert.throws(() => {
        let q = new Query('ModelName', [ '1', 2 ])
      }, /must be strings/)
    })
  })
  
  
  describe('#validateOn', function() {
    
    it('should pass if all attributes are valid', function() {
      let q = new Query('TestModel', { name: {'!': 'Geoff'} })
      q.validateOn(TestModel.schema)
    })
    
    it('should processes the query', function() {
      let q = new Query('TestModel', { name: { '!': 'Geoff' } })
      q.validateOn(TestModel.schema)
      assert(q.processed)
      assert(q.processed.name)
    })
    
    it('should fail if unknow expression', function() {
      let q = new Query('TestModel', { name: { 'random': 'Geoff' } })
      assert.throws(() => {
        q.validateOn(TestModel.schema)
      }, /Unrecognised query expression/)
    })
  })
  
  
  describe('#validateExpr', function() {
    
    it('should store the type', function() {
      let expr = { '!': 'Geoff' }
      let q = new Query('TestModel', { name: expr })
      q.validateOn(TestModel.schema)
      assert.equal(q.processed.name.type, 'not')
      assert.deepEqual(q.processed.name.expr, expr)
    })
  })
})
