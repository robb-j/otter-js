const assert = require('assert')
const assExt = require('./assertExtension')
const Adapter = require('../lib/Adapter')
const Otter = require('../lib/Otter')


describe('Adapter', function() {
  
  let testAdapter
  
  beforeEach(function() {
    testAdapter = new Adapter()
  })
  
  describe('#constructor', function() {
    
    it('should set default name', function() {
      assert.equal(testAdapter.name, 'default')
    })
    
    it('should use the name in options', function() {
      testAdapter = new Adapter({ name: 'fancyAdapter' })
      assert.equal(testAdapter.name, 'fancyAdapter')
    })
    
    it('should store the options', function() {
      let options = {}
      testAdapter = new Adapter(options)
      assert.equal(testAdapter.options, options)
    })
    
    it('should setup a store for models', function() {
      assert(testAdapter.models)
    })
    
    it('should setup a store for processors', function() {
      assert(testAdapter.processors)
    })
    
    it('should setup processor stores for default types', function() {
      assert(testAdapter.processors.where)
      assert(testAdapter.processors.sort)
      assert(testAdapter.processors.create)
      assert(testAdapter.processors.limit)
      assert(testAdapter.processors.pluck)
    })
  })
  
  
  describe('#supportsAttribute', function() {
    
    it('should default to false', function() {
      assert(!testAdapter.supportsAttribute('String'))
    })
  })
  
  
  describe('#setup', function() {
    
    it('should return a promise', function() {
      assExt.assertClass(testAdapter.setup(), 'Promise')
    })
  })
  
  
  describe('#teardown', function() {
    
    it('should return a promise', function() {
      let testAdapter = new Adapter()
      assExt.assertClass(testAdapter.teardown(), 'Promise')
    })
  })
  
  
  describe('#addProcessor', function() {
    
    it('should store the processor under the type', function() {
      testAdapter.addProcessor('where', (k, a, v) => { })
      assert(testAdapter.processors.where)
      assert.equal(testAdapter.processors.where.length, 1)
    })
    
    it('should fail if not a function', function() {
      assert.throws(() => {
        testAdapter.addProcessor('where', 'not a function')
      }, /Invalid Processor/)
    })
    
    it('should add new keys if not present', function() {
      testAdapter.addProcessor('extra', (k, v, a) => { })
      assert(testAdapter.processors.extra)
      assert.equal(testAdapter.processors.extra.length, 1)
    })
  })
  
  
  describe('#makeQuery', function() {
    
    it('should return a query', function() {
      let q = testAdapter.makeQuery('TestModel')
      assExt.assertClass(q, 'Query')
    })
    
    it('should return a query instance if passed one', function() {
      let q = new Otter.Types.Query()
      let result = testAdapter.makeQuery('TestModel', q)
      assert.equal(result, q)
    })
  })
})
